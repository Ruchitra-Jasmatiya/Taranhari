// =========================================================
// Logo.jsx - the Taran Hari wordmark, built from text + CSS so
// it never breaks. It links to Home.
//
// REPLACE: to use your own logo image, put it at
// public/images/logo.png and swap the <span className="logo__mark">
// block below for <img src="/images/logo.png" alt="" />.
// =========================================================

import { Link } from 'react-router-dom';
import './Logo.css';

export function LogoMark({ size = 'md' }) {
  return (
    <span className={`logo logo--${size}`}>
      <span className="logo__mark" aria-hidden="true">TH</span>
      <span className="logo__word">
        Taran<span className="logo__hari">Hari</span>
      </span>
    </span>
  );
}

// Clickable logo (goes home)
export default function Logo({ size = 'md', onClick }) {
  return (
    <Link to="/" className="logo-link" aria-label="Taran Hari - go to home" onClick={onClick}>
      <LogoMark size={size} />
    </Link>
  );
}
