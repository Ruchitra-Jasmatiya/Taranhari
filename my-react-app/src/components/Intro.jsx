

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LogoMark } from './Logo.jsx';
import './Intro.css';

const VIDEO_MS = 2800; // how long the video plays before we cut it
const FALLBACK_MS = 2000; // how long the fallback screen shows

export default function Intro({ onDone }) {
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const videoRef = useRef(null);
  const doneRef = useRef(false);
  const timerRef = useRef(null);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(timerRef.current);
    onDone();
  };

  const useFallback = reduce || failed;

  // Start the countdown. Restarts if we have to switch to the fallback.
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(finish, useFallback ? FALLBACK_MS : VIDEO_MS);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useFallback]);

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
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play?.().catch(() => setFailed(true));
    }
  }, []);

  return (
    <motion.div
      className={`intro ${useFallback ? 'intro--fallback' : ''}`}
      role="dialog"
      aria-label="Welcome to Taran Hari"
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      {!useFallback && (
        <video
          ref={videoRef}
          className="intro__video"
          src="/videos/intro.mp4"
          poster="/images/hero/intro-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      )}

      <div className="intro__content">
        <div className="intro__logo">
          <LogoMark size="lg" />
        </div>
        <p className="intro__line">Crunch. Munch. Repeat.</p>
      </div>

      <button type="button" className="intro__skip" onClick={finish} autoFocus>
        Skip <ArrowRight size={18} strokeWidth={3} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
