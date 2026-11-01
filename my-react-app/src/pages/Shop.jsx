// =========================================================
// Shop.jsx - Luxury Refurbished Edition
// =========================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Search, SlidersHorizontal, Volume2, VolumeX, X } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QuickView from '../components/QuickView.jsx';
import FilterSheet, { NO_FILTERS, PRICE_RANGES, countActive } from '../components/FilterSheet.jsx';
import BottomSheet from '../components/BottomSheet.jsx';
import { getProducts } from '../lib/api.js';
import { CATEGORIES } from '../data/products.js';
import './Shop.css';

// ---------- Editable content with Professional Google Unsplash URLs ----------
const BANNER_IMAGE = 'https://images.unsplash.com/photo-1599487484170-7c9e6e4fe358?q=80&w=1600&auto=format&fit=crop';
const FACTORY_VIDEO = '/videos/factory.mp4';
const FACTORY_POSTER = 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop';

const QUOTES = [
  { text: 'Crispy, fresh and never stale. Mera favourite!', who: 'Aarav Sharma, Pune' },
  { text: 'The ratlami sev is exactly like back home.', who: 'Priya Deshmukh, Nagpur' },
  { text: 'Whole family finished the khasta puri in one evening.', who: 'Rajesh Agrawal, Akola' },
];

const CHAAT = [
  { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', caption: 'Pani puri chaat' },
  { src: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop', caption: 'Khasta kachori chaat' },
  { src: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop', caption: 'Sev puri' },
  { src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop', caption: 'Bhel' },
  { src: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=800&auto=format&fit=crop', caption: 'Dahi papdi chaat' },
  { src: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop', caption: 'Masala puri' },
  { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', caption: 'Sev tamatar' },
  { src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop', caption: 'Corn puff chaat' },
];

const TABS = ['All', ...CATEGORIES];
const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'low', label: 'Price: Low to High' },
  { id: 'high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Rating' },
  { id: 'az', label: 'A to Z' },
];

function sortList(list, sort) {
  const a = [...list];
  switch (sort) {
    case 'low': return a.sort((x, y) => x.price - y.price);
    case 'high': return a.sort((x, y) => y.price - x.price);
    case 'rating': return a.sort((x, y) => y.rating - x.rating || y.reviews - x.reviews);
    case 'az': return a.sort((x, y) => x.name.localeCompare(y.name));
    default: return a.sort((x, y) => Number(y.trending) - Number(x.trending) || y.reviews - x.reviews);
  }
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('trending');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quick, setQuick] = useState(null);
  const [photo, setPhoto] = useState(null);

  const catParam = params.get('cat');
  const category = TABS.includes(catParam) ? catParam : 'All';

  useEffect(() => {
    let live = true;
    getProducts().then((list) => live && setAll(list));
    return () => { live = false; };
  }, []);

  const setCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === 'All') next.delete('cat');
    else next.set('cat', c);
    setParams(next, { replace: true });
  };

  const range = PRICE_RANGES.find((r) => r.id === filters.price);
  const results = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    const filtered = all.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (q && !(p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))) return false;
      if (range && (p.price < range.min || p.price > range.max)) return false;
      if (filters.veg && !p.veg) return false;
      if (filters.spice.length && !filters.spice.includes(p.spice)) return false;
      if (filters.packs.length && !filters.packs.includes(p.weight)) return false;
      return true;
    });
    return sortList(filtered, sort);
  }, [all, category, query, range, filters, sort]);

  const activeCount = countActive(filters);
  const hasAnyFilter = activeCount > 0 || query.trim() || category !== 'All';

  const resetAll = () => {
    setQuery('');
    setFilters(NO_FILTERS);
    setSort('trending');
    setCategory('All');
  };

  const chips = [];
  if (range) chips.push({ id: 'price', label: range.label, remove: () => setFilters({ ...filters, price: null }) });
  if (filters.veg) chips.push({ id: 'veg', label: 'Veg only', remove: () => setFilters({ ...filters, veg: false }) });
  filters.spice.forEach((s) => chips.push({ id: `s-${s}`, label: `${s} spice`, remove: () => setFilters({ ...filters, spice: filters.spice.filter((x) => x !== s) }) }));
  filters.packs.forEach((s) => chips.push({ id: `k-${s}`, label: s, remove: () => setFilters({ ...filters, packs: filters.packs.filter((x) => x !== s) }) }));

  const favourites = useMemo(
    () => (all ? all.filter((p) => p.trending).sort((a, b) => b.reviews - a.reviews) : []),
    [all]
  );

  return (
    <div className="shop">
      {/* ---------- Title band ---------- */}
      <section className="shop__hero">
        <div className="container shop__heroGrid">
          <Reveal className="shop__heroText">
            <span className="eyebrow">Taaza, garam, crunchy</span>
            <h1>The Royal Snack Shelf</h1>
            <p>Pick your crunch. Everything is fried fresh, packed fast, and sealed tight with royal tradition.</p>
          </Reveal>
          <Reveal className="shop__banner" delay={0.1}>
            <Img src={BANNER_IMAGE} alt="A spread of Taran Hari namkeen and snacks" eager />
          </Reveal>
        </div>
      </section>

      {/* ---------- Sticky category tabs ---------- */}
      <div className="shop__tabsWrap">
        <div className="container">
          <div className="shop__tabs" role="tablist" aria-label="Snack categories">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={category === t}
                className={`shop__tab ${category === t ? 'is-on' : ''}`}
                onClick={() => setCategory(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Controls ---------- */}
      <section className="section shop__main">
        <div className="container">
          <div className="shop__controls">
            <div className="shop__search">
              <Search size={20} aria-hidden="true" />
              <label htmlFor="shop-search" className="sr-only">Search snacks</label>
              <input
                id="shop-search"
                type="search"
                placeholder="Search bhujia, sev, puri..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button type="button" className="shop__clear" onClick={() => setQuery('')} aria-label="Clear search">
                  <X size={18} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="shop__row2">
              <div className="shop__sort">
                <label htmlFor="shop-sort" className="sr-only">Sort by</label>
                <select id="shop-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <button type="button" className="btn btn--accent shop__filterBtn" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal size={18} strokeWidth={2.5} aria-hidden="true" />
                Filters{activeCount ? ` (${activeCount})` : ''}
              </button>
            </div>
          </div>

          <div className="shop__status">
            <p aria-live="polite">
              <strong>{all ? results.length : '...'}</strong> {results.length === 1 ? 'snack' : 'snacks'} found
              {category !== 'All' && <> in <strong>{category}</strong></>}
            </p>
            {hasAnyFilter && <button type="button" className="shop__reset" onClick={resetAll}>Reset all</button>}
          </div>

          {chips.length > 0 && (
            <ul className="shop__chips" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.id}>
                  <button type="button" className="fchip" onClick={c.remove} aria-label={`Remove filter ${c.label}`}>
                    {c.label} <X size={14} strokeWidth={3} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ---------- Grid ---------- */}
          {all === null ? (
            <div className="shop__grid" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : results.length === 0 ? (
            <div className="empty">
              <h3>Arre! Nothing matches.</h3>
              <p>Try a different word or loosen a filter. Our snacks are shy, not missing.</p>
              <button type="button" className="btn btn--primary" onClick={resetAll}>Reset and show all</button>
            </div>
          ) : (
            <motion.div className="shop__grid" layout>
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={p} onOpen={setQuick} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ---------- Factory video ---------- */}
      <section className="section shop__videoSec">
        <div className="container shop__videoGrid">
          <Reveal className="shop__videoText">
            <span className="eyebrow">Behind the crunch</span>
            <h2>Made fresh. Packed with royal care.</h2>
            <p>From the first roll of dough to the last airtight seal, every single packet is inspected with utmost precision.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <FactoryVideo />
          </Reveal>
          <div className="shop__quotes">
            <h3 className="shop__quotesTitle">Loved by Our Customers</h3>
            {QUOTES.map((q, i) => (
              <Reveal key={q.text} delay={i * 0.1}>
                <blockquote className={`bubble ${i % 2 ? 'bubble--r' : ''}`}>
                  <p>&ldquo;{q.text}&rdquo;</p>
                  <footer>{q.who}</footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Chaat gallery ---------- */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head text-center">
            <span className="eyebrow">Plate it up</span>
            <h2>Royal Chaat Gallery</h2>
            <p className="section-sub">Our signature snacks, dressed up. Tap any photo to explore closer.</p>
          </Reveal>
          <div className="gallery">
            {CHAAT.map((c, i) => (
              <Reveal key={c.caption} delay={(i % 4) * 0.07} className={`gallery__item g${i}`}>
                <button type="button" className="gallery__btn" onClick={() => setPhoto(c)} aria-label={`Open photo: ${c.caption}`}>
                  <Img src={c.src} alt={c.caption} />
                  <span className="gallery__cap">{c.caption}</span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Fan favourites ---------- */}
      <section className="section shop__fav">
        <div className="container">
          <Reveal className="section-head text-center">
            <span className="eyebrow">Sab ke favourite</span>
            <h2>Fan Favourites</h2>
          </Reveal>
        </div>
        <div className="shop__scroller" tabIndex={0} aria-label="Fan favourite snacks, scroll sideways">
          <div className="shop__scrollInner">
            {favourites.map((p) => <ProductCard key={p.id} product={p} onOpen={setQuick} compact />)}
          </div>
        </div>
      </section>

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} onApply={setFilters} />
      <QuickView product={quick} onClose={() => setQuick(null)} />

      <BottomSheet open={!!photo} onClose={() => setPhoto(null)} title={photo?.caption || 'Photo'}>
        {photo && <div className="lightbox"><Img src={photo.src} alt={photo.caption} /></div>}
      </BottomSheet>
    </div>
  );
}

function FactoryVideo() {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };
  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  if (failed) {
    return (
      <div className="vid">
        <div className="vid__ph">
          <Play size={44} strokeWidth={2.5} aria-hidden="true" />
          <strong>Factory video preview</strong>
          <span>Ensure video file exists in public/videos/factory.mp4</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vid">
      <video
        ref={ref}
        src={FACTORY_VIDEO}
        poster={FACTORY_POSTER}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label="Video of the Taran Hari factory"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      <div className="vid__bar">
        <button type="button" className="icon-btn" onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <Pause size={20} strokeWidth={3} /> : <Play size={20} strokeWidth={3} />}
        </button>
        <button type="button" className="btn btn--accent vid__sound" onClick={toggleSound}>
          {muted ? <VolumeX size={18} strokeWidth={3} aria-hidden="true" /> : <Volume2 size={18} strokeWidth={3} aria-hidden="true" />}
          {muted ? 'Tap for sound' : 'Sound on'}
        </button>
      </div>
    </div>
  );
}