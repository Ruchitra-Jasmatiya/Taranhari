// =========================================================
// CartContext.jsx - cart + wishlist + coupon state.
// Uses useReducer and saves everything in localStorage so it
// survives a page refresh.
//
// Use it in any component:
//   const { addToCart, cartCount, wishlist, toggleWishlist } = useCart();
// =========================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getSizes } from '../data/products.js';
import { useToast } from '../components/Toast.jsx';
import { useSite } from './SiteContext.jsx';
import { quoteCart, placeOrder as sendOrder } from '../lib/api.js';
import { flyToCart, confettiBurst } from '../lib/effects.js';

// Prices, offers, coupons and delivery are decided by the backend
// (see /api/cart/quote). The numbers below only show while the
// backend cannot be reached.

const STORAGE_KEY = 'taranhari-store-v1';
const CONFETTI_KEY = 'taranhari-confetti-done';

// A cart line is identified by product id + pack size
export const makeKey = (id, size) => `${id}|${size}`;

const emptyState = { items: [], wishlist: [], coupon: null };

// ---------- Reducer ----------
function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { line } = action;
      const exists = state.items.find((i) => i.key === line.key);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === line.key ? { ...i, qty: Math.min(i.qty + (line.qty || 1), 20) } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...line, qty: line.qty || 1 }] };
    }
    case 'SET_QTY': {
      const qty = Math.min(action.qty, 20);
      if (qty <= 0) return { ...state, items: state.items.filter((i) => i.key !== action.key) };
      return { ...state, items: state.items.map((i) => (i.key === action.key ? { ...i, qty } : i)) };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    case 'RESTORE': {
      // Put a removed line back (used by the Undo toast)
      if (state.items.some((i) => i.key === action.line.key)) return state;
      const items = [...state.items];
      const at = Math.min(action.index ?? items.length, items.length);
      items.splice(at, 0, action.line);
      return { ...state, items };
    }
    case 'TOGGLE_WISH': {
      const has = state.wishlist.includes(action.id);
      return {
        ...state,
        wishlist: has ? state.wishlist.filter((w) => w !== action.id) : [...state.wishlist, action.id],
      };
    }
    case 'CLEAR':
      return { ...state, items: [], coupon: null };
    case 'SET_COUPON':
      return { ...state, coupon: action.code };
    default:
      return state;
  }
}

// Read saved state safely (private mode / bad JSON must never crash the app)
function init() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const saved = JSON.parse(raw);
    return {
      items: Array.isArray(saved.items) ? saved.items : [],
      wishlist: Array.isArray(saved.wishlist) ? saved.wishlist : [],
      coupon: typeof saved.coupon === 'string' && saved.coupon ? saved.coupon : null,
    };
  } catch {
    return emptyState;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const toast = useToast();

  // Save on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked - ignore */
    }
  }, [state]);

  // Keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue === null) dispatch({ type: 'CLEAR' });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ----- Actions -----
  // product: a product object. opts: { size: '400 g', fromEl: DOM element for the fly effect, silent: true }
  const addToCart = useCallback(
    (product, opts = {}) => {
      const sizes = getSizes(product);
      const chosen = sizes.find((s) => s.label === opts.size) || sizes.find((s) => s.label === product.weight && s.inStock) || sizes.find((s) => s.inStock);
      if (!chosen || chosen.inStock === false) {
        toast.show(`${product.name} is out of stock right now`, { type: 'error' });
        return;
      }
      const line = {
        key: makeKey(product.id, chosen.label),
        id: product.id,
        name: product.name,
        image: product.image,
        category: product.category,
        veg: product.veg,
        size: chosen.label,
        price: chosen.price,
        mrp: chosen.mrp,
        qty: opts.qty || 1,
      };
      dispatch({ type: 'ADD', line });

      if (opts.fromEl) flyToCart(opts.fromEl);

      // Confetti only the very first time someone adds anything
      let first = false;
      try {
        first = !localStorage.getItem(CONFETTI_KEY);
        if (first) localStorage.setItem(CONFETTI_KEY, '1');
      } catch {
        /* ignore */
      }
      if (first && opts.fromEl) confettiBurst(opts.fromEl);

      if (!opts.silent) toast.show(`${product.name} (${chosen.label}) added to cart`, { type: 'success' });
    },
    [toast]
  );

  const setQty = useCallback((key, qty) => dispatch({ type: 'SET_QTY', key, qty }), []);

  const removeFromCart = useCallback(
    (key) => {
      const index = state.items.findIndex((i) => i.key === key);
      const line = state.items[index];
      if (!line) return;
      dispatch({ type: 'REMOVE', key });
      toast.show(`${line.name} removed`, {
        action: { label: 'Undo', onClick: () => dispatch({ type: 'RESTORE', line, index }) },
      });
    },
    [state.items, toast]
  );

  const toggleWishlist = useCallback(
    (product) => {
      const has = state.wishlist.includes(product.id);
      dispatch({ type: 'TOGGLE_WISH', id: product.id });
      toast.show(has ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`, {
        type: has ? 'info' : 'success',
      });
    },
    [state.wishlist, toast]
  );

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  // Validate a coupon with the backend. Returns Promise<{ ok, message }>
  const applyCoupon = useCallback(
    async (raw) => {
      const code = (raw || '').trim().toUpperCase();
      if (!code) return { ok: false, message: 'Type a coupon code first.' };
      try {
        const q = await quoteCart(
          state.items.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
          code
        );
        if (q.coupon) {
          dispatch({ type: 'SET_COUPON', code: q.coupon.code });
          toast.show(`Coupon ${q.coupon.code} applied`, { type: 'success' });
          return { ok: true, message: q.coupon.label || `${q.coupon.code} applied` };
        }
        toast.show('That coupon cannot be used', { type: 'error' });
        return { ok: false, message: q.couponError || 'Hmm, that code does not work. Check the spelling?' };
      } catch (e) {
        return { ok: false, message: e.message || 'Could not check the coupon. Please try again.' };
      }
    },
    [state.items, toast]
  );

  const removeCoupon = useCallback(() => dispatch({ type: 'SET_COUPON', code: null }), []);

  const getQty = useCallback(
    (key) => state.items.find((i) => i.key === key)?.qty || 0,
    [state.items]
  );

  // ----- Live price check with the backend -----
  const { settings, products: siteProducts, live } = useSite();
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const sig = state.items.map((i) => `${i.key}x${i.qty}`).join(',') + `|${state.coupon || ''}`;
  const stockSig = useRef('');
  stockSig.current = siteProducts.map((p) => `${p.id}${p.price}${p.inStock}`).join('').length + ':' + siteProducts.length;

  useEffect(() => {
    if (state.items.length === 0) {
      setQuote(null);
      return undefined;
    }
    if (!live) {
      setQuote(null);
      return undefined;
    }
    let cancelled = false;
    setQuoting(true);
    const t = setTimeout(async () => {
      try {
        const q = await quoteCart(
          state.items.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
          state.coupon
        );
        if (cancelled) return;
        setQuote(q);
        // A coupon that stopped being valid (expired, min order not met...) is dropped
        if (state.coupon && !q.coupon) {
          dispatch({ type: 'SET_COUPON', code: null });
          if (q.couponError) toast.show(q.couponError, { type: 'info' });
        }
        // Never keep more in the cart than is in stock
        q.lines.forEach((l) => {
          const mine = state.items.find((i) => i.key === l.key);
          if (mine && l.available && l.qty < mine.qty) dispatch({ type: 'SET_QTY', key: l.key, qty: l.qty });
        });
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, live, stockSig.current]);

  // Lines as shown in the cart: backend price/availability when we have it
  const viewItems = useMemo(() => {
    const byKey = new Map((quote?.lines || []).map((l) => [l.key, l]));
    return state.items.map((i) => {
      const l = byKey.get(i.key);
      if (!l) return { ...i, available: true };
      return { ...i, price: l.available ? l.price : i.price, mrp: l.available ? l.mrp : i.mrp, name: l.name || i.name, image: l.image || i.image, available: l.available, issue: l.issue, maxQty: l.maxQty };
    });
  }, [state.items, quote]);

  const freeAt = Number(settings.freeDeliveryAbove) || 0;
  const feeSetting = Number(settings.deliveryFee) || 0;

  const totals = useMemo(() => {
    const cartCount = state.items.reduce((n, i) => n + i.qty, 0);
    if (quote && state.items.length) {
      return {
        cartCount, subtotal: quote.subtotal, mrpTotal: quote.mrpTotal, discount: quote.discount, offer: quote.offer, couponInfo: quote.coupon,
        delivery: quote.delivery, total: quote.total, freeLeft: quote.freeLeft, youSaved: quote.youSaved, tax: quote.tax,
        minOrder: quote.minOrder || 0, acceptingOrders: quote.acceptingOrders !== false, hasUnavailable: quote.lines.some((l) => !l.available),
      };
    }
    // Backend not reachable (or still loading the first answer): simple local totals
    const subtotal = state.items.reduce((n, i) => n + i.price * i.qty, 0);
    const mrpTotal = state.items.reduce((n, i) => n + i.mrp * i.qty, 0);
    const delivery = state.items.length === 0 || subtotal >= freeAt ? 0 : feeSetting;
    return {
      cartCount, subtotal, mrpTotal, discount: 0, offer: null, couponInfo: null, delivery, total: subtotal + delivery,
      freeLeft: Math.max(freeAt - subtotal, 0), youSaved: mrpTotal - subtotal, tax: null, minOrder: 0, acceptingOrders: true, hasUnavailable: false,
    };
  }, [state.items, quote, freeAt, feeSetting]);

  // Send the order to the backend. Throws an Error with a friendly message.
  const checkout = useCallback(
    async (customer, note) => {
      const order = await sendOrder({
        items: state.items.map((i) => ({ id: i.id, size: i.size, qty: i.qty })),
        coupon: state.coupon,
        customer,
        note,
      });
      dispatch({ type: 'CLEAR' });
      return order;
    },
    [state.items, state.coupon]
  );

  const value = useMemo(
    () => ({
      items: viewItems,
      quoting,
      checkout,
      wishlist: state.wishlist,
      coupon: state.coupon,
      wishCount: state.wishlist.length,
      ...totals,
      addToCart,
      setQty,
      removeFromCart,
      toggleWishlist,
      clearCart,
      applyCoupon,
      removeCoupon,
      getQty,
    }),
    [state, viewItems, quoting, checkout, totals, addToCart, setQty, removeFromCart, toggleWishlist, clearCart, applyCoupon, removeCoupon, getQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
