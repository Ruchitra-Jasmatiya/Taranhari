

import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ToastProvider } from './components/Toast.jsx';
import { SiteProvider } from './context/SiteContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import Intro from './components/Intro.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Cart from './pages/Cart.jsx';
import Contact from './pages/Contact.jsx';
import Seo from './components/Seo.jsx';
import { Privacy, Terms, Refund, NotFound } from './pages/Policy.jsx';

const INTRO_KEY = 'taranhari-intro-seen';

function introAlreadySeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

// Jump to the top whenever the page (not just the ?query) changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Wraps each page in a quick fade + rise
function PageTransition({ children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(() => !introAlreadySeen());

  const closeIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    setShowIntro(false);
  };

  return (
    <ToastProvider>
      <SiteProvider>
      <CartProvider>
        <a href="#main" className="skip-link">Skip to content</a>

        <AnimatePresence>{showIntro && <Intro key="intro" onDone={closeIntro} />}</AnimatePresence>

        <ScrollToTop />
        <Seo />
        <Navbar />

        <main id="main" className="page">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
              <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
              <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
              <Route path="/refund" element={<PageTransition><Refund /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </CartProvider>
      </SiteProvider>
    </ToastProvider>
  );
}