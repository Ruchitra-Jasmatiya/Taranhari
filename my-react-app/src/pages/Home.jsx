import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Leaf, ShieldCheck, Sparkles, Truck, X } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import Stars from '../components/Stars.jsx';
import { useSite } from '../context/SiteContext.jsx';
import './Home.css';

/* ------------------------------------------------------------------
   LOCAL ASSET IMPORTS & URL FALLBACKS
------------------------------------------------------------------ */
import img1 from '../assets/images/img1.jpeg';
import img2 from '../assets/images/img2.png';
import img3 from '../assets/images/img3.png';
import img4 from '../assets/images/img4.png';
import img5 from '../assets/images/img5.jpeg';
import vid1 from '../assets/images/vid1.mp4';
import vid2 from '../assets/images/vid2.mp4';
import vid3 from '../assets/images/vid3.mp4';

// Banner Carousel Images (Pure images, NO text overlays)
const BANNER_IMAGES_DEFAULT = [
  { src: img1, alt: 'Royal Namkeen Showcase 1' },
  { src: img2, alt: 'Royal Namkeen Showcase 2' },
  { src: img3, alt: 'Royal Namkeen Showcase 3' },
  { src: 'https://images.unsplash.com/photo-1599487484170-7c9e6e4fe358?q=80&w=1600&auto=format&fit=crop', alt: 'Royal Namkeen Showcase 4' },
];

// Mini Image Blocks
const MINI_BLOCKS_DEFAULT = [
  { src: img1, title: 'Classic Assortment', tag: 'Bestseller' },
  { src: img2, title: 'Spicy Ratlami Sev', tag: 'Crispy' },
  { src: img3, title: 'Golden Khasta Puri', tag: 'Handmade' },
  { src: img4, title: 'Chatpata Corn Puffs', tag: 'Flavorful' },
  { src: img5, title: 'Festive Gift Box', tag: 'Special' },
  { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop', title: 'Royal Masala Mix', tag: 'Premium' },
];

// Showcase Videos with Specific Titles
const SHOWCASE_VIDEOS_DEFAULT = [
  { src: vid1, title: 'Bhel Masterclass' },
  { src: vid2, title: 'Pani Puri Perfection' },
  { src: vid3, title: 'Khasta Puri Craft' },
];

const HERO_IMAGE_DEFAULT = img1;

const MARQUEE_DEFAULT = ['Namkeen', 'Khasta Puri', 'Corn Puff', 'Sev', 'Fresh Daily', 'Royal Taste', 'Pure Ingredients'];

const TILES_DEFAULT = [
  { name: 'Namkeen', note: 'Bhujia, royal mixes, dalmoth', img: img1, tone: 'brand' },
  { name: 'Khasta Puri', note: 'Flaky, golden & traditional', img: img2, tone: 'accent' },
  { name: 'Corn Puff', note: 'Light, airy & chatpata', img: img3, tone: 'ink' },
  { name: 'Sev', note: 'Ratlami, garlic & royal plain', img: img4, tone: 'white' },
];

const ABOUT_PHOTO_DEFAULT = img5;
const ABOUT_TEXT_DEFAULT = [
  'Born from a deep passion for authentic Indian snacking traditions, our kitchen stands for uncompromised quality, pristine hygiene, and royal flavors.',
  'We roast, grind, and mix our spices in-house daily. Every single packet carries our family’s promise: exceptional taste that makes every tea break memorable.',
];

// Updated Team List with exact names requested
const TEAM_DEFAULT = [
  { name: 'Gautam Jasmatia', role: 'Founder & Mentor', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop', text: 'Guiding our vision with decades of business wisdom and commitment to absolute quality.' },
  { name: 'Jigyasa Jasmatia', role: 'Director & Operations', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', text: 'Overseeing kitchen hygiene, supply chain excellence, and pristine daily production.' },
  { name: 'Co-founder Name', role: 'Co-founder', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop', text: 'Innovating new flavor profiles while keeping ancestral recipes intact.' },
  { name: 'Ruchi Jasmatiya', role: 'Tech & Digital Lead', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop', text: 'Driving digital experiences, brand aesthetics, and seamless customer interactions.' },
];

const WHY = [
  { icon: Flame, title: 'Fried Fresh Daily', text: 'Prepared in small batches every morning to guarantee maximum crunch and zero staleness.' },
  { icon: ShieldCheck, title: 'Hygienic Royal Kitchen', text: 'State-of-the-art cleanliness standards meeting rigorous food safety benchmarks.' },
  { icon: Leaf, title: '100% Natural Ingredients', text: 'Zero artificial preservatives or synthetic coloring agents. Pure authentic spices only.' },
  { icon: Truck, title: 'Lightning Fast Delivery', text: 'Airtight packaging ensures your snacks arrive crisp, fresh, and ready to relish.' },
];

const REVIEWS_DEFAULT = [
  { name: 'Aarav Sharma', city: 'Pune', stars: 5, quote: 'Absolute game changer for evening tea! The crunch and spice levels are out of this world.' },
  { name: 'Priya Deshmukh', city: 'Nagpur', stars: 5, quote: 'Reminds me of homemade Diwali snacks. Extremely fresh and premium packaging.' },
  { name: 'Rajesh Agrawal', city: 'Akola', stars: 5, quote: 'The Ratlami sev is unmatched. Clean, authentic, and bursting with royal flavor.' },
  { name: 'Sneha Kulkarni', city: 'Mumbai', stars: 4.5, quote: 'Ordered for a family gathering and everyone asked for the website link. Fantastic quality!' },
];

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
      <Categories />
      <About />
      <Why />
      <Reviews />
    </div>
  );
}

/* ---------- 1. Hero (Single Clean Circle) ---------- */
function Hero() {
  const { home, categories, live } = useSite();
  const HERO_IMAGE = home.heroImage || HERO_IMAGE_DEFAULT;
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
          </motion.div>
        </div>

        <motion.div className="hero__visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          {/* Single clean plate circle */}
          <div className="hero__plate-single">
            <Img src={HERO_IMAGE} alt="A heaped bowl of premium namkeen" eager />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- 2. Dynamic Banner Slider (Pure Images, Auto-transition 3s) ---------- */
function BannerSlider() {
  const { home, categories, live } = useSite();
  const BANNER_IMAGES = home.banners?.length ? home.banners : BANNER_IMAGES_DEFAULT;
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
              className="banner__slide-pure"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <img src={BANNER_IMAGES[current].src} alt={BANNER_IMAGES[current].alt} className="banner__pure-img" />
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
  const { home, categories, live } = useSite();
  const MARQUEE = home.marquee?.length ? home.marquee : MARQUEE_DEFAULT;
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

/* ---------- 4. Media Showcase & Video Lightbox Carousel ---------- */
function MediaShowcase() {
  const { home, categories, live } = useSite();
  const MINI_BLOCKS = home.blocks?.length ? home.blocks : MINI_BLOCKS_DEFAULT;
  const SHOWCASE_VIDEOS = home.videos?.length ? home.videos : SHOWCASE_VIDEOS_DEFAULT;
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoIdx, setVideoIdx] = useState(0);

  const nextVideo = () => setVideoIdx((prev) => (prev + 1) % SHOWCASE_VIDEOS.length);
  const prevVideo = () => setVideoIdx((prev) => (prev - 1 + SHOWCASE_VIDEOS.length) % SHOWCASE_VIDEOS.length);

  return (
    <section className="showcase-section">
      <div className="container">
        <div className="section-head text-center">
          <span className="eyebrow">Visual Feast</span>
          <h2>A Glimpse into Our Kitchen & Masterpieces</h2>
          <p className="section-sub">Explore our signature creations and craftsmanship video highlights.</p>
        </div>

        {/* Mini Image Blocks (5-6 items) */}
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

        {/* Videos Section (1 video on mobile, 2 on desktop with slide navigation & tap-to-zoom) */}
        <div className="videos-showcase-wrap">
          <div className="videos-header-flex">
            <h3 className="videos-title">Kitchen Action & Craftsmanship</h3>
            <div className="video-slider-controls">
              <button onClick={prevVideo} aria-label="Previous Video"><ChevronLeft size={20} /></button>
              <button onClick={nextVideo} aria-label="Next Video"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="videos-grid">
            {/* We display current video on mobile, and 2 on desktop */}
            {SHOWCASE_VIDEOS.map((vid, i) => (
              <motion.div
                key={i}
                className={`video-box ${i === videoIdx ? 'mobile-active-vid' : 'desktop-vid-item'}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setActiveVideo(vid)}
              >
                <div className="video-player-wrap">
                  <video src={vid.src} autoPlay loop muted playsInline className="master-video" />
                  <div className="video-gradient-overlay" />
                  <span className="video-tap-hint">Tap to Zoom & Play</span>
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

      {/* Video Lightbox Modal */}
      {activeVideo && (
        <div className="video-lightbox-overlay" onClick={() => setActiveVideo(null)}>
          <div className="video-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveVideo(null)}><X size={24} /></button>
            <video src={activeVideo.src} controls autoPlay className="lightbox-video-player" />
            <div className="lightbox-details">
              <h3>{activeVideo.title}</h3>
              <p>{activeVideo.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- 5. Categories ---------- */
function Categories() {
  const { home, categories, live } = useSite();
  const TILES = live && categories.length ? categories.map((c) => ({ name: c.name, note: c.note || '', img: c.image, tone: c.tone || 'brand' })) : TILES_DEFAULT;
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

/* ---------- 6. About + Enhanced Team Section ---------- */
function About() {
  const { home, categories, live } = useSite();
  const ABOUT_PHOTO = home.aboutPhoto || ABOUT_PHOTO_DEFAULT;
  const ABOUT_TEXT = home.aboutText?.length ? home.aboutText : ABOUT_TEXT_DEFAULT;
  const TEAM = home.team?.length ? home.team : TEAM_DEFAULT;
  const [hoveredIdx, setHoveredIdx] = useState(null);

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
          <span className="eyebrow">Meet The Team</span>
          <h2>The People Behind the Crunch</h2>
        </Reveal>

        {/* Enhanced Team Section with Image & Name Below and Hover Highlight Animation */}
        <ul className="team-grid-modern">
          {TEAM.map((m, i) => {
            const isHighlighted = hoveredIdx === i;
            return (
              <Reveal as="li" key={m.name} delay={i * 0.08}>
                <div
                  className={`team-card-modern ${isHighlighted ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => setHoveredIdx(hoveredIdx === i ? null : i)}
                >
                  <div className="team-card__img-wrap">
                    <img src={m.photo} alt={m.name} className="team-card__img" />
                    <div className="team-card__overlay">
                      <p>{m.text}</p>
                    </div>
                  </div>
                  <div className="team-card__info">
                    <h3>{m.name}</h3>
                    <span className="team-card__role">{m.role}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 7. Why Taran Hari ---------- */
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

/* ---------- 8. Reviews ---------- */
function Reviews() {
  const { home, categories, live } = useSite();
  const REVIEWS = home.reviews?.length ? home.reviews : REVIEWS_DEFAULT;
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: 'smooth' });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.children[0]?.getBoundingClientRect().width || 1;
    const i = Math.round(el.scrollLeft / (w + 16));
    setIdx(Math.min(REVIEWS.length - 1, Math.max(0, i)));
  };

  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => goTo((idx + 1) % REVIEWS.length), 4500);
    return () => clearInterval(t);
  }, [idx, paused]);

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