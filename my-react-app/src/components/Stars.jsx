// =========================================================
// Stars.jsx - star rating. <Stars value={4.6} /> or with count.
// Filled stars use --accent with an --ink outline (flat colours).
// =========================================================

import { Star } from 'lucide-react';
import './Stars.css';

export default function Stars({ value = 0, count, size = 16 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="stars" role="img" aria-label={`Rated ${value} out of 5${count ? ` from ${count} reviews` : ''}`}>
      <span className="stars__row" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            strokeWidth={2.2}
            className={n <= rounded ? 'star star--on' : n - 0.5 === rounded ? 'star star--half' : 'star'}
          />
        ))}
      </span>
      <span className="stars__num" aria-hidden="true">
        {value.toFixed(1)}
        {count ? <span className="stars__count"> ({count})</span> : null}
      </span>
    </span>
  );
}
