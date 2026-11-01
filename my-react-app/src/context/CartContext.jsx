// =========================================================
// CartContext.jsx - cart + wishlist + coupon state.
// Uses useReducer and saves everything in localStorage so it
// survives a page refresh.
//
// Use it in any component:
//   const { addToCart, cartCount, wishlist, toggleWishlist } = useCart();
// =========================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { getSizes } from '../data/products.js';
import { useToast } from '../components/Toast.jsx';
import { flyToCart, confettiBurst } from '../lib/effects.js';

// ---------- Business rules (edit freely) ----------
export const FREE_DELIVERY_AT = 499; // ₹ - delivery is free above this
export const DELIVERY_FEE = 49; // ₹ - charged below the limit
export const COUPONS = {
  // code: { percent off }
  TARAN10: { percent: 10, label: '10% off your order' },
  CRUNCH15: { percent: 15, label: '15% off your order' },
};

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
      coupon: saved.coupon && COUPONS[saved.coupon] ? saved.coupon : null,
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
      const chosen = sizes.find((s) => s.label === opts.size) || sizes.find((s) => s.label === product.weight);
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

  // Returns { ok: boolean, message: string }
  const applyCoupon = useCallback(
    (raw) => {
      const code = (raw || '').trim().toUpperCase();
      if (!code) return { ok: false, message: 'Type a coupon code first.' };
      if (!COUPONS[code]) {
        toast.show('That coupon code is not valid', { type: 'error' });
        return { ok: false, message: 'Hmm, that code does not work. Check the spelling?' };
      }
      dispatch({ type: 'SET_COUPON', code });
      toast.show(`Coupon ${code} applied`, { type: 'success' });
      return { ok: true, message: `${code} applied: ${COUPONS[code].label}` };
    },
    [toast]
  );

  const removeCoupon = useCallback(() => dispatch({ type: 'SET_COUPON', code: null }), []);

  const getQty = useCallback(
    (key) => state.items.find((i) => i.key === key)?.qty || 0,
    [state.items]
  );

  // ----- Derived numbers -----
  const totals = useMemo(() => {
    const cartCount = state.items.reduce((n, i) => n + i.qty, 0);
    const subtotal = state.items.reduce((n, i) => n + i.price * i.qty, 0);
    const mrpTotal = state.items.reduce((n, i) => n + i.mrp * i.qty, 0);
    const percent = state.coupon ? COUPONS[state.coupon].percent : 0;
    const discount = Math.round((subtotal * percent) / 100);
    const afterDiscount = subtotal - discount;
    const delivery = state.items.length === 0 || afterDiscount >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
    const total = afterDiscount + delivery;
    const freeLeft = Math.max(FREE_DELIVERY_AT - afterDiscount, 0);
    const youSaved = mrpTotal - subtotal + discount;
    return { cartCount, subtotal, mrpTotal, discount, delivery, total, freeLeft, youSaved };
  }, [state.items, state.coupon]);

  const value = useMemo(
    () => ({
      items: state.items,
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
    [state, totals, addToCart, setQty, removeFromCart, toggleWishlist, clearCart, applyCoupon, removeCoupon, getQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
