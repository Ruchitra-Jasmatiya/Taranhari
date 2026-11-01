// =========================================================
// Navbar.jsx
//  - Sticky top bar (logo left, wishlist + cart right, live counts)
//  - Desktop: links (Shop, Contact) in the centre
//  - Mobile: bottom tab bar (Home, Shop, Contact, Cart)
// The logo is the way back Home (there is no "Home" link on desktop).
// =========================================================

import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Home, Phone, ShoppingBag, Store } from 'lucide-react';
import Logo from './Logo.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Navbar.css';

// Round count badge that bounces whenever the number changes
function Badge({ n }) {
  if (!n) return null;
  return (
    <motion.span
      key={n}
      className="badge"
      initial={{ scale: 1.9 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
      aria-hidden="true"
    >
      {n > 99 ? '99+' : n}
    </motion.span>
  );
}

export default function Navbar() {
  const { cartCount, wishCount } = useCart();
  const { pathname, search } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const onCart = pathname === '/cart';
  const wishTab = onCart && new URLSearchParams(search).get('tab') === 'wishlist';

  // Shrink the bar a little once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--small' : ''}`}>
        <div className="container nav__bar">
          <div className="nav__logo">
            <Logo />
          </div>

          {/* Desktop centre links */}
          <nav className="nav__links" aria-label="Main">
            <NavLink to="/shop" className="nav__link">Shop</NavLink>
            <NavLink to="/contact" className="nav__link">Contact</NavLink>
          </nav>

          <div className="nav__icons">
            <Link
              to="/cart?tab=wishlist"
              className={`nav__icon ${wishTab ? 'is-active' : ''}`}
              aria-label={`Wishlist, ${wishCount} saved`}
            >
              <Heart size={22} strokeWidth={2.6} />
              <Badge n={wishCount} />
            </Link>
            <Link
              to="/cart"
              className={`nav__icon ${onCart && !wishTab ? 'is-active' : ''}`}
              aria-label={`Cart, ${cartCount} items`}
              data-cart-target
            >
              <ShoppingBag size={22} strokeWidth={2.6} />
              <Badge n={cartCount} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar" aria-label="Quick navigation">
        <NavLink to="/" end className="tab">
          <Home size={22} strokeWidth={2.6} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/shop" className="tab">
          <Store size={22} strokeWidth={2.6} />
          <span>Shop</span>
        </NavLink>
        <NavLink to="/contact" className="tab">
          <Phone size={22} strokeWidth={2.6} />
          <span>Contact</span>
        </NavLink>
        {/* Cart tab is "active" on /cart unless the wishlist tab is showing */}
        <Link to="/cart" className={`tab ${onCart && !wishTab ? 'active' : ''}`} data-cart-target>
          <span className="tab__iconwrap">
            <ShoppingBag size={22} strokeWidth={2.6} />
            <Badge n={cartCount} />
          </span>
          <span>Cart</span>
        </Link>
      </nav>
    </>
  );
}
