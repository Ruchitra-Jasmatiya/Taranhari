// =========================================================
// FilterSheet.jsx - filters in a bottom sheet (modal on desktop).
// Price chips, veg-only toggle, spice level, pack size.
// Changes are held in a draft and only applied on "Apply".
// =========================================================

import { useEffect, useState } from 'react';
import BottomSheet from './BottomSheet.jsx';
import { PACK_SIZES, SPICE_LEVELS } from '../data/products.js';
import './FilterSheet.css';

// Price ranges shown as chips. Edit freely: id, label, min, max (₹).
export const PRICE_RANGES = [
  { id: 'p1', label: 'Under ₹75', min: 0, max: 74 },
  { id: 'p2', label: '₹75 - ₹100', min: 75, max: 100 },
  { id: 'p3', label: '₹101 - ₹150', min: 101, max: 150 },
  { id: 'p4', label: 'Above ₹150', min: 151, max: Infinity },
];

export const NO_FILTERS = { price: null, veg: false, spice: [], packs: [] };

export function countActive(f) {
  return (f.price ? 1 : 0) + (f.veg ? 1 : 0) + f.spice.length + f.packs.length;
}

const toggleIn = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function FilterSheet({ open, onClose, filters, onApply }) {
  const [draft, setDraft] = useState(filters);

  // Start from the applied filters each time the sheet opens
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <>
          <button type="button" className="btn btn--paper" onClick={() => setDraft(NO_FILTERS)}>Clear</button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Apply{countActive(draft) ? ` (${countActive(draft)})` : ''}
          </button>
        </>
      }
    >
      <div className="fs">
        <fieldset className="fs__group">
          <legend>Price</legend>
          <div className="fs__chips">
            {PRICE_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`chip chip--flat ${draft.price === r.id ? 'is-on' : ''}`}
                aria-pressed={draft.price === r.id}
                onClick={() => setDraft({ ...draft, price: draft.price === r.id ? null : r.id })}
              >
                {r.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="fs__group">
          <label className="switch">
            <input
              type="checkbox"
              checked={draft.veg}
              onChange={(e) => setDraft({ ...draft, veg: e.target.checked })}
            />
            <span className="switch__track" aria-hidden="true"><span className="switch__thumb" /></span>
            <span className="switch__label">Veg only</span>
          </label>
        </div>

        <fieldset className="fs__group">
          <legend>Spice level</legend>
          <div className="fs__chips">
            {SPICE_LEVELS.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip chip--flat ${draft.spice.includes(s) ? 'is-on' : ''}`}
                aria-pressed={draft.spice.includes(s)}
                onClick={() => setDraft({ ...draft, spice: toggleIn(draft.spice, s) })}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="fs__group">
          <legend>Pack size</legend>
          <div className="fs__chips">
            {PACK_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={`chip chip--flat ${draft.packs.includes(s) ? 'is-on' : ''}`}
                aria-pressed={draft.packs.includes(s)}
                onClick={() => setDraft({ ...draft, packs: toggleIn(draft.packs, s) })}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </BottomSheet>
  );
}
