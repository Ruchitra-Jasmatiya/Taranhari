

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgePercent, Heart, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import Img from '../components/Img.jsx';
import Stepper from '../components/Stepper.jsx';
import BottomSheet from '../components/BottomSheet.jsx';
import { VegDot } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
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
  const { items, subtotal, discount, offer, couponInfo, delivery, total, freeLeft, youSaved, coupon, setQty, removeFromCart, applyCoupon, removeCoupon, clearCart, hasUnavailable, acceptingOrders, minOrder } = cart;
  const { settings } = useSite();
  const FREE_DELIVERY_AT = Number(settings.freeDeliveryAbove) || 0;
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState(null); // { ok, message }
  const [checkout, setCheckout] = useState(false);
  const [done, setDone] = useState(null); // lives here so it survives the cart emptying

  const progress = Math.min(100, FREE_DELIVERY_AT ? Math.round(((subtotal - discount) / FREE_DELIVERY_AT) * 100) : 100);

  if (items.length === 0) {
    return (
      <>
        <div className="cempty sticker">
          <EmptyBag />
          <h2>Cart khaali hai!</h2>
          <p>Even the crunchiest snack cannot jump in by itself. Let us fill this bag with something tasty.</p>
          <Link to="/shop" className="btn btn--lg">Start Shopping</Link>
        </div>
        {/* stays mounted so the customer still sees "Order placed" after the cart empties */}
        <CheckoutSheet open={checkout} onClose={() => setCheckout(false)} cart={cart} done={done} setDone={setDone} />
      </>
    );
  }

  const submitCoupon = async (e) => {
    e.preventDefault();
    const r = await applyCoupon(code);
    setMsg(r);
    if (r.ok) setCode('');
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
                  {it.available === false && <p className="line__meta" style={{ color: 'var(--brand)', fontWeight: 800 }}>{it.issue || 'Not available'} &ndash; please remove it</p>}
                  <div className="line__ctrl">
                    <Stepper qty={it.qty} max={it.maxQty} onChange={(n) => (n <= 0 ? removeFromCart(it.key) : setQty(it.key, n))} label={it.name} size="sm" />
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
              <span><strong>{coupon}</strong> applied{couponInfo?.amount ? ` (saves ₹${couponInfo.amount})` : ''}</span>
              <button type="button" className="coupon__x" onClick={() => { removeCoupon(); setMsg(null); }} aria-label="Remove coupon"><X size={18} strokeWidth={3} /></button>
            </div>
          ) : (
            <form onSubmit={submitCoupon} className="coupon__form">
              <label htmlFor="coupon" className="sr-only">Coupon code</label>
              <input id="coupon" value={code} onChange={(e) => { setCode(e.target.value); setMsg(null); }} placeholder="Coupon code" autoCapitalize="characters" autoComplete="off" />
              <button type="submit" className="btn btn--ink">Apply</button>
            </form>
          )}
          {msg && <p className={`coupon__msg ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.message}</p>}
        </div>

        <dl className="totals">
          <div><dt>Subtotal</dt><dd>₹{subtotal}</dd></div>
          {offer && <div className="totals__disc"><dt>{offer.name}</dt><dd>- ₹{offer.amount}</dd></div>}
          {couponInfo && <div className="totals__disc"><dt>Coupon {couponInfo.code}</dt><dd>- ₹{couponInfo.amount}</dd></div>}
          <div><dt>Delivery</dt><dd>{delivery === 0 ? 'FREE' : `₹${delivery}`}</dd></div>
          <div className="totals__grand"><dt>Total</dt><dd>₹{total}</dd></div>
        </dl>
        {youSaved > 0 && <p className="saved">You are saving ₹{youSaved} on this order!</p>}
        {!acceptingOrders && <p className="coupon__msg bad">We are not taking orders right now. Please check back soon.</p>}
        {acceptingOrders && minOrder > subtotal && <p className="coupon__msg bad">Minimum order is ₹{minOrder}. Add ₹{minOrder - subtotal} more.</p>}
        {hasUnavailable && <p className="coupon__msg bad">Remove the unavailable item(s) to continue.</p>}

        {/* On mobile this block sticks to the bottom above the tab bar */}
        <div className="summary__cta">
          <div className="summary__mini"><span>Total</span><strong>₹{total}</strong></div>
          <button type="button" className="btn btn--lg" disabled={hasUnavailable || !acceptingOrders || subtotal < minOrder} onClick={() => setCheckout(true)}>Checkout</button>
        </div>
      </aside>

      <CheckoutSheet open={checkout} onClose={() => setCheckout(false)} cart={cart} done={done} setDone={setDone} />
    </div>
  );
}

/* ---------------------------------------------------------- */
function WishTab({ cart }) {
  const { wishlist, addToCart, toggleWishlist } = cart;
  const { products } = useSite();
  const saved = useMemo(() => products.filter((p) => wishlist.includes(p.id)), [wishlist, products]);

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

/* ---------------------------------------------------------- */
const FORM_KEY = 'taranhari-customer';
function CheckoutSheet({ open, onClose, cart, done, setDone }) {
  const { total, subtotal, discount, delivery, checkout } = cart;
  const [f, setF] = useState(() => {
    try { return { name: '', phone: '', address: '', city: '', pincode: '', note: '', ...JSON.parse(localStorage.getItem(FORM_KEY) || '{}') }; } catch { return { name: '', phone: '', address: '', city: '', pincode: '', note: '' }; }
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [trap, setTrap] = useState(''); // hidden field: real people never fill it
  const openedAt = useRef(Date.now());
  useEffect(() => { if (open) openedAt.current = Date.now(); }, [open]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const { note, ...customer } = f;
      try { localStorage.setItem(FORM_KEY, JSON.stringify({ name: f.name, phone: f.phone, address: f.address, city: f.city, pincode: f.pincode })); } catch { /* ignore */ }
      const order = await checkout(customer, note, { website: trap, elapsed: Date.now() - openedAt.current });
      setDone(order);
    } catch (ex) {
      setErr(ex.message || 'Could not place the order. Please try again.');
    } finally { setBusy(false); }
  };
  const close = () => { onClose(); setTimeout(() => setDone(null), 300); };

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={done ? 'Order placed' : 'Checkout'}
      footer={done ? <Link to="/shop" className="btn" onClick={close}>Continue shopping</Link> : <button type="submit" form="checkout-form" className="btn btn--lg" disabled={busy}>{busy ? 'Placing order…' : `Place order · ₹${total}`}</button>}
    >
      {done ? (
        <div className="soon">
          <CheckCircle2 size={72} strokeWidth={2.2} aria-hidden="true" />
          <h3>Thank you, {done.customer?.name}!</h3>
          <p>Your order number is <strong>{done.number}</strong>. Total to pay on delivery: <strong>₹{done.total}</strong>. We will call you shortly to confirm.</p>
        </div>
      ) : (
        <form id="checkout-form" onSubmit={submit} className="cofm" style={{ display: 'grid', gap: 12 }}>
          <label>Your name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Phone number<input required type="tel" inputMode="numeric" value={f.phone} onChange={set('phone')} autoComplete="tel" placeholder="10-digit mobile number" /></label>
          <label>Full delivery address<textarea required rows={3} value={f.address} onChange={set('address')} autoComplete="street-address" /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>City<input value={f.city} onChange={set('city')} autoComplete="address-level2" /></label>
            <label>Pincode<input inputMode="numeric" maxLength={6} value={f.pincode} onChange={set('pincode')} autoComplete="postal-code" /></label>
          </div>
          <label>Note (optional)<input value={f.note} onChange={set('note')} placeholder="Any request for us?" /></label>
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
            <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" /></label>
          </div>
          <p className="saved" style={{ margin: 0 }}>Subtotal ₹{subtotal}{discount > 0 ? ` · Discount −₹${discount}` : ''} · Delivery {delivery === 0 ? 'FREE' : `₹${delivery}`} · <strong>Pay ₹{total} cash on delivery</strong></p>
          {err && <p className="coupon__msg bad" role="alert">{err}</p>}
        </form>
      )}
    </BottomSheet>
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