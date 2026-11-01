// =========================================================
// Shop.jsx - Luxury Category-Focused Edition
// =========================================================

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Pause, Play, Search, SlidersHorizontal, Volume2, VolumeX, X } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import ProductCard from '../components/ProductCard.jsx';
import QuickView from '../components/QuickView.jsx';
import FilterSheet, { NO_FILTERS, PRICE_RANGES, countActive } from '../components/FilterSheet.jsx';
import BottomSheet from '../components/BottomSheet.jsx';
import { getProducts } from '../lib/api.js';
import './Shop.css';

// ---------- Curated Google Unsplash URLs for Categories & Products ----------
const CATEGORY_FEATURED = [
  { name: 'Namkeen', note: 'Royal bhujia, mixes & dalmoth', img: 'https://images.unsplash.com/photo-1599487484170-7c9e6e4fe358?q=80&w=800&auto=format&fit=crop', tone: 'brand' },
  { name: 'Khasta Puri', note: 'Flaky, golden & traditional', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', tone: 'accent' },
  { name: 'Corn Puff', note: 'Light, airy & chatpata', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop', tone: 'ink' },
  { name: 'Sev', note: 'Ratlami, garlic & royal plain', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop', tone: 'white' },
];

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
];

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
  const navigate = useNavigate();
  const [all, setAll] = useState(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('trending');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quick, setQuick] = useState(null);
  const [photo, setPhoto] = useState(null);

  const catParam = params.get('cat');
  const category = catParam || 'All';

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
  
  // Results filtered and strictly limited to 8 items as requested
  const results = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    const filtered = all.filter((p) => {
      if (category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) return false;
      if (q && !(p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))) return false;
      if (range && (p.price < range.min || p.price > range.max)) return false;
      if (filters.veg && !p.veg) return false;
      if (filters.spice.length && !filters.spice.includes(p.spice)) return false;
      if (filters.packs.length && !filters.packs.includes(p.weight)) return false;
      return true;
    });
    return sortList(filtered, sort).slice(0, 8); // Strictly 8 items
  }, [all, category, query, range, filters, sort]);

  const activeCount = countActive(filters);

  const resetAll = () => {
    setQuery('');
    setFilters(NO_FILTERS);
    setSort('trending');
    setCategory('All');
  };

  return (
    <div className="shop">
      {/* ---------- 1. HERO CATEGORY SECTION (Main Focus) ---------- */}
      <section className="shop__hero-categories">
        <div className="container">
          <div className="shop__back-row">
            <button type="button" className="btn-back-page" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} strokeWidth={2.5} /> Back Previous Page
            </button>
          </div>
          <div className="section-head text-center">
            <span className="eyebrow">Explore By Category</span>
            <h1>The Royal Snack Collection</h1>
            <p className="section-sub">Tap any category below to immerse yourself in authentic handcrafted flavors.</p>
          </div>

          <div className="category-hero-grid">
            {CATEGORY_FEATURED.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <button
                  type="button"
                  className={`category-hero-card tile--${cat.tone} ${category === cat.name ? 'active-cat' : ''}`}
                  onClick={() => setCategory(cat.name)}
                >
                  <div className="cat-card__img-wrap">
                    <img src={cat.img} alt={cat.name} className="cat-card__img" />
                  </div>
                  <div className="cat-card__content">
                    <h3>{cat.name}</h3>
                    <p>{cat.note}</p>
                    <span className="cat-explore-link">Explore Collection →</span>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 2. PRODUCTS SECTION (Strictly 8 items with controls) ---------- */}
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

          <div className="shop__status-flex">
            <h2>{category === 'All' ? 'Featured Selections' : `${category} Collection`}</h2>
            {category !== 'All' && (
              <button type="button" className="shop__reset" onClick={() => setCategory('All')}>Show All Categories</button>
            )}
          </div>

          {/* Grid displaying strictly 8 items */}
          {all === null ? (
            <div className="shop__grid" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" />)}
            </div>
          ) : results.length === 0 ? (
            <div className="empty">
              <h3>Arre! Nothing matches in this category.</h3>
              <p>Try resetting filters or exploring another category.</p>
              <button type="button" className="btn btn--primary" onClick={resetAll}>Reset and Show All</button>
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

      {/* ---------- 3. Factory video & Customer quotes ---------- */}
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

      {/* ---------- 4. Chaat gallery ---------- */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head text-center">
            <span className="eyebrow">Plate it up</span>
            <h2>Royal Chaat Gallery</h2>
            <p className="section-sub">Our signature snacks, dressed up. Tap any photo to explore closer.</p>
          </Reveal>
          <div className="gallery">
            {CHAAT.map((c, i) => (
              <Reveal key={c.caption} delay={(i % 4) * 0.07} className="gallery__item">
                <button type="button" className="gallery__btn" onClick={() => setPhoto(c)} aria-label={`Open photo: ${c.caption}`}>
                  <Img src={c.src} alt={c.caption} />
                  <span className="gallery__cap">{c.caption}</span>
                </button>
              </Reveal>
            ))}
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