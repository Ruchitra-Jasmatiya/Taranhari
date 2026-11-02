import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { THEMES, getTheme, setTheme } from '../lib/theme.js';
import './Footer.css';

export default function Footer() {
  const { contact: CONTACT, settings } = useSite();
  const [theme, setThemeState] = useState(getTheme());
  const year = new Date().getFullYear();

  const pick = (id) => {
    setTheme(id);
    setThemeState(id);
  };

  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;

  return (
    <footer className="footer">
      <div className="container footer__grid">
        {/* Left Brand Section */}
        <div className="footer__brand">
          <Logo size="md" />
          <p className="footer__tag">
            {settings.tagline || 'Ek baar khao, baar baar maango. Fresh namkeen and snacks, made daily.'}
          </p>
          <ul className="footer__social" aria-label="Social media">
            {CONTACT.instagram && (
              <li>
                <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
              </li>
            )}
            {CONTACT.facebook && (
              <li>
                <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
              </li>
            )}
            {CONTACT.youtube && (
              <li>
                <a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
              </li>
            )}
            {CONTACT.whatsapp && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <MessageCircle size={20} />
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Navigation Links Column */}
        <nav className="footer__col" aria-label="Quick links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Our Products</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </nav>

        {/* Account / Utilities Column */}
        <nav className="footer__col" aria-label="Account and Cart">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/cart">Your Cart</Link></li>
            <li><Link to="/cart?tab=wishlist">Wishlist</Link></li>
          </ul>
        </nav>

        {/* Say Hello Section */}
        <div className="footer__col">
          <h3>Say Hello</h3>
          <ul className="footer__contact">
            {CONTACT.phoneTel && (
              <li>
                <a href={`tel:${CONTACT.phoneTel}`}>
                  <Phone size={18} aria-hidden="true" /> {CONTACT.phoneDisplay}
                </a>
              </li>
            )}
            {CONTACT.email && (
              <li>
                <a href={`mailto:${CONTACT.email}`}>
                  <Mail size={18} aria-hidden="true" /> {CONTACT.email}
                </a>
              </li>
            )}
            {CONTACT.addressShort && (
              <li>
                <span>
                  <MapPin size={18} aria-hidden="true" /> {CONTACT.addressShort}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="container footer__bottom">
        <p>
          &copy; {year} Taran Hari. All rights reserved. &middot; <Link to="/privacy">Privacy</Link> &middot; <Link to="/terms">Terms</Link> &middot; <Link to="/refund">Refunds &amp; delivery</Link>
        </p>

        {/* Theme switcher */}
        {THEMES && THEMES.length > 0 && (
          <div className="footer__themes" role="group" aria-label="Try a colour theme">
            <span>Theme:</span>
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`footer__theme ${theme === t.id ? 'is-on' : ''}`}
                onClick={() => pick(t.id)}
                aria-pressed={theme === t.id}
                title={t.name}
              >
                {t.id}
              </button>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}