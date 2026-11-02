// =========================================================
// QuickView.jsx - product details in a bottom sheet (phones) or
// modal (desktop): big photo, description, size choice, add button.
// =========================================================

import { useEffect, useRef, useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import BottomSheet from './BottomSheet.jsx';
import Img from './Img.jsx';
import Stars from './Stars.jsx';
import Stepper from './Stepper.jsx';
import { VegDot } from './ProductCard.jsx';
import { useCart, makeKey } from '../context/CartContext.jsx';
import { getSizes, percentOff } from '../data/products.js';
import './QuickView.css';

export default function QuickView({ product, onClose }) {
  const { addToCart, setQty, getQty, wishlist, toggleWishlist } = useCart();
  const [size, setSize] = useState(null);
  const addRef = useRef(null);

  // Reset to the product's default pack whenever a new product opens
  useEffect(() => {
    if (product) setSize(product.weight);
  }, [product]);

  // Keep the last product while the sheet animates closed
  const [shown, setShown] = useState(product);
  useEffect(() => {
    if (product) setShown(product);
  }, [product]);

  const p = shown;
  if (!p) return <BottomSheet open={false} onClose={onClose} title="" />;

  const sizes = getSizes(p);
  const chosen = sizes.find((s) => s.label === size) || sizes.find((s) => s.inStock) || sizes[0];
  const key = makeKey(p.id, chosen.label);
  const qty = getQty(key);
  const wished = wishlist.includes(p.id);
  const off = percentOff(chosen.price, chosen.mrp);

  return (
    <BottomSheet open={!!product} onClose={onClose} title={p.name} size="lg">
      <div className="qv">
        <div className="qv__media sticker">
          <Img src={p.image} alt={`${p.name} pack`} />
          {off > 0 && <span className="qv__off">{off}% OFF</span>}
        </div>

        <div className="qv__info">
          <div className="qv__meta">
            <VegDot veg={p.veg} />
            <span className="tag">{p.category}</span>
            <span className="tag">{p.spice} spice</span>
          </div>

          <Stars value={p.rating} count={p.reviews} />
          <p className="qv__desc">{p.description}</p>

          <fieldset className="qv__sizes">
            <legend>Choose pack size</legend>
            <div className="qv__chips">
              {sizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`chip ${s.label === chosen.label ? 'is-on' : ''} ${s.inStock ? '' : 'is-out'}`}
                  onClick={() => setSize(s.label)}
                  aria-pressed={s.label === chosen.label}
                >
                  <strong>{s.label}</strong>
                  <span>{s.inStock ? `₹${s.price}` : 'Sold out'}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <p className="qv__price">
            <strong>₹{chosen.price}</strong>
            {chosen.mrp > chosen.price && <s>₹{chosen.mrp}</s>}
          </p>

          {chosen.inStock && chosen.left > 0 && <p className="qv__left">Hurry, only {chosen.left} left in this pack!</p>}

          <div className="qv__actions">
            {!chosen.inStock ? (
              <button type="button" className="btn btn--lg qv__add" disabled>Out of stock</button>
            ) : qty === 0 ? (
              <button
                type="button"
                ref={addRef}
                className="btn btn--lg qv__add"
                onClick={() => addToCart(p, { size: chosen.label, fromEl: addRef.current })}
              >
                <ShoppingBag size={20} strokeWidth={3} aria-hidden="true" /> Add to Cart
              </button>
            ) : (
              <Stepper qty={qty} onChange={(n) => setQty(key, n)} label={`${p.name} ${chosen.label}`} size="block" />
            )}
            <button
              type="button"
              className={`icon-btn qv__heart ${wished ? 'is-on' : ''}`}
              onClick={() => toggleWishlist(p)}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={22} strokeWidth={2.6} fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
