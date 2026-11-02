// =========================================================
// Intro.jsx - full-screen welcome video, shown once per visit.
//
// HOW TO ADD YOUR VIDEO (7-8 seconds, no sound needed):
//   public/videos/intro-mobile.mp4   <- tall video for phones  (e.g. 720 x 1280)
//   public/videos/intro-desktop.mp4  <- wide video for computers (e.g. 1920 x 1080)
//   public/videos/intro.mp4          <- OR just one video used for both
// The video fills the whole screen. When it ends, the site opens.
// If no video is found, a short logo screen is shown instead.
// =========================================================
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LogoMark } from './Logo.jsx';
import './Intro.css';

const MAX_PLAY_MS = 9500; // never keep people waiting longer than this once it starts
const LOAD_MS = 6000; // if the video has not started by then, open the site
const FALLBACK_MS = 2000; // how long the logo screen shows when there is no video

// Phones (tall screens) try the mobile video first, computers the desktop one.
function pickSources() {
  const tall = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  return [tall ? '/videos/intro-mobile.mp4' : '/videos/intro-desktop.mp4', '/videos/intro.mp4'];
}

export default function Intro({ onDone }) {
  const reduce = useReducedMotion();
  const [sources] = useState(pickSources);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const loadTimer = useRef(null);
  const maxTimer = useRef(null);
  const fallbackTimer = useRef(null);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(loadTimer.current);
    clearTimeout(maxTimer.current);
    clearTimeout(fallbackTimer.current);
    onDone();
  };

  const useFallback = reduce || failed;

  // No video could play: show the logo for a moment, then open the site
  useEffect(() => {
    if (!useFallback) return undefined;
    clearTimeout(loadTimer.current);
    clearTimeout(maxTimer.current);
    fallbackTimer.current = setTimeout(finish, FALLBACK_MS);
    return () => clearTimeout(fallbackTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFallback]);

  // The video must start within LOAD_MS (slow network) - otherwise go to the logo screen
  useEffect(() => {
    if (useFallback) return undefined;
    loadTimer.current = setTimeout(() => setFailed(true), LOAD_MS);
    return () => clearTimeout(loadTimer.current);
  }, [useFallback, idx]);

  // Escape key = skip
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && finish();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock scroll while the intro is up
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Some browsers ignore the muted attribute until it is set in JS
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      // Only "autoplay blocked" goes to the logo screen. A missing file is handled by onError,
      // which tries the next video file first.
      v.play?.().catch((err) => { if (err && err.name === 'NotAllowedError') setFailed(true); });
    }
  }, [idx, useFallback]);

  // Try the next file (mobile/desktop file missing -> intro.mp4), then give up
  const onVideoError = () => {
    if (idx < sources.length - 1) setIdx(idx + 1);
    else setFailed(true);
  };

  const onPlaying = () => {
    clearTimeout(loadTimer.current);
    clearTimeout(maxTimer.current);
    maxTimer.current = setTimeout(finish, MAX_PLAY_MS);
  };

  return (
    <motion.div
      className={`intro ${useFallback ? 'intro--fallback' : 'intro--video'}`}
      role="dialog"
      aria-label="Welcome to Taran Hari"
      initial={{ y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {!useFallback && (
        <video
          key={sources[idx]}
          ref={videoRef}
          className="intro__video"
          src={sources[idx]}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlaying={onPlaying}
          onEnded={finish}
          onError={onVideoError}
        />
      )}

      {/* the logo shows only when there is no video, so your video is seen clean */}
      {useFallback && (
        <div className="intro__content">
          <div className="intro__logo">
            <LogoMark size="lg" />
          </div>
          <p className="intro__line">Crunch. Munch. Repeat.</p>
        </div>
      )}

      <button type="button" className="intro__skip" onClick={finish} autoFocus>
        Skip <ArrowRight size={18} strokeWidth={3} aria-hidden="true" />
      </button>
    </motion.div>
  );
}