

import { Link } from 'react-router-dom';
import './Logo.css';

export function LogoMark({ size = 'md' }) {
  return (
    <span className={`logo logo--${size}`}>
      <span className="logo__badge">Taranhari</span>
      <span className="logo__tag">Snacks &bull; Happiness &bull; Always</span>
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
