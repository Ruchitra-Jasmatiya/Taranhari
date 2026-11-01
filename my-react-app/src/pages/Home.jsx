// =========================================================
// Home.jsx - hero, marquee, scroll story, category tiles, about +
// team, why us, reviews carousel, final call to action.
//
// ★ Most text and images you will want to change are in the
//   arrays right below (STORY, TEAM, WHY, REVIEWS, ...). ★
// REPLACE comments mark every photo to add (see README).
// =========================================================

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Flame, Leaf, ShieldCheck, Truck } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import Stars from '../components/Stars.jsx';
import './Home.css';

/* ------------------------------------------------------------------
   EDITABLE CONTENT
------------------------------------------------------------------ */

// Hero. REPLACE: public/images/hero/hero-product.png (big product shot)
const HERO_IMAGE = '/images/hero/hero-product.png';
// Small snack pieces that drift around the hero. REPLACE: public/images/hero/float-1.png ...
const FLOATERS = [
  { src: '/images/hero/float-1.png', alt: 'A piece of sev', className: 'f1' },
  { src: '/images/hero/float-2.png', alt: 'A corn puff', className: 'f2' },
  { src: '/images/hero/float-3.png', alt: 'A khasta puri', className: 'f3' },
  { src: '/images/hero/float-4.png', alt: 'A peanut', className: 'f4' },
];

const MARQUEE = ['Namkeen', 'Khasta Puri', 'Corn Puff', 'Sev', 'Fresh Daily'];

// Image story: add, remove or reorder freely (4 to 5 works best).
// REPLACE: put these images in public/images/story/
const STORY = [
  { src: '/images/story/01-dough.jpg', alt: 'Hands kneading fresh dough', title: 'It starts with dough', text: 'Flour, spices and a lot of patience. Every batch is kneaded fresh each morning.' }, // REPLACE text
  { src: '/images/story/02-rolling.jpg', alt: 'Rolling out puri by hand', title: 'Rolled by hand', text: 'No shortcuts. Each puri is rolled and layered so it turns khasta when fried.' },
  { src: '/images/story/03-frying.jpg', alt: 'Golden snacks frying in a kadhai', title: 'Fried till golden', text: 'Slow frying in fresh oil gives that crunch you can hear across the room.' },
  { src: '/images/story/04-masala.jpg', alt: 'Masala being tossed over hot namkeen', title: 'Tossed in masala', text: 'The house masala goes on while it is still warm, so every piece is coated.' },
  { src: '/images/story/05-packing.jpg', alt: 'Packets being sealed', title: 'Sealed fresh', text: 'Packed the same day and sealed tight, so it reaches you as crisp as it left us.' },
];

// Category tiles link to the Shop with that category selected.
// REPLACE: public/images/hero/cat-*.png
const TILES = [
  { name: 'Namkeen', note: 'Bhujia, mixes, dal', img: '/images/hero/cat-namkeen.png', tone: 'brand' },
  { name: 'Khasta Puri', note: 'Flaky and golden', img: '/images/hero/cat-khasta.png', tone: 'accent' },
  { name: 'Corn Puff', note: 'Light and chatpata', img: '/images/hero/cat-corn.png', tone: 'ink' },
  { name: 'Sev', note: 'Ratlami, garlic, plain', img: '/images/hero/cat-sev.png', tone: 'white' },
];

const ABOUT_PHOTO = '/images/hero/about.jpg'; // REPLACE: big photo of the shop / family / factory
const ABOUT_TEXT = [
  // REPLACE: write your real brand story
  'Taran Hari began in a small kitchen with one simple idea: snacks should taste like they were made for you, because they were.',
  'Today we still fry in small batches, grind our own masalas and pack every order by hand. Same recipes, same care, a lot more crunch.',
];

// People cards. REPLACE names, roles, descriptions and photos (public/images/team/)
const TEAM = [
  { name: 'Founder Name', role: 'Founder', photo: '/images/team/founder.jpg', text: 'REPLACE: a short line about the founder and why they started Taran Hari.' },
  { name: 'Director Name', role: 'Main Director', photo: '/images/team/director.jpg', text: 'REPLACE: a short line about the main director and what they look after.' },
  { name: 'Co-founder Name', role: 'Co-founder', photo: '/images/team/cofounder.jpg', text: 'REPLACE: a short line about the co-founder.' },
  { name: 'Team Member', role: 'Head of Kitchen', photo: '/images/team/kitchen.jpg', text: 'REPLACE: a short line about this person.' },
];

// Edit the claims so they are true for your business.
const WHY = [
  { icon: Flame, title: 'Fresh daily', text: 'REPLACE: describe how often you fry, e.g. every morning.' },
  { icon: ShieldCheck, title: 'Hygienic kitchen', text: 'REPLACE: add your licence or hygiene details.' },
  { icon: Leaf, title: 'No artificial colours', text: 'REPLACE: confirm this claim before publishing.' },
  { icon: Truck, title: 'Delivered fast', text: 'REPLACE: add your real delivery time.' },
];

// REPLACE: with real customer reviews
const REVIEWS = [
  { name: 'Customer One', city: 'City', stars: 5, quote: 'REPLACE: Crispy, fresh and never stale. My family finishes a packet in a day.' },
  { name: 'Customer Two', city: 'City', stars: 5, quote: 'REPLACE: The ratlami sev is exactly like the one I grew up with.' },
  { name: 'Customer Three', city: 'City', stars: 4.5, quote: 'REPLACE: Khasta puri arrived in perfect shape. Will order again.' },
  { name: 'Customer Four', city: 'City', stars: 5, quote: 'REPLACE: Best corn puffs for the kids lunchbox.' },
  { name: 'Customer Five', city: 'City', stars: 5, quote: 'REPLACE: Ordered for Diwali hampers. Everyone asked where it was from.' },
];

/* ------------------------------------------------------------------
   Small helpers
------------------------------------------------------------------ */

// true when the screen matches a media query (updates live)
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

// A floating hero snack. If its image is missing we draw a flat blob instead.
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
   Page
------------------------------------------------------------------ */
export default function Home() {
  return (
    <div className="home">
      <Hero />
      <Marquee />
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
    <section className="hero band-paper">
      <div className="container hero__grid">
        <div className="hero__copy">
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Ek baar khao, baar baar maango
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}>
            Namkeen that <span className="hero__hl">crunches</span> back.
          </motion.h1>
          <motion.p className="hero__sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.16 }}>
            Fried fresh every morning, tossed in house masala, sealed for crunch. Your chai just found its best friend.
          </motion.p>
          <motion.div className="hero__btns" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.24 }}>
            <Link to="/shop" className="btn btn--lg">Shop Now <ArrowRight size={20} strokeWidth={3} aria-hidden="true" /></Link>
            <a href="#story" className="btn btn--lg btn--accent">Our Story</a>
          </motion.div>
        </div>

        <motion.div className="hero__visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
          <div className="hero__plate" />
          <div className="hero__img sticker">
            {/* REPLACE: public/images/hero/hero-product.png */}
            <Img src={HERO_IMAGE} alt="A heaped bowl of Taran Hari namkeen" eager />
          </div>
          {FLOATERS.map((f) => <Floater key={f.className} {...f} />)}

          {/* rotating round badge */}
          <div className="hero__badge" aria-hidden="true">
            <svg viewBox="0 0 120 120" className="hero__badgeRing">
              <defs><path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
              <text fontSize="13" fontWeight="800" fill="currentColor" letterSpacing="2.2">
                <textPath href="#circ">100% FRESH • MADE DAILY • 100% FRESH • MADE DAILY •</textPath>
              </text>
            </svg>
            <span className="hero__badgeMid">TH</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- 2. Marquee ---------- */
function Marquee() {
  const row = (hidden) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {[...MARQUEE, ...MARQUEE].map((w, i) => (
        <li key={i}>{w}<span className="marquee__dot" aria-hidden="true">•</span></li>
      ))}
    </ul>
  );
  return (
    <div className="marquee band-accent" role="region" aria-label="Our snacks: Namkeen, Khasta Puri, Corn Puff, Sev, fresh daily">
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------- 3. Image story (scroll-driven on desktop, stacked on mobile) ---------- */
function Story() {
  const reduce = useReducedMotion();
  const wide = useMedia('(min-width: 768px)');
  const sticky = wide && !reduce;

  return (
    <section id="story" className="story band-ink">
      <div className="container story__intro">
        <Reveal className="section-head">
          <span className="eyebrow">From kitchen to your kitchen</span>
          <h2>How a packet gets its crunch</h2>
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
          <div className="story__frame sticker">
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

// One image in the pile. Each later image slides up, scales and fades in over the previous one.
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
        <Reveal key={s.src} className="scard sticker" delay={0.05}>
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

/* ---------- 4. Category tiles ---------- */
function Categories() {
  return (
    <section className="section band-paper cats">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Pick your crunch</span>
          <h2>Four ways to say yum</h2>
        </Reveal>
        <ul className="cats__grid">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i * 0.08}>
              <Link to={`/shop?cat=${encodeURIComponent(t.name)}`} className={`tile tile--${t.tone}`}>
                <span className="tile__img"><Img src={t.img} alt={`${t.name} snack`} compact /></span>
                <span className="tile__name">{t.name}</span>
                <span className="tile__note">{t.note}</span>
                <span className="tile__go" aria-hidden="true"><ArrowRight size={20} strokeWidth={3} /></span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 5. About + team ---------- */
function About() {
  const [open, setOpen] = useState(null); // index of the flipped card (for touch)
  return (
    <section className="section band-accent about">
      <div className="container">
        <div className="about__top">
          <Reveal className="about__photo sticker">
            {/* REPLACE: public/images/hero/about.jpg */}
            <Img src={ABOUT_PHOTO} alt="The Taran Hari family and kitchen" />
          </Reveal>
          <Reveal className="about__text" delay={0.1}>
            <span className="eyebrow">Our story</span>
            <h2>Made with the same hands, every day</h2>
            {ABOUT_TEXT.map((t) => <p key={t}>{t}</p>)}
          </Reveal>
        </div>

        <Reveal className="section-head about__headTeam">
          <h2>The people behind the crunch</h2>
        </Reveal>
        <ul className="team">
          {TEAM.map((m, i) => {
            const flipped = open === i;
            return (
              <Reveal as="li" key={m.role} delay={i * 0.08}>
                <button
                  type="button"
                  className={`tcard ${flipped ? 'is-flipped' : ''}`}
                  aria-pressed={flipped}
                  aria-label={`${m.name}, ${m.role}. Tap to ${flipped ? 'hide' : 'read'} more`}
                  onClick={() => setOpen(flipped ? null : i)}
                >
                  <span className="tcard__inner">
                    <span className="tcard__face tcard__front sticker">
                      <span className="tcard__photo">
                        {/* REPLACE: photo in public/images/team/ */}
                        <Img src={m.photo} alt={`Photo of ${m.name}`} compact />
                      </span>
                      <span className="tcard__name">{m.name}</span>
                      <span className="tcard__role">{m.role}</span>
                      <span className="tcard__hint">Tap to flip</span>
                    </span>
                    <span className="tcard__face tcard__back sticker">
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

/* ---------- 6. Why Taran Hari ---------- */
function Why() {
  return (
    <section className="section band-paper why">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Why us</span>
          <h2>Why Taran Hari?</h2>
        </Reveal>
        <ul className="why__grid">
          {WHY.map((w, i) => (
            <Reveal as="li" key={w.title} delay={i * 0.08} className="wy sticker">
              <span className="wy__icon"><w.icon size={30} strokeWidth={2.6} aria-hidden="true" /></span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 7. Reviews ---------- */
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

  // follow the swipe to light the right dot
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.children[0]?.getBoundingClientRect().width || 1;
    const i = Math.round(el.scrollLeft / (w + 16));
    setIdx(Math.min(REVIEWS.length - 1, Math.max(0, i)));
  };

  // auto-advance on phones and tablets only; pauses on touch / hover / focus
  useEffect(() => {
    if (wide || paused || reduce) return undefined;
    const t = setInterval(() => goTo((idx + 1) % REVIEWS.length), 4500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, paused, wide, reduce]);

  const initials = (n) => n.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section className="section band-accent reviews">
      <div className="container">
        <Reveal className="section-head">
          <span className="eyebrow">Sabki zubaani</span>
          <h2>Loved by crunch fans</h2>
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
          <ul className="reviews__track" ref={trackRef} onScroll={onScroll} tabIndex={0} aria-label="Customer reviews, swipe sideways">
            {REVIEWS.map((r) => (
              <li key={r.name} className="rcard sticker">
                <Stars value={r.stars} size={18} />
                <blockquote>&ldquo;{r.quote}&rdquo;</blockquote>
                <div className="rcard__who">
                  {/* REPLACE: swap this initials circle for a photo if you have one */}
                  <span className="rcard__avatar" aria-hidden="true">{initials(r.name)}</span>
                  <span><strong>{r.name}</strong><br /><small>{r.city}</small></span>
                </div>
              </li>
            ))}
          </ul>
          <div className="reviews__dots" role="group" aria-label="Choose a review">
            {REVIEWS.map((r, i) => (
              <button key={r.name} type="button" className={i === idx ? 'is-on' : ''} onClick={() => goTo(i)} aria-label={`Show review ${i + 1}`} aria-current={i === idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 8. Final call to action ---------- */
function FinalCta() {
  return (
    <section className="cta band-brand">
      <div className="container cta__inner">
        <Reveal>
          <h2>Hungry yet?</h2>
          <p>Crunch. Munch. Repeat. Your next packet is a tap away.</p>
        </Reveal>
        <Reveal delay={0.12}>
          <Link to="/shop" className="btn btn--lg btn--accent cta__btn">Shop Now <ArrowRight size={22} strokeWidth={3} aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  );
}
