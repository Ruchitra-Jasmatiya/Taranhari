// =========================================================
// Toast.jsx - small slide-in messages (Add to cart, Wishlist,
// Remove with Undo, Coupon...).
//
//   const toast = useToast();
//   toast.show('Saved!', { type: 'success' });             // success | error | info
//   toast.show('Removed', { action: { label: 'Undo', onClick: () => ... } });
// =========================================================

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, X, AlertTriangle } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = { success: Check, info: Info, error: AlertTriangle };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, opts = {}) => {
      const id = ++idRef.current;
      const toast = { id, message, type: opts.type || 'info', action: opts.action || null };
      // keep at most 3 on screen
      setToasts((list) => [...list.slice(-2), toast]);
      const duration = opts.duration ?? (opts.action ? 5500 : 3000);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss]
  );

  // Stable object so consumers don't re-render on every toast
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="region" aria-label="Notifications" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                layout
                className={`toast toast--${t.type}`}
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="toast__icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={3} />
                </span>
                <span className="toast__msg">{t.message}</span>
                {t.action && (
                  <button
                    type="button"
                    className="toast__action"
                    onClick={() => {
                      t.action.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss message">
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
