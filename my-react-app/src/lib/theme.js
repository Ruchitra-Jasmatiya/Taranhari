// =========================================================
// theme.js - switch between the 3 colour themes defined in
// styles/theme.css (A = Haldi & Chilli, B = Saffron & Leaf,
// C = Tomato & Corn). The choice is remembered.
// =========================================================

const KEY = 'taranhari-theme';
export const THEMES = [
  { id: 'A', name: 'Haldi & Chilli' },
  { id: 'B', name: 'Saffron & Leaf' },
  { id: 'C', name: 'Tomato & Corn' },
];

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return THEMES.some((t) => t.id === saved) ? saved : 'A';
  } catch {
    return 'A';
  }
}

export function setTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  // keep the browser UI colour in sync with the theme
  const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', brand);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

// Call once before the app renders
export function applySavedTheme() {
  setTheme(getTheme());
}
