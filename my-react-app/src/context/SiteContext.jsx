// =========================================================
// SiteContext.jsx - the live website data from the backend.
// Loads products, categories, contact details, page content and
// store settings, then re-checks every few seconds (and when the
// tab comes back into view) so admin changes appear on their own.
// If the backend is unreachable it falls back to built-in data.
// =========================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchSite, fetchVersion } from '../lib/api.js';
import { CATEGORIES, products as sampleProducts } from '../data/products.js';
import { CONTACT_DEFAULTS } from '../data/siteDefaults.js';

const POLL_MS = 8000;

const fallback = {
  products: sampleProducts,
  categories: CATEGORIES.map((name, i) => ({ id: i + 1, name })),
  settings: { shopName: 'Taran Hari', announcement: '', deliveryFee: 49, freeDeliveryAbove: 499, minOrder: 0, acceptingOrders: true },
  contact: CONTACT_DEFAULTS,
  home: {},
  shop: {},
};

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(fallback);
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false); // true when the backend answered
  const ver = useRef(null);

  const load = useCallback(async () => {
    try {
      const d = await fetchSite();
      ver.current = d.version;
      setSite({
        products: d.products,
        categories: d.categories,
        settings: { ...fallback.settings, ...d.settings },
        contact: { ...CONTACT_DEFAULTS, ...pruneEmpty(d.contact) },
        home: d.home || {},
        shop: d.shop || {},
      });
      setLive(true);
    } catch {
      setLive(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    load();
    let stop = false;
    const tick = async () => {
      if (stop || document.hidden) return;
      try {
        const v = await fetchVersion();
        if (ver.current !== null && v !== ver.current) load();
      } catch {
        /* offline - keep what we have */
      }
    };
    const id = setInterval(tick, POLL_MS);
    const onVis = () => !document.hidden && tick();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  const value = useMemo(() => ({ ...site, ready, live, reload: load }), [site, ready, live, load]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

// Empty strings from the admin mean "use the built-in value"
function pruneEmpty(o = {}) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v !== '' && v !== null && v !== undefined) out[k] = v;
  return out;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}

/** Category names in display order (from the admin). */
export const categoryNames = (site) => site.categories.map((c) => c.name);
