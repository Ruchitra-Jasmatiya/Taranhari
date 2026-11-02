

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import Img from './Img.jsx';
import Stars from './Stars.jsx';
import Stepper from './Stepper.jsx';
import { useCart, makeKey } from '../context/CartContext.jsx';
import { getSizes, percentOff } from '../data/products.js';
import './ProductCard.css';

// Green square with a dot = vegetarian (Indian food-label convention)
export function VegDot({ veg = true }) {
  return (
    <span className={`vegdot ${veg ? '' : 'vegdot--non'}`} role="img" aria-label={veg ? 'Vegetarian' : 'Non-vegetarian'}>
      <span />
    </span>
  );
}

export default function ProductCard({ product, onOpen, compact = false }) {
  const { addToCart, setQty, getQty, wishlist, toggleWishlist } = useCart();
  const addRef = useRef(null);

  // Show the default pack, or the first pack that is still in stock
  const sizes = getSizes(product);
  const def = sizes.find((x) => x.label === product.weight && x.inStock) || sizes.find((x) => x.inStock) || sizes.find((x) => x.label === product.weight) || sizes[0];
  const soldOut = !def || !def.inStock;
  const shownSize = def?.label ?? product.weight;
  const shownPrice = def?.price ?? product.price;
  const shownMrp = def?.mrp ?? product.mrp;
  const key = makeKey(product.id, shownSize);
  const qty = getQty(key);
  const wished = wishlist.includes(product.id);
  const off = percentOff(shownPrice, shownMrp);

  return (
    <article className={`pcard sticker ${compact ? 'pcard--compact' : ''}`}>
      <div className="pcard__media">
        <button
          type="button"
          className="pcard__open"
          onClick={() => onOpen?.(product)}
          aria-label={`Quick view: ${product.name}`}
        >
          <Img src={product.image} alt={`${product.name} pack`} />
        </button>

        {soldOut ? <span className="pcard__off pcard__off--sold">SOLD OUT</span> : off > 0 && <span className="pcard__off">{off}% OFF</span>}

        <motion.button
          type="button"
          className={`pcard__heart ${wished ? 'is-on' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          whileTap={{ scale: 0.8 }}
        >
          {/* key change replays the pop animation each toggle */}
          <motion.span
            key={String(wished)}
            initial={{ scale: wished ? 0.4 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 12 }}
            style={{ display: 'grid' }}
          >
            <Heart size={20} strokeWidth={2.6} fill={wished ? 'currentColor' : 'none'} />
          </motion.span>
        </motion.button>
      </div>

      <div className="pcard__body">
        <div className="pcard__top">
          <VegDot veg={product.veg} />
          <span className="pcard__weight">{shownSize}</span>
          <span className={`pcard__spice spice--${product.spice.toLowerCase()}`}>{product.spice}</span>
        </div>

        <h3 className="pcard__name">
          <button type="button" onClick={() => onOpen?.(product)}>{product.name}</button>
        </h3>

        <Stars value={product.rating} count={product.reviews} size={15} />

        <p className="pcard__price">
          <strong>₹{shownPrice}</strong>
          {shownMrp > shownPrice && <s>₹{shownMrp}</s>}
        </p>
        {!soldOut && def?.left > 0 && <p className="pcard__left">Only {def.left} left!</p>}

        <div className="pcard__cta">
          {soldOut ? (
            <button type="button" className="btn btn--block" disabled onClick={() => onOpen?.(product)}>Out of stock</button>
          ) : qty === 0 ? (
            <button
              type="button"
              ref={addRef}
              className="btn btn--block"
              onClick={() => addToCart(product, { size: shownSize, fromEl: addRef.current })}
            >
              <ShoppingBag size={18} strokeWidth={3} aria-hidden="true" /> Add to Cart
            </button>
          ) : (
            <Stepper
              qty={qty}
              onChange={(n) => setQty(key, n)}
              label={product.name}
              size="block"
            />
          )}
        </div>
      </div>
    </article>
  );
}
