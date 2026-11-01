import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Leaf, ShieldCheck, Sparkles, Star, Truck } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import Stars from '../components/Stars.jsx';
import './Home.css';

/* ------------------------------------------------------------------
   LOCAL ASSET IMPORTS & URL FALLBACKS (From your assets folder)
------------------------------------------------------------------ */
import img1 from '../assets/images/img1.jpeg';
import img2 from '../assets/images/img2.png';
import img3 from '../assets/images/img3.png';
import img4 from '../assets/images/img4.png';
import img5 from '../assets/images/img5.jpeg';
import vid1 from '../assets/images/vid1.mp4';
import vid2 from '../assets/images/vid2.mp4';
import vid3 from '../assets/images/vid3.mp4';

// Banner Carousel Images (Alternating local assets and high-end professional snack imagery)
const BANNER_IMAGES = [
  { src: img1, title: 'Royal Heritage Namkeen', subtitle: 'Crafted with authentic spices & pure ghee tradition' },
  { src: img2, title: 'Crispy & Crunchy Sev', subtitle: 'Fried fresh every morning with golden perfection' },
  { src: img3, title: 'Special Party Mixes', subtitle: 'The ultimate companion for your evening chai' },
  { src: 'https://images.unsplash.com/photo-1599487484170-7c9e6e4fe358?q=80&w=1600&auto=format&fit=crop', title: 'Traditional Delicacies', subtitle: 'Handcrafted purity in every single bite' },
];

// Mini Image Blocks (Using your provided local assets + curated Google URLs)
const MINI_BLOCKS = [
  { src: img1, title: 'Classic Assortment', tag: 'Bestseller' },
  { src: img2, title: 'Spicy Ratlami Sev', tag: 'Crispy' },
  { src: img3, title: 'Golden Khasta Puri', tag: 'Handmade' },
  { src: img4, title: 'Chatpata Corn Puffs', tag: 'Flavorful' },
  { src: img5, title: 'Festive Gift Box', tag: 'Special' },
  { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', title: 'Royal Masala Mix', tag: 'Premium' },
  { src: 'https://images.unsplash.com/photo-1599487484170-7c9e6e4fe358?q=80&w=800&auto=format&fit=crop', title: 'Freshly Baked Crunch', tag: 'Daily Fresh' },
  { src: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop', title: 'Grand Celebration Pack', tag: 'Family Pack' },
];

// Showcase Videos
const SHOWCASE_VIDEOS = [
  { src: vid1, title: 'The Art of Frying', desc: 'Watch how golden perfection is achieved in small batches.' },
  { src: vid2, title: 'Fresh Masala Tossing', desc: 'Coated while warm with our secret proprietary spice blend.' },
  { src: vid3, title: 'Handmade Layering', desc: 'Traditional Akola techniques passed down through generations.' },
];

const HERO_IMAGE = img1;
const FLOATERS = [
  { src: img2, alt: 'A piece of sev', className: 'f1' },
  { src: img3, alt: 'A corn puff', className: 'f2' },
  { src: img4, alt: 'A khasta puri', className: 'f3' },
  { src: img5, alt: 'A peanut', className: 'f4' },
];

const MARQUEE = ['Namkeen', 'Khasta Puri', 'Corn Puff', 'Sev', 'Fresh Daily', 'Royal Taste', 'Pure Ingredients'];

const STORY = [
  { src: img1, alt: 'Hands kneading fresh dough', title: 'It starts with golden dough', text: 'Finest wheat flour, handpicked spices, and generations of patience kneaded fresh every sunrise.' },
  { src: img2, alt: 'Rolling out puri by hand', title: 'Hand-rolled craftsmanship', text: 'No mechanical shortcuts. Every layer is meticulously rolled to ensure absolute khasta texture.' },
  { src: img3, alt: 'Golden snacks frying in a kadhai', title: 'Slow-fried to perfection', text: 'Fried in crystal-clear oil at precise temperatures for that unforgettable lingering crunch.' },
  { src: img4, alt: 'Masala being tossed over hot namkeen', title: 'Warm masala infusion', text: 'Proprietary house spices are dusted while the snacks are warm so every morsel absorbs the magic.' },
  { src: img5, alt: 'Packets being sealed', title: 'Airtight freshness sealing', text: 'Packed instantly to lock in aroma and crunch, delivering straight from our kitchen to your teacup.' },
];

const TILES = [
  { name: 'Namkeen', note: 'Bhujia, royal mixes, dalmoth', img: img1, tone: 'brand' },
  { name: 'Khasta Puri', note: 'Flaky, golden & traditional', img: img2, tone: 'accent' },
  { name: 'Corn Puff', note: 'Light, airy & chatpata', img: img3, tone: 'ink' },
  { name: 'Sev', note: 'Ratlami, garlic & royal plain', img: img4, tone: 'white' },
];

const ABOUT_PHOTO = img5;
const ABOUT_TEXT = [
  'Born from a deep passion for authentic Indian snacking traditions, our kitchen stands for uncompromised quality, pristine hygiene, and royal flavors.',
  'We roast, grind, and mix our spices in-house daily. Every single packet carries our family’s promise: exceptional taste that makes every tea break memorable.',
];

const TEAM = [
  { name: 'Gautam Jasmatia', role: 'Founder & Mentor', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop', text: 'Guiding our vision with decades of business wisdom and commitment to absolute quality.' },
  { name: 'Director Name', role: 'Operations Director', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop', text: 'Overseeing kitchen hygiene, supply chain excellence, and pristine daily production.' },
  { name: 'Co-founder Name', role: 'Head of Product & Growth', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop', text: 'Innovating new flavor profiles while keeping ancestral recipes intact.' },
  { name: 'Ruchi Jasmatiya', role: 'Tech & Digital Lead', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', text: 'Driving digital experiences, brand aesthetics, and seamless customer interactions.' },
];

const WHY = [
  { icon: Flame, title: 'Fried Fresh Daily', text: 'Prepared in small batches every morning to guarantee maximum crunch and zero staleness.' },
  { icon: ShieldCheck, title: 'Hygienic Royal Kitchen', text: 'State-of-the-art cleanliness standards meeting rigorous food safety benchmarks.' },
  { icon: Leaf, title: '100% Natural Ingredients', text: 'Zero artificial preservatives or synthetic coloring agents. Pure authentic spices only.' },
  { icon: Truck, title: 'Lightning Fast Delivery', text: 'Airtight packaging ensures your snacks arrive crisp, fresh, and ready to relish.' },
];

const REVIEWS = [
  { name: 'Aarav Sharma', city: 'Pune', stars: 5, quote: 'Absolute game changer for evening tea! The crunch and spice levels are out of this world.' },
  { name: 'Priya Deshmukh', city: 'Nagpur', stars: 5, quote: 'Reminds me of homemade Diwali snacks. Extremely fresh and premium packaging.' },
  { name: 'Rajesh Agrawal', city: 'Akola', stars: 5, quote: 'The Ratlami sev is unmatched. Clean, authentic, and bursting with royal flavor.' },
  { name: 'Sneha Kulkarni', city: 'Mumbai', stars: 4.5, quote: 'Ordered for a family gathering and everyone asked for the website link. Fantastic quality!' },
  { name: 'Vikram Mehta', city: 'Bengaluru', stars: 5, quote: 'Fast delivery and premium taste. Taran Hari has become our official snack partner.' },
];

/* ------------------------------------------------------------------
   Small helpers
------------------------------------------------------------------ */
function useMedia(query) {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

function Floater({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`floater ${className}`} aria-hidden="true">
      {failed ? (
        <span className="floater__blob" />
      ) : (
        <img src={src} alt="" onError={() => setFailed(true)} loading="eager" />
      )}
    </span>
  );
}

/* ------------------------------------------------------------------
   Page Component
------------------------------------------------------------------ */
export default function Home() {
  return (
    <div className="home">
      <Hero />
      <BannerSlider />
      <Marquee />
      <MediaShowcase />
      <Story />
      <Categories />
      <About />
      <Why />
      <Reviews />
      <FinalCta />
    </div>
  );
}

/* ---------- 1. Hero ---------- */
function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.div className="hero__badge-tag" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Sparkles size={16} /> <span>Ek baar khao, baar baar maango</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
            Royal Namkeen that <span className="hero__hl">crunches</span> back.
          </motion.h1>
          <motion.p className="hero__sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }}>
            Crafted with royal maroon traditions and golden warmth. Fried fresh every morning, tossed in house masalas, and sealed for ultimate crispness.
          </motion.p>
          <motion.div className="hero__btns" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.24 }}>
            <Link to="/shop" className="btn btn--primary">Explore Collection <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" /></Link>
            <a href="#story" className="btn btn--outline">Our Heritage</a>
          </motion.div>
        </div>

        <motion.div className="hero__visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          <div className="hero__plate" />
          <div className="hero__img">
            <Img src={HERO_IMAGE} alt="A heaped bowl of premium namkeen" eager />
          </div>
          {FLOATERS.map((f) => <Floater key={f.className} {...f} />)}

          <div className="hero__badge" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="hero__badgeRing">
              <defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
              <text fontSize="12" fontWeight="800" fill="currentColor" letterSpacing="2.5">
                <textPath href="#circ">100% PURE • ROYAL QUALITY • FRESH DAILY •</textPath>
              </text>
            </svg>
            <span className="hero__badgeMid">👑</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- 2. Dynamic Banner Slider (Changes every 3 seconds) ---------- */
function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="banner-slider-section">
      <div className="container">
        <div className="banner__slider-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="banner__slide"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <div className="banner__slide-img-wrap">
                <img src={BANNER_IMAGES[current].src} alt={BANNER_IMAGES[current].title} className="banner__slide-img" />
                <div className="banner__slide-overlay" />
              </div>
              <div className="banner__slide-content">
                <span className="banner__tag">Featured Spotlight</span>
                <h2>{BANNER_IMAGES[current].title}</h2>
                <p>{BANNER_IMAGES[current].subtitle}</p>
                <Link to="/shop" className="btn btn--accent">Order Now <ArrowRight size={18} /></Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="banner__controls">
            <button onClick={() => setCurrent((current - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)} aria-label="Previous Slide">
              <ChevronLeft size={22} />
            </button>
            <div className="banner__dots">
              {BANNER_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  className={`banner__dot ${idx === current ? 'active' : ''}`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button onClick={() => setCurrent((current + 1) % BANNER_IMAGES.length)} aria-label="Next Slide">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. Marquee ---------- */
function Marquee() {
  const row = (hidden) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {[...MARQUEE, ...MARQUEE].map((w, i) => (
        <li key={i}>{w}<span className="marquee__dot" aria-hidden="true">✦</span></li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" role="region" aria-label="Brand Highlights">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------- 4. Media & Mini Images Showcase Section ---------- */
function MediaShowcase() {
  return (
    <section className="showcase-section">
      <div className="container">
        <div className="section-head text-center">
          <span className="eyebrow">Visual Feast</span>
          <h2>A Glimpse into Our Kitchen & Masterpieces</h2>
          <p className="section-sub">Explore our signature creations and behind-the-scenes video highlights.</p>
        </div>

        {/* 5-6 Mini Image Blocks Grid */}
        <div className="mini-blocks-grid">
          {MINI_BLOCKS.map((item, idx) => (
            <motion.div
              key={idx}
              className="mini-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <div className="mini-card__img-wrap">
                <img src={item.src} alt={item.title} className="mini-card__img" />
                <span className="mini-card__badge">{item.tag}</span>
              </div>
              <div className="mini-card__footer">
                <h4>{item.title}</h4>
                <Link to="/shop" className="mini-card__link"><ArrowRight size={16} /></Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big Amazing Video Showcase Section */}
        <div className="videos-showcase-wrap">
          <h3 className="videos-title">Kitchen Action & Craftsmanship</h3>
          <div className="videos-grid">
            {SHOWCASE_VIDEOS.map((vid, i) => (
              <motion.div
                key={i}
                className="video-box"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="video-player-wrap">
                  <video src={vid.src} autoPlay loop muted playsInline className="master-video" />
                  <div className="video-gradient-overlay" />
                </div>
                <div className="video-info">
                  <h4>{vid.title}</h4>
                  <p>{vid.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Story ---------- */
function Story() {
  const reduce = useReducedMotion();
  const wide = useMedia('(min-width: 768px)');
  const sticky = wide && !reduce;

  return (
    <section id="story" className="story-section">
      <div className="container story__intro text-center">
        <Reveal>
          <span className="eyebrow">Our Legacy</span>
          <h2>How Every Packet Gets Its Royal Crunch</h2>
        </Reveal>
      </div>
      {sticky ? <StorySticky /> : <StoryStack />}
    </section>
  );
}

function StorySticky() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const N = STORY.length;

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const i = Math.min(N - 1, Math.max(0, Math.round(p * (N - 1) + 0.0001)));
    setActive((cur) => (cur === i ? cur : i));
  });

  return (
    <div ref={ref} className="story__scroll" style={{ height: `${N * 90}vh` }}>
      <div className="story__sticky">
        <div className="container story__stage">
          <div className="story__frame">
            {STORY.map((s, i) => (
              <StoryLayer key={s.src} item={s} index={i} count={N} progress={scrollYProgress} />
            ))}
          </div>

          <div className="story__caption" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <span className="story__step">Step {active + 1} of {N}</span>
                <h3>{STORY[active].title}</h3>
                <p>{STORY[active].text}</p>
              </motion.div>
            </AnimatePresence>

            <ol className="story__dots" aria-label="Story progress">
              {STORY.map((s, i) => (
                <li key={s.title} className={i === active ? 'is-on' : i < active ? 'is-done' : ''}><span className="sr-only">{s.title}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryLayer({ item, index, count, progress }) {
  const start = Math.max(0, (index - 0.7) / (count - 1));
  const end = index / (count - 1);
  const first = index === 0;
  const opacity = useTransform(progress, first ? [0, 1] : [start, end], first ? [1, 1] : [0, 1]);
  const y = useTransform(progress, first ? [0, 1] : [start, end], first ? [0, 0] : [90, 0]);
  const scale = useTransform(progress, first ? [0, 1] : [start, end], first ? [1, 1] : [0.86, 1]);
  return (
    <motion.div className="story__layer" style={{ opacity, y, scale, zIndex: index }}>
      <Img src={item.src} alt={item.alt} />
    </motion.div>
  );
}

function StoryStack() {
  return (
    <div className="container story__stack">
      {STORY.map((s, i) => (
        <Reveal key={s.src} className="scard" delay={0.05}>
          <div className="scard__img"><Img src={s.src} alt={s.alt} /></div>
          <div className="scard__body">
            <span className="story__step">Step {i + 1} of {STORY.length}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- 6. Categories ---------- */
function Categories() {
  return (
    <section className="section cats-section">
      <div className="container">
        <Reveal className="section-head text-center">
          <span className="eyebrow">Our Collections</span>
          <h2>Four Ways to Experience Royal Crunch</h2>
        </Reveal>
        <ul className="cats__grid">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 0.08}>
              <Link to={`/shop?cat=${encodeURIComponent(t.name)}`} className={`tile tile--${t.tone}`}>
                <span className="tile__img"><Img src={t.img} alt={`${t.name} snack`} compact /></span>
                <span className="tile__name">{t.name}</span>
                <span className="tile__note">{t.note}</span>
                <span className="tile__go" aria-hidden="true"><ArrowRight size={20} strokeWidth={2.5} /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 7. About + Team ---------- */
function About() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section about-section">
      <div className="container">
        <div className="about__top">
          <Reveal className="about__photo">
            <Img src={ABOUT_PHOTO} alt="Our family kitchen" />
          </Reveal>
          <Reveal className="about__text" delay={0.1}>
            <span className="eyebrow">About Taran Hari</span>
            <h2>Crafted with Passion & Tradition</h2>
            {ABOUT_TEXT.map((t, idx) => <p key={idx}>{t}</p>)}
          </Reveal>
        </div>

        <Reveal className="section-head text-center about__headTeam">
          <span className="eyebrow">Leadership</span>
          <h2>Meet the Team Behind the Crunch</h2>
        </Reveal>
        <ul className="team">
          {TEAM.map((m, i) => {
            const flipped = open === i;
            return (
              <Reveal as="li" key={m.name} delay={i * 0.08}>
                <button
                  type="button"
                  className={`tcard ${flipped ? 'is-flipped' : ''}`}
                  aria-pressed={flipped}
                  aria-label={`${m.name}, ${m.role}. Tap to flip`}
                  onClick={() => setOpen(flipped ? null : i)}
                >
                  <span className="tcard__inner">
                    <span className="tcard__face tcard__front">
                      <span className="tcard__photo">
                        <Img src={m.photo} alt={`Photo of ${m.name}`} compact />
                      </span>
                      <span className="tcard__name">{m.name}</span>
                      <span className="tcard__role">{m.role}</span>
                      <span className="tcard__hint">Tap to read bio</span>
                    </span>
                    <span className="tcard__face tcard__back">
                      <span className="tcard__name">{m.name}</span>
                      <span className="tcard__role">{m.role}</span>
                      <span className="tcard__text">{m.text}</span>
                    </span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 8. Why Taran Hari ---------- */
function Why() {
  return (
    <section className="section why-section">
      <div className="container">
        <Reveal className="section-head text-center">
          <span className="eyebrow">The Royal Standard</span>
          <h2>Why Choose Taran Hari?</h2>
        </Reveal>
        <ul className="why__grid">
          {WHY.map((w, i) => (
            <Reveal as="li" key={w.title} delay={i * 0.08} className="wy">
              <span className="wy__icon"><w.icon size={28} strokeWidth={2.4} aria-hidden="true" /></span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 9. Reviews ---------- */
function Reviews() {
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const wide = useMedia('(min-width: 1024px)');

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.children[0]?.getBoundingClientRect().width || 1;
    const i = Math.round(el.scrollLeft / (w + 16));
    setIdx(Math.min(REVIEWS.length - 1, Math.max(0, i)));
  };

  useEffect(() => {
    if (wide || paused || reduce) return undefined;
    const t = setInterval(() => goTo((idx + 1) % REVIEWS.length), 4500);
    return () => clearInterval(t);
  }, [idx, paused, wide, reduce]);

  const initials = (n) => n.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section className="section reviews-section">
      <div className="container">
        <Reveal className="section-head text-center">
          <span className="eyebrow">Testimonials</span>
          <h2>Loved by Crunch Fans Across India</h2>
        </Reveal>

        <div
          className="reviews__wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 6000)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <ul className="reviews__track" ref={trackRef} onScroll={onScroll} tabIndex={0} aria-label="Customer reviews">
            {REVIEWS.map((r) => (
              <li key={r.name} className="rcard">
                <Stars value={r.stars} size={18} />
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <div className="rcard__who">
                  <span className="rcard__avatar" aria-hidden="true">{initials(r.name)}</span>
                  <span><strong>{r.name}</strong><br /><small>{r.city}</small></span>
                </div>
              </li>
            ))}
          </ul>
          <div className="reviews__dots" role="group" aria-label="Choose review">
            {REVIEWS.map((r, i) => (
              <button key={r.name} type="button" className={i === idx ? 'is-on' : ''} onClick={() => goTo(i)} aria-label={`Show review ${i + 1}`} aria-current={i === idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 10. Final CTA ---------- */
function FinalCta() {
  return (
    <section className="cta-section">
      <div className="container cta__inner text-center">
        <Reveal>
          <h2>Hungry for Royal Crunch?</h2>
          <p>Treat your tea time to authentic flavors. Your next packet is just a tap away.</p>
        </Reveal>
        <Reveal delay={0.12}>
          <Link to="/shop" className="btn btn--accent btn--lg">Shop Collection Now <ArrowRight size={22} strokeWidth={2.5} aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}