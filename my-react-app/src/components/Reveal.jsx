// =========================================================
// Reveal.jsx - wrap anything to make it fade + rise into view
// when scrolled to. Use `delay` to stagger siblings.
//
//   <Reveal><h2>Hello</h2></Reveal>
//   <Reveal delay={0.1} as="li">...</Reveal>
//
// Only uses transform + opacity. Under prefers-reduced-motion
// framer-motion users get a plain fade (no movement).
// =========================================================

import { motion, useReducedMotion } from 'framer-motion';

export default function Reveal({ children, delay = 0, y = 32, as = 'div', className = '', ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: reduce ? 0.2 : 0.55, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
