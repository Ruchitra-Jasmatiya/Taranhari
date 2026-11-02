// =========================================================
// Seo.jsx - sets the page title, description, canonical link and
// Google "business" data (JSON-LD) for every page. Renders nothing.
// =========================================================
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';

const PAGES = {
  '/': ['Taran Hari | Fresh Namkeen, Khasta Puri, Corn Puff & Sev', 'Order fresh, crunchy Namkeen, Khasta Puri, Corn Puff and Sev from Taran Hari. Made fresh daily with pure ingredients and delivered to your door.'],
  '/shop': ['Shop Namkeen, Khasta Puri, Corn Puff & Sev | Taran Hari', 'Browse and order Taran Hari snacks online: bhujia, mixtures, khasta puri, corn puffs and sev in 200 g, 400 g and 1 kg packs.'],
  '/contact': ['Contact Taran Hari | Call, WhatsApp or Visit', 'Get in touch with Taran Hari for orders, bulk enquiries and feedback. Call, WhatsApp, email or visit us.'],
  '/cart': ['Your Cart | Taran Hari', 'Review your Taran Hari order and check out.'],
  '/privacy': ['Privacy Policy | Taran Hari', 'How Taran Hari collects, uses and protects your personal information.'],
  '/terms': ['Terms & Conditions | Taran Hari', 'The terms for ordering from Taran Hari.'],
  '/refund': ['Refund, Cancellation & Delivery Policy | Taran Hari', 'How Taran Hari handles delivery, cancellations, returns and refunds.'],
};

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo() {
  const { pathname } = useLocation();
  const { contact, settings } = useSite();

  useEffect(() => {
    const [title, desc] = PAGES[pathname] || ['Page not found | Taran Hari', 'This page could not be found.'];
    document.title = title;
    const url = `${window.location.origin}${pathname === '/' ? '/' : pathname}`;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', settings.shopName || 'Taran Hari');
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'robots', PAGES[pathname] ? 'index,follow' : 'noindex');
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }, [pathname, settings.shopName]);

  // Business details for Google (only real values are included)
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FoodEstablishment',
      name: settings.shopName || 'Taran Hari',
      url: window.location.origin,
      servesCuisine: 'Indian snacks',
      description: 'Fresh Namkeen, Khasta Puri, Corn Puff and Sev made daily.',
    };
    if (contact.phoneTel) data.telephone = contact.phoneTel;
    if (contact.email) data.email = contact.email;
    if (contact.addressFull) data.address = { '@type': 'PostalAddress', streetAddress: contact.addressFull };
    if (contact.hours) data.openingHours = contact.hours;
    const same = [contact.instagram, contact.facebook, contact.youtube].filter((x) => /^https?:\/\/.+/.test(x || '') && !/^https:\/\/www\.(instagram|facebook|youtube)\.com\/?$/.test(x));
    if (same.length) data.sameAs = same;
    let tag = document.getElementById('ld-business');
    if (!tag) {
      tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.id = 'ld-business';
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(data);
  }, [contact, settings.shopName]);

  return null;
}