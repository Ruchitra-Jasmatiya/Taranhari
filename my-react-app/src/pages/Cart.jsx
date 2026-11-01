// =========================================================
// Cart.jsx - Cart tab + Wishlist tab (chosen by ?tab=wishlist).
// Cart: line items, quantity, remove with Undo toast, coupon,
// free-delivery progress bar, sticky mobile summary + Checkout.
// Wishlist: saved items, Move to Cart, Remove.
// Checkout is a placeholder until the backend is connected.
// =========================================================

import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgePercent, Heart, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import Img from '../components/Img.jsx';
import Stepper from '../components/Stepper.jsx';
import BottomSheet from '../components/BottomSheet.jsx';
import { VegDot } from '../components/ProductCard.jsx';
import { COUPONS, FREE_DELIVERY_AT, useCart } from '../context/CartContext.jsx';
import { products } from '../data/products.js';
import './Cart.css';

export default function Cart() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'wishlist' ? 'wishlist' : 'cart';
  const cart = useCart();
  const { items, wishlist, cartCount, wishCount } = cart;

  const setTab = (t) => setParams(t === 'wishlist' ? { tab: 'wishlist' } : {}, { replace: true });

  return (
    <div className="cartpage">
      <section className="cartpage__head band-accent">
        <div className="container">
          <h1>{tab === 'cart' ? 'Your Cart' : 'Your Wishlist'}</h1>
          <div className="ctabs" role="tablist" aria-label="Cart or wishlist">
            <button type="button" role="tab" aria-selected={tab === 'cart'} className={`ctab ${tab === 'cart' ? 'is-on' : ''}`} onClick={() => setTab('cart')}>
              <ShoppingBag size={18} strokeWidth={3} aria-hidden="true" /> Cart <span className="ctab__n">{cartCount}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === 'wishlist'} className={`ctab ${tab === 'wishlist' ? 'is-on' : ''}`} onClick={() => setTab('wishlist')}>
              <Heart size={18} strokeWidth={3} aria-hidden="true" /> Wishlist <span className="ctab__n">{wishCount}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="section cartpage__body band-paper">
        <div className="container">
          {tab === 'cart' ? <CartTab cart={cart} /> : <WishTab cart={cart} />}
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------- */
function CartTab({ cart }) {
  const { items, subtotal, discount, delivery, total, freeLeft, youSaved, coupon, setQty, removeFromCart, applyCoupon, removeCoupon, clearCart } = cart;
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null); // { ok, message }
  const [checkout, setCheckout] = useState(false);

  const progress = Math.min(100, Math.round(((subtotal - discount) / FREE_DELIVERY_AT) * 100));

  if (items.length === 0) {
    return (
      <div className="cempty sticker">
        <EmptyBag />
        <h2>Cart khaali hai!</h2>
        <p>Even the crunchiest snack cannot jump in by itself. Let us fill this bag with something tasty.</p>
        <Link to="/shop" className="btn btn--lg">Start Shopping</Link>
      </div>
    );
  }

  const submitCoupon = (e) => {
    e.preventDefault();
    setMsg(applyCoupon(code));
    if (COUPONS[code.trim().toUpperCase()]) setCode('');
  };

  return (
    <div className="clayout">
      <div className="clayout__lines">
        <ul className="lines">
          <AnimatePresence initial={false}>
            {items.map((it) => (
              <motion.li
                key={it.key}
                layout
                className="line sticker"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="line__img"><Img src={it.image} alt={it.name} compact /></div>
                <div className="line__info">
                  <h3 className="line__name"><VegDot veg={it.veg} /> {it.name}</h3>
                  <p className="line__meta">{it.size} &middot; ₹{it.price} each</p>
                  <div className="line__ctrl">
                    <Stepper qty={it.qty} onChange={(n) => (n <= 0 ? removeFromCart(it.key) : setQty(it.key, n))} label={it.name} size="sm" />
                    <strong className="line__total">₹{it.price * it.qty}</strong>
                  </div>
                </div>
                <button type="button" className="line__rm icon-btn" onClick={() => removeFromCart(it.key)} aria-label={`Remove ${it.name}`}>
                  <Trash2 size={18} strokeWidth={2.6} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <button type="button" className="clearbtn" onClick={clearCart}>Clear whole cart</button>
      </div>

      <aside className="summary sticker" aria-label="Order summary">
        <h2>Order summary</h2>

        {/* Free delivery progress */}
        <div className="free">
          <p className="free__txt">
            <Truck size={18} aria-hidden="true" />
            {freeLeft > 0 ? <>Add <strong>₹{freeLeft}</strong> more for free delivery</> : <strong>Free delivery unlocked!</strong>}
          </p>
          <div className="free__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress to free delivery">
            <motion.span className="free__fill" initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </div>

        {/* Coupon */}
        <div className="coupon">
          {coupon ? (
            <div className="coupon__on">
              <BadgePercent size={20} aria-hidden="true" />
              <span><strong>{coupon}</strong> applied</span>
              <button type="button" className="coupon__x" onClick={() => { removeCoupon(); setMsg(null); }} aria-label="Remove coupon"><X size={18} strokeWidth={3} /></button>
            </div>
          ) : (
            <form onSubmit={submitCoupon} className="coupon__form">
              <label htmlFor="coupon" className="sr-only">Coupon code</label>
              <input id="coupon" value={code} onChange={(e) => { setCode(e.target.value); setMsg(null); }} placeholder="Coupon code (try TARAN10)" autoCapitalize="characters" autoComplete="off" />
              <button type="submit" className="btn btn--ink">Apply</button>
            </form>
          )}
          {msg && <p className={`coupon__msg ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.message}</p>}
        </div>

        <dl className="totals">
          <div><dt>Subtotal</dt><dd>₹{subtotal}</dd></div>
          {discount > 0 && <div className="totals__disc"><dt>Coupon discount</dt><dd>- ₹{discount}</dd></div>}
          <div><dt>Delivery</dt><dd>{delivery === 0 ? 'FREE' : `₹${delivery}`}</dd></div>
          <div className="totals__grand"><dt>Total</dt><dd>₹{total}</dd></div>
        </dl>
        {youSaved > 0 && <p className="saved">You are saving ₹{youSaved} on this order!</p>}

        {/* On mobile this block sticks to the bottom above the tab bar */}
        <div className="summary__cta">
          <div className="summary__mini"><span>Total</span><strong>₹{total}</strong></div>
          <button type="button" className="btn btn--lg" onClick={() => setCheckout(true)}>Checkout</button>
        </div>
      </aside>

      <BottomSheet
        open={checkout}
        onClose={() => setCheckout(false)}
        title="Checkout"
        footer={<button type="button" className="btn" onClick={() => setCheckout(false)}>Okay, got it</button>}
      >
        <div className="soon">
          <EmptyBag />
          <h3>Checkout is coming soon!</h3>
          <p>We are connecting payments right now. Your cart of <strong>₹{total}</strong> is saved here, and nothing is lost if you refresh.</p>
          {/* TODO (backend later): collect address, create the order, take payment. */}
        </div>
      </BottomSheet>
    </div>
  );
}

/* ---------------------------------------------------------- */
function WishTab({ cart }) {
  const { wishlist, addToCart, toggleWishlist } = cart;
  const saved = useMemo(() => products.filter((p) => wishlist.includes(p.id)), [wishlist]);

  if (saved.length === 0) {
    return (
      <div className="cempty sticker">
        <Heart size={72} strokeWidth={2.2} aria-hidden="true" className="cempty__heart" />
        <h2>No favourites yet</h2>
        <p>Tap the little heart on any snack to save it here for later.</p>
        <Link to="/shop" className="btn btn--lg">Browse snacks</Link>
      </div>
    );
  }

  return (
    <ul className="wgrid">
      <AnimatePresence initial={false}>
        {saved.map((p) => (
          <motion.li
            key={p.id}
            layout
            className="wcard sticker"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.28 }}
          >
            <div className="wcard__img"><Img src={p.image} alt={p.name} /></div>
            <div className="wcard__body">
              <h3><VegDot veg={p.veg} /> {p.name}</h3>
              <p className="wcard__meta">{p.weight} &middot; <strong>₹{p.price}</strong></p>
              <div className="wcard__btns">
                <button
                  type="button"
                  className="btn"
                  onClick={(e) => {
                    addToCart(p, { fromEl: e.currentTarget });
                    toggleWishlist(p);
                  }}
                >
                  Move to Cart
                </button>
                <button type="button" className="btn btn--paper" onClick={() => toggleWishlist(p)}>Remove</button>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

// Flat illustration of an empty shopping bag (no gradients)
function EmptyBag() {
  return (
    <svg className="bag" viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <path d="M26 42h68l6 62a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M40 48V34a20 20 0 0 1 40 0v14" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="46" cy="72" r="5" fill="var(--ink)" />
      <circle cx="74" cy="72" r="5" fill="var(--ink)" />
      <path d="M46 90q14 -12 28 0" fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
