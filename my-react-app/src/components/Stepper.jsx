// =========================================================
// Stepper.jsx - the  [ - 1 + ]  quantity control.
// The number does a quick pop when it changes.
// =========================================================

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import './Stepper.css';

export default function Stepper({ qty, onChange, min = 0, max = 20, label = 'item', size = 'md' }) {
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(qty - 1)}
        disabled={qty <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus size={18} strokeWidth={3} />
      </button>
      <span className="stepper__val" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={qty}
            initial={{ y: -10, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
          >
            {qty}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus size={18} strokeWidth={3} />
      </button>
    </div>
  );
}
