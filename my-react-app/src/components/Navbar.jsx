import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, Heart, Home, Menu, Phone, ShoppingBag, Store, Truck, X } from 'lucide-react';
import Logo from './Logo.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useSite } from '../context/SiteContext.jsx';
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
  const { contact: CONTACT, categories, settings } = useSite();
  const CATEGORIES = categories.map((c) => c.name);
  const { pathname, search, hash } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onCart = pathname === '/cart';
  const wishTab = onCart && new URLSearchParams(search).get('tab') === 'wishlist';

  // Which desktop link is "current"
  const active = {
    home: pathname === '/' && !hash,
    shop: pathname === '/shop',
    contact: pathname === '/contact',
  };

  // Small shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, search, hash]);

  const cls = (on) => `nav__link ${on ? 'is-active' : ''}`;

  return (
    <>
      {/* Announcement bar (scrolls away with the page) */}
      <div className="topbar">
        <div className="container topbar__in">
          <p className="topbar__ship">
            <Truck size={16} aria-hidden="true" />{' '}
            {settings.announcement ? settings.announcement : `Free Shipping on Orders Above ₹${settings.freeDeliveryAbove}`}
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
            
            <Link to="/contact" className={cls(active.contact)}>Contact</Link>
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
            
            {/* Mobile 3-line Menu Toggle Button */}
            <button
              type="button"
              className={`nav__icon nav__menuToggle ${mobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown / Drawer Menu for the 3 links */}
        {mobileMenuOpen && (
          <motion.div 
            className="nav__mobileDropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="container nav__mobileDropdownIn">
              <Link to="/" className={`nav__mobileLink ${active.home ? 'is-active' : ''}`}>
                Home
              </Link>
              <Link to="/shop" className={`nav__mobileLink ${active.shop ? 'is-active' : ''}`}>
                Our Products
              </Link>
              <Link to="/contact" className={`nav__mobileLink ${active.contact ? 'is-active' : ''}`}>
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar" aria-label="Quick navigation">
        <Link to="/" className={`tab ${active.home ? 'active' : ''}`}>
          <Home size={22} strokeWidth={2.4} />
          <span>Home</span>
        </Link>
        <Link to="/shop" className={`tab ${active.shop ? 'active' : ''}`}>
          <Store size={22} strokeWidth={2.4} />
          <span>Products</span>
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