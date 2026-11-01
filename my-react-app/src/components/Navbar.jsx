
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Heart, Home, Phone, ShoppingBag, Store, Truck } from 'lucide-react';
import Logo from './Logo.jsx';
import { FREE_DELIVERY_AT, useCart } from '../context/CartContext.jsx';
import { CONTACT } from '../pages/Contact.jsx';
import { CATEGORIES } from '../data/products.js';
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
  const { pathname, search, hash } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const onCart = pathname === '/cart';
  const wishTab = onCart && new URLSearchParams(search).get('tab') === 'wishlist';

  // Which desktop link is "current"
  const active = {
    home: pathname === '/' && !hash,
    shop: pathname === '/shop',
    about: pathname === '/' && hash === '#about',
    promise: pathname === '/' && hash === '#promise',
    contact: pathname === '/contact',
  };

  // Small shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cls = (on) => `nav__link ${on ? 'is-active' : ''}`;

  return (
    <>
      {/* Announcement bar (scrolls away with the page) */}
      <div className="topbar">
        <div className="container topbar__in">
          <p className="topbar__ship">
            <Truck size={16} aria-hidden="true" /> Free Shipping on Orders Above ₹{FREE_DELIVERY_AT}
          </p>
          <div className="topbar__right">
            <Link to="/contact">Contact</Link>
            <span aria-hidden="true" className="topbar__sep" />
            <a href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phoneDisplay}</a>
          </div>
        </div>
      </div>

      <header className={`nav ${scrolled ? 'nav--small' : ''}`}>
        <div className="container nav__bar">
          <div className="nav__logo">
            <Logo />
          </div>

          {/* Desktop centre links */}
          <nav className="nav__links" aria-label="Main">
            <Link to="/" className={cls(active.home)}>Home</Link>

            <div className="nav__menuWrap">
              <Link to="/shop" className={cls(active.shop)}>
                Our Products <ChevronDown size={16} strokeWidth={3} aria-hidden="true" />
              </Link>
              <ul className="nav__menu">
                <li><Link to="/shop">All snacks</Link></li>
                {CATEGORIES.map((c) => (
                  <li key={c}><Link to={`/shop?cat=${encodeURIComponent(c)}`}>{c}</Link></li>
                ))}
              </ul>
            </div>
            
            <Link to="/#about" className={cls(active.about)}>About Us</Link>
            <Link to="/#promise" className={cls(active.promise)}>Our Promise</Link>
            <Link to="/contact" className={cls(active.contact)}>Contact Us</Link>
          </nav>

          <div className="nav__icons">
            <Link
              to="/cart?tab=wishlist"
              className={`nav__icon ${wishTab ? 'is-active' : ''}`}
              aria-label={`Wishlist, ${wishCount} saved`}
            >
              <Heart size={22} strokeWidth={2.2} />
              <Badge n={wishCount} />
            </Link>
            <Link
              to="/cart"
              className={`nav__icon ${onCart && !wishTab ? 'is-active' : ''}`}
              aria-label={`Cart, ${cartCount} items`}
              data-cart-target
            >
              <ShoppingBag size={22} strokeWidth={2.2} />
              <Badge n={cartCount} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar" aria-label="Quick navigation">
        <Link to="/" className={`tab ${active.home ? 'active' : ''}`}>
          <Home size={22} strokeWidth={2.4} />
          <span>Home</span>
        </Link>
        <Link to="/shop" className={`tab ${active.shop ? 'active' : ''}`}>
          <Store size={22} strokeWidth={2.4} />
          <span>Shop</span>
        </Link>
        <Link to="/contact" className={`tab ${active.contact ? 'active' : ''}`}>
          <Phone size={22} strokeWidth={2.4} />
          <span>Contact</span>
        </Link>
        <Link to="/cart" className={`tab ${onCart && !wishTab ? 'active' : ''}`} data-cart-target>
          <span className="tab__iconwrap">
            <ShoppingBag size={22} strokeWidth={2.4} />
            <Badge n={cartCount} />
          </span>
          <span>Cart</span>
        </Link>
      </nav>
    </>
  );
}
