// =========================================================
// effects.js - two small delights, no libraries:
//   flyToCart(el)    a little snack flies from a button to the cart icon
//   confettiBurst(el) a confetti pop (used on the first add-to-cart)
// Both only animate transform + opacity and do nothing when the
// visitor prefers reduced motion.
// =========================================================

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Find the visible cart icon (top bar on desktop, tab bar on mobile)
function findCartTarget() {
  const all = document.querySelectorAll('[data-cart-target]');
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function flyToCart(fromEl) {
  if (reduced() || !fromEl) return;
  const target = findCartTarget();
  if (!target) return;

  const a = center(fromEl);
  const b = center(target);

  const dot = document.createElement('div');
  dot.setAttribute('aria-hidden', 'true');
  Object.assign(dot.style, {
    position: 'fixed',
    left: `${a.x - 14}px`,
    top: `${a.y - 14}px`,
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    border: '3px solid ' + getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(),
    zIndex: '200',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  });
  document.body.appendChild(dot);

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const anim = dot.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(1.15)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.2 },
    ],
    { duration: 600, easing: 'cubic-bezier(0.45, 0, 0.2, 1)' }
  );
  anim.onfinish = () => {
    dot.remove();
    // Little bump on the cart icon
    target.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 300, easing: 'ease-out' }
    );
  };
}

export function confettiBurst(fromEl) {
  if (reduced() || !fromEl) return;
  const root = getComputedStyle(document.documentElement);
  const colors = ['--brand', '--accent', '--ink', '--fresh'].map((v) => root.getPropertyValue(v).trim());
  const { x, y } = center(fromEl);
  const COUNT = 28;

  for (let i = 0; i < COUNT; i++) {
    const piece = document.createElement('div');
    piece.setAttribute('aria-hidden', 'true');
    const size = 6 + Math.random() * 7;
    Object.assign(piece.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`,
      background: colors[i % colors.length],
      border: '1.5px solid ' + root.getPropertyValue('--ink').trim(),
      zIndex: '200',
      pointerEvents: 'none',
      willChange: 'transform, opacity',
    });
    document.body.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 110;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 40;
    const rot = (Math.random() - 0.5) * 720;
    const anim = piece.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${tx * 1.1}px, ${ty + 90}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
    );
    anim.onfinish = () => piece.remove();
  }
}
