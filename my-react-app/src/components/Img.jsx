
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import './Img.css';

export default function Img({ src, alt, className = '', compact = false, eager = false, hint, ...rest }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`img-ph ${compact ? 'img-ph--compact' : ''} ${className}`} role="img" aria-label={alt}>
        <ImageIcon size={compact ? 22 : 36} strokeWidth={2.5} aria-hidden="true" />
        {!compact && (
          <>
            <span className="img-ph__alt">{alt}</span>
            <span className="img-ph__path">REPLACE: {hint || src}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <img
      className={`img ${className}`}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
