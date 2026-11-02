
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from 'lucide-react';
import Logo from './Logo.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { THEMES, getTheme, setTheme } from '../lib/theme.js';
import './Footer.css';

export default function Footer() {
  const { contact: CONTACT, categories, settings } = useSite();
  const CATEGORIES = categories.map((c) => c.name);
  const [theme, setThemeState] = useState(getTheme());
  const year = new Date().getFullYear();

  const pick = (id) => {
    setTheme(id);
    setThemeState(id);
  };

  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;

  return (
    <footer className="footer band-ink">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo size="md" />
          <p className="footer__tag">{settings.tagline || 'Ek baar khao, baar baar maango'}. Fresh namkeen and snacks, made daily.</p>
          <ul className="footer__social" aria-label="Social media">
            <li>
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={22} />
              </a>
            </li>
            <li>
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={22} />
              </a>
            </li>
            {CONTACT.youtube && (
              <li>
                <a href={CONTACT.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <Youtube size={22} />
                </a>
              </li>
            )}
            <li>
              <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle size={22} />
              </a>
            </li>
          </ul>
        </div>

        <nav className="footer__col" aria-label="Shop categories">
          <h3>Shop</h3>
          <ul>
            <li><Link to="/shop">All snacks</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link to={`/shop?cat=${encodeURIComponent(c)}`}>{c}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label="Help">
          <h3>Help</h3>
          <ul>
            <li><Link to="/cart">Your cart</Link></li>
            <li><Link to="/cart?tab=wishlist">Wishlist</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
            <li><Link to="/">Our story</Link></li>
          </ul>
        </nav>

        <div className="footer__col">
          <h3>Say hello</h3>
          <ul className="footer__contact">
            <li>
              <a href={`tel:${CONTACT.phoneTel}`}>
                <Phone size={18} aria-hidden="true" /> {CONTACT.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`}>
                <Mail size={18} aria-hidden="true" /> {CONTACT.email}
              </a>
            </li>
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

      <div className="container footer__bottom">
        <p>&copy; {year} Taran Hari. All rights reserved.</p>

        {/* Theme switcher - remove once you have picked a theme */}
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
      </div>
    </footer>
  );
}
