// =========================================================
// shop.js - all the business logic of the Taran Hari backend.
// Prices, discounts, stock and orders are ALWAYS calculated here on
// the server, never trusted from the browser.
// =========================================================
import { db } from './store.js';
import { SEED, SEED_COUPONS, SEED_OFFERS, SEED_SETTINGS, SEED_CONTENT } from './seed.js';

/* ------------------------------- tiny helpers ------------------------------- */
export class HttpError extends Error {
  constructor(status, message, extra = {}) { super(message); this.status = status; this.extra = extra; }
}
export const bad = (msg, extra) => new HttpError(400, msg, extra);
export const str = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
export const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
export const bool = (v, d = false) => (v === undefined || v === null ? d : v === true || v === 'true' || v === 1 || v === '1');
export const money = (n) => Math.round(num(n) * 100) / 100;
export const int = (v, d = 0, min = 0, max = 1_000_000) => Math.max(min, Math.min(max, Math.floor(num(v, d))));
export const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
export const PAY_METHODS = ['cod', 'cash', 'upi', 'card', 'online'];
export const SPICES = ['Mild', 'Medium', 'Hot'];
export const TONES = ['brand', 'accent', 'ink', 'white'];

/** Accepts an http(s) link, a path inside the site (/images/x.jpg, /api/images/ab12) or empty. */
export function link(v, label = 'Link') {
  const s = str(v, 700);
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || /^\/(?!\/)[\w\-./%~+@:,=?&#]*$/.test(s)) return s;
  throw bad(`${label}: use a link starting with https:// or upload an image`);
}
const today = () => new Date().toISOString().slice(0, 10);
function inWindow(o) {
  const now = Date.now();
  if (o.startsAt && now < new Date(`${o.startsAt}T00:00:00+05:30`).getTime()) return false;
  if (o.endsAt && now > new Date(`${o.endsAt}T23:59:59+05:30`).getTime()) return false;
  return true;
}
const dateStr = (v, label) => {
  const s = str(v, 10);
  if (!s) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw bad(`${label}: use a valid date`);
  return s;
};

/* ---------------------------------- seeding ---------------------------------- */
let seeded = false;
export async function ensureSeed() {
  if (seeded) return;
  const first = await db.cmd('SET', 'meta:seeded', '1', 'NX');
  if (first === 'OK') await writeSeed();
  seeded = true;
}
export async function writeSeed() {
  const cmds = [];
  for (const c of SEED.categories) cmds.push(['HSET', 'categories', String(c.id), JSON.stringify(c)]);
  for (const p of SEED.products) cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]);
  for (const c of SEED_COUPONS) cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]);
  for (const o of SEED_OFFERS) cmds.push(['HSET', 'offers', String(o.id), JSON.stringify(o)]);
  cmds.push(['SET', 'settings', JSON.stringify(SEED_SETTINGS)]);
  cmds.push(['SET', 'content', JSON.stringify(SEED_CONTENT)]);
  cmds.push(['SET', 'seq:category', String(Math.max(...SEED.categories.map((c) => c.id)))]);
  cmds.push(['SET', 'seq:offer', String(Math.max(...SEED_OFFERS.map((o) => o.id)))]);
  cmds.push(['INCR', 'ver']);
  await db.pipe(cmds);
}

/* --------------------------------- settings --------------------------------- */
export async function getSettings() {
  const s = (await db.getJSON('settings')) || {};
  return { ...SEED_SETTINGS, ...s, invoice: { ...SEED_SETTINGS.invoice, ...(s.invoice || {}) } };
}
export const PUBLIC_SETTINGS = ['shopName', 'tagline', 'currency', 'announcement', 'deliveryFee', 'freeDeliveryAbove', 'minOrder', 'acceptingOrders'];
export const publicSettings = (s) => Object.fromEntries(PUBLIC_SETTINGS.map((k) => [k, s[k]]));
export function cleanSettings(b, cur) {
  const inv = { ...(cur.invoice || {}), ...(b.invoice && typeof b.invoice === 'object' ? b.invoice : {}) };
  return {
    ...cur,
    shopName: str(b.shopName ?? cur.shopName, 60) || 'Taran Hari',
    tagline: str(b.tagline ?? cur.tagline, 120),
    currency: str(b.currency ?? cur.currency, 4) || '₹',
    announcement: str(b.announcement ?? cur.announcement, 200),
    deliveryFee: Math.max(0, money(b.deliveryFee ?? cur.deliveryFee)),
    freeDeliveryAbove: Math.max(0, money(b.freeDeliveryAbove ?? cur.freeDeliveryAbove)),
    minOrder: Math.max(0, money(b.minOrder ?? cur.minOrder)),
    acceptingOrders: bool(b.acceptingOrders, cur.acceptingOrders !== false),
    allowStacking: bool(b.allowStacking, cur.allowStacking !== false),
    gstPercent: Math.min(100, Math.max(0, money(b.gstPercent ?? cur.gstPercent))),
    invoice: {
      businessName: str(inv.businessName, 80), address: str(inv.address, 300), phone: str(inv.phone, 30),
      email: str(inv.email, 80), gstin: str(inv.gstin, 20), footerNote: str(inv.footerNote, 200), upiId: str(inv.upiId, 60),
    },
  };
}

/* ---------------------------- editable page content ---------------------------- */
export async function getContent() {
  const c = (await db.getJSON('content')) || {};
  return {
    home: { ...SEED_CONTENT.home, ...(c.home || {}) },
    shop: { ...SEED_CONTENT.shop, ...(c.shop || {}) },
    contact: { ...SEED_CONTENT.contact, ...(c.contact || {}) },
  };
}
const rid = () => Math.random().toString(36).slice(2, 9);
const list = (v, max, fn) => (v === null ? null : Array.isArray(v) ? v.slice(0, max).map(fn).filter(Boolean) : undefined);
const needUrl = (v, label) => { const u = link(v, label); if (!u) throw bad(`${label} is required`); return u; };

/** Cleans one section of the website content. `null` for a field = "use the website's built-in default". */
export function cleanContent(section, b, cur) {
  const out = { ...cur };
  const set = (k, v) => { if (v !== undefined) out[k] = v; };
  if (section === 'home') {
    if ('heroImage' in b) set('heroImage', b.heroImage ? link(b.heroImage, 'Hero image') : null);
    if ('aboutPhoto' in b) set('aboutPhoto', b.aboutPhoto ? link(b.aboutPhoto, 'About photo') : null);
    if ('banners' in b) set('banners', list(b.banners, 12, (x) => ({ id: str(x.id, 12) || rid(), src: needUrl(x.src, 'Banner image'), alt: str(x.alt, 120) || 'Taran Hari banner' })));
    if ('blocks' in b) set('blocks', list(b.blocks, 24, (x) => ({ id: str(x.id, 12) || rid(), src: needUrl(x.src, 'Gallery image'), title: str(x.title, 60), tag: str(x.tag, 24) })));
    if ('videos' in b) set('videos', list(b.videos, 8, (x) => ({ id: str(x.id, 12) || rid(), src: needUrl(x.src, 'Video link'), title: str(x.title, 80), desc: str(x.desc, 240) })));
    if ('marquee' in b) set('marquee', list(b.marquee, 20, (x) => str(typeof x === 'string' ? x : x?.text, 40) || null));
    if ('aboutText' in b) set('aboutText', list(b.aboutText, 6, (x) => str(typeof x === 'string' ? x : x?.text, 600) || null));
    if ('team' in b) set('team', list(b.team, 12, (x) => (str(x.name, 60) ? { id: str(x.id, 12) || rid(), name: str(x.name, 60), role: str(x.role, 60), photo: link(x.photo, 'Photo'), text: str(x.text, 300) } : null)));
    if ('reviews' in b) set('reviews', list(b.reviews, 30, (x) => (str(x.quote, 400) ? { id: str(x.id, 12) || rid(), name: str(x.name, 60) || 'Customer', city: str(x.city, 40), stars: Math.min(5, Math.max(0, Math.round(num(x.stars, 5) * 2) / 2)), quote: str(x.quote, 400) } : null)));
  } else if (section === 'shop') {
    if ('factoryVideo' in b) set('factoryVideo', b.factoryVideo ? link(b.factoryVideo, 'Video link') : null);
    if ('factoryPoster' in b) set('factoryPoster', b.factoryPoster ? link(b.factoryPoster, 'Video cover image') : null);
    if ('quotes' in b) set('quotes', list(b.quotes, 12, (x) => (str(x.text, 240) ? { id: str(x.id, 12) || rid(), text: str(x.text, 240), who: str(x.who, 80) } : null)));
    if ('chaat' in b) set('chaat', list(b.chaat, 24, (x) => ({ id: str(x.id, 12) || rid(), src: needUrl(x.src, 'Gallery image'), caption: str(x.caption, 60) })));
  } else if (section === 'contact') {
    const T = (k, n) => { if (k in b) out[k] = str(b[k], n); };
    T('ownerName', 80); T('ownerRole', 120); T('ownerBio', 400); T('phoneDisplay', 30); T('whatsappMessage', 240);
    T('addressShort', 160); T('addressFull', 400); T('hours', 120);
    if ('ownerPhoto' in b) out.ownerPhoto = link(b.ownerPhoto, 'Owner photo');
    for (const k of ['instagram', 'facebook', 'youtube', 'mapUrl']) if (k in b) out[k] = link(b[k], k);
    if ('phoneTel' in b) { const t = str(b.phoneTel, 20).replace(/[^\d+]/g, ''); out.phoneTel = t; }
    if ('whatsapp' in b) out.whatsapp = str(b.whatsapp, 20).replace(/\D/g, '');
    if ('email' in b) {
      const e = str(b.email, 100);
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw bad('Enter a valid email address');
      out.email = e;
    }
    // Keep phone link + WhatsApp number in step with the displayed number when only that was typed
    if ('phoneDisplay' in b && !('phoneTel' in b) && !cur.phoneTel) out.phoneTel = out.phoneDisplay.replace(/[^\d+]/g, '');
  } else throw new HttpError(404, 'Unknown page');
  return out;
}

/* ------------------------------ categories ------------------------------ */
export function cleanCategory(b, all, cur = {}) {
  const name = str(b.name ?? cur.name, 40);
  if (name.length < 2) throw bad('Category name is required (min 2 characters)');
  if (all.some((c) => c.id !== cur.id && c.name.toLowerCase() === name.toLowerCase())) throw new HttpError(409, 'A category with this name already exists');
  const tone = TONES.includes(b.tone ?? cur.tone) ? (b.tone ?? cur.tone) : 'brand';
  return {
    id: cur.id, name, note: str(b.note ?? cur.note, 80), image: link(b.image ?? cur.image, 'Category image'), tone,
    active: bool(b.active, cur.active !== false), sortOrder: int(b.sortOrder ?? cur.sortOrder, all.length + 1, 0, 9999),
    createdAt: cur.createdAt || Date.now(), updatedAt: Date.now(),
  };
}
export const catOrder = (a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id) || a.id - b.id;
export const maps = (cats) => new Map(cats.map((c) => [c.id, c]));

/* ------------------------------- products ------------------------------- */
const defSize = (p) => (p.sizes || []).find((s) => s.label === p.weight && s.enabled !== false) || (p.sizes || []).find((s) => s.enabled !== false) || p.sizes?.[0];
export const totalStock = (p) => (p.sizes || []).filter((s) => s.enabled !== false).reduce((n, s) => n + num(s.stock), 0);
const inStockSize = (p, s) => p.trackStock === false || num(s.stock) > 0;

/** The shape the website receives. Never exposes exact stock, only "left" when it is running low. */
export function shapeProduct(p, cm) {
  const cat = cm.get(p.categoryId);
  const sizes = (p.sizes || []).filter((s) => s.enabled !== false).map((s) => {
    const price = money(s.price); const mrp = money(s.mrp) > price ? money(s.mrp) : price;
    const ok = inStockSize(p, s);
    const out = { label: s.label, price, mrp, inStock: ok };
    if (p.trackStock !== false && ok && num(s.stock) <= num(p.lowStockAt, 10)) out.left = num(s.stock);
    return out;
  });
  const d = sizes.find((s) => s.label === defSize(p)?.label) || sizes[0] || { label: p.weight || '', price: 0, mrp: 0, inStock: false };
  return {
    id: p.id, name: p.name, category: cat?.name || '', categoryId: p.categoryId, description: p.description || '', image: p.image || '',
    price: d.price, mrp: d.mrp, weight: d.label, sizes, rating: num(p.rating, 4.5), reviews: int(p.reviews), spice: p.spice || 'Mild',
    veg: p.veg !== false, tags: p.tags || [], trending: !!p.trending, inStock: sizes.some((s) => s.inStock),
    discountPercent: d.mrp > d.price ? Math.round((1 - d.price / d.mrp) * 100) : 0,
  };
}
export const visibleProducts = (products, cats) => {
  const cm = maps(cats);
  return products.filter((p) => p.active !== false && cm.get(p.categoryId)?.active !== false && (p.sizes || []).some((s) => s.enabled !== false)).map((p) => shapeProduct(p, cm));
};
export const visibleCategories = (cats, products) => cats.filter((c) => c.active !== false).sort(catOrder)
  .map((c) => ({ id: c.id, name: c.name, note: c.note || '', image: c.image || '', tone: c.tone || 'brand', productCount: products.filter((p) => p.active !== false && p.categoryId === c.id).length }));

/** Full detail for the admin panel (includes stock numbers and hidden sizes). */
export function adminProduct(p, cm) {
  const total = totalStock(p);
  const low = p.trackStock !== false && (p.sizes || []).some((s) => s.enabled !== false && num(s.stock) <= num(p.lowStockAt, 10));
  const out = p.trackStock !== false && total <= 0;
  return { ...p, category: cm.get(p.categoryId)?.name || '', totalStock: total, stockStatus: out ? 'out' : low ? 'low' : 'ok' };
}

export function cleanSizes(raw) {
  if (!Array.isArray(raw) || !raw.length) throw bad('Add at least one pack size (for example 200 g)');
  const seen = new Set();
  const sizes = raw.slice(0, 8).map((s) => {
    const label = str(s.label, 16);
    if (!label) throw bad('Every pack size needs a label (for example 200 g)');
    if (seen.has(label.toLowerCase())) throw bad(`Pack size "${label}" is listed twice`);
    seen.add(label.toLowerCase());
    const price = money(s.price);
    if (!(price >= 0) || price > 1_000_000) throw bad(`Enter a valid price for ${label}`);
    const mrp = money(s.mrp) || price;
    return { label, price, mrp: mrp < price ? price : mrp, stock: int(s.stock, 0), enabled: bool(s.enabled, true) };
  });
  if (!sizes.some((s) => s.enabled)) throw bad('At least one pack size must stay enabled');
  return sizes;
}

export function cleanProduct(b, cats, cur = {}) {
  const get = (k, d) => (b[k] !== undefined ? b[k] : d);
  const name = str(get('name', cur.name), 120);
  if (name.length < 2) throw bad('Product name is required (min 2 characters)');
  const categoryId = Number(get('categoryId', cur.categoryId));
  if (!cats.some((c) => c.id === categoryId)) throw bad('Choose a valid category');
  let sizes = cur.sizes;
  if (b.sizes !== undefined) sizes = cleanSizes(b.sizes);
  else if (!sizes) sizes = cleanSizes([{ label: str(b.weight, 16) || '200 g', price: b.price, mrp: b.mrp, stock: b.stock ?? 50 }]);
  let tags = get('tags', cur.tags || []);
  if (typeof tags === 'string') tags = tags.split(/[\n,]/);
  tags = (Array.isArray(tags) ? tags : []).map((t) => str(t, 30).toLowerCase()).filter(Boolean).slice(0, 15);
  const spice = SPICES.includes(get('spice', cur.spice)) ? get('spice', cur.spice) : 'Mild';
  const wanted = str(get('weight', cur.weight), 16);
  const weight = sizes.some((s) => s.label === wanted && s.enabled) ? wanted : sizes.find((s) => s.enabled).label;
  return {
    id: cur.id, name, categoryId, weight, sizes, tags, spice,
    description: str(get('description', cur.description), 1200),
    image: link(get('image', cur.image), 'Product image'),
    rating: Math.min(5, Math.max(0, Math.round(num(get('rating', cur.rating), 4.5) * 10) / 10)),
    reviews: int(get('reviews', cur.reviews), 0),
    veg: bool(get('veg', cur.veg), true), trending: bool(get('trending', cur.trending), false),
    active: bool(get('active', cur.active), true), trackStock: bool(get('trackStock', cur.trackStock), true),
    lowStockAt: int(get('lowStockAt', cur.lowStockAt), 10, 0, 100000),
    sold: cur.sold || 0, createdAt: cur.createdAt || Date.now(), updatedAt: Date.now(),
  };
}

/* ------------------------------ coupons & offers ------------------------------ */
export function cleanCoupon(b, cur = {}) {
  const code = str(b.code ?? cur.code, 24).toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (code.length < 3) throw bad('Coupon code must be at least 3 letters or numbers');
  const type = ['percent', 'flat'].includes(b.type ?? cur.type) ? (b.type ?? cur.type) : 'percent';
  const value = money(b.value ?? cur.value);
  if (!(value > 0)) throw bad('Enter the discount amount');
  if (type === 'percent' && value > 100) throw bad('A percentage discount cannot be more than 100');
  return {
    code, type, value, description: str(b.description ?? cur.description, 120),
    minOrder: Math.max(0, money(b.minOrder ?? cur.minOrder)), maxDiscount: Math.max(0, money(b.maxDiscount ?? cur.maxDiscount)),
    usageLimit: int(b.usageLimit ?? cur.usageLimit, 0), used: cur.used || 0,
    startsAt: dateStr(b.startsAt ?? cur.startsAt, 'Start date'), endsAt: dateStr(b.endsAt ?? cur.endsAt, 'End date'),
    active: bool(b.active, cur.active !== false),
  };
}
export function cleanOffer(b, cur = {}) {
  const name = str(b.name ?? cur.name, 60);
  if (name.length < 2) throw bad('Give the offer a name');
  const type = ['percent', 'flat'].includes(b.type ?? cur.type) ? (b.type ?? cur.type) : 'percent';
  const value = money(b.value ?? cur.value);
  if (!(value > 0)) throw bad('Enter the discount amount');
  if (type === 'percent' && value > 100) throw bad('A percentage discount cannot be more than 100');
  return {
    id: cur.id, name, type, value, minOrder: Math.max(0, money(b.minOrder ?? cur.minOrder)),
    maxDiscount: Math.max(0, money(b.maxDiscount ?? cur.maxDiscount)), categoryId: int(b.categoryId ?? cur.categoryId, 0),
    startsAt: dateStr(b.startsAt ?? cur.startsAt, 'Start date'), endsAt: dateStr(b.endsAt ?? cur.endsAt, 'End date'),
    active: bool(b.active, cur.active !== false),
  };
}
const discountOf = (d, base) => {
  let a = d.type === 'percent' ? (base * d.value) / 100 : d.value;
  if (d.type === 'percent' && d.maxDiscount > 0) a = Math.min(a, d.maxDiscount);
  return money(Math.max(0, Math.min(a, base)));
};

/** Why can't this coupon be used? Returns an error message, or '' when it is fine. */
export function couponProblem(c, subtotal) {
  if (!c || c.active === false) return 'That coupon code is not valid';
  if (!inWindow(c)) return 'That coupon has expired or has not started yet';
  if (c.usageLimit > 0 && c.used >= c.usageLimit) return 'That coupon has been fully used';
  if (subtotal < c.minOrder) return `Add items worth ₹${money(c.minOrder - subtotal)} more to use ${c.code} (minimum order ₹${c.minOrder})`;
  return '';
}

/* --------------------------------- pricing --------------------------------- */
/**
 * Price a basket. input = [{ id, size, qty }].
 * Returns every line (with problems flagged), all discounts, delivery and the total.
 */
export async function priceCart(input, opts = {}) {
  const { couponCode = '', pos = false, manual = null, maxQty = 50 } = opts;
  const [products, cats, settings, offers] = await Promise.all([db.all('products'), db.all('categories'), getSettings(), db.all('offers')]);
  const pm = new Map(products.map((p) => [String(p.id), p]));
  const cm = maps(cats);
  const warnings = [];
  const merged = new Map();
  for (const it of Array.isArray(input) ? input.slice(0, 60) : []) {
    const key = `${str(it.id, 40)}|${str(it.size, 16)}`;
    const q = int(it.qty, 1, 0, maxQty);
    if (q > 0) merged.set(key, { id: str(it.id, 40), size: str(it.size, 16), qty: Math.min(maxQty, (merged.get(key)?.qty || 0) + q) });
  }
  const lines = [];
  for (const [key, it] of merged) {
    const p = pm.get(it.id);
    const base = { key, id: it.id, size: it.size, qty: it.qty, name: p?.name || 'Item', image: p?.image || '', veg: p ? p.veg !== false : true, categoryId: p?.categoryId, category: cm.get(p?.categoryId)?.name || '' };
    const catOff = p && cm.get(p.categoryId)?.active === false;
    if (!p || p.active === false || catOff) { lines.push({ ...base, price: 0, mrp: 0, lineTotal: 0, available: false, issue: 'No longer available' }); continue; }
    const sz = (p.sizes || []).find((s) => s.label === it.size && s.enabled !== false);
    if (!sz) { lines.push({ ...base, price: 0, mrp: 0, lineTotal: 0, available: false, issue: 'This pack size is no longer available' }); continue; }
    let qty = it.qty;
    let issue = '';
    let available = true;
    if (p.trackStock !== false) {
      const have = num(sz.stock);
      if (have <= 0) { available = false; issue = 'Out of stock'; }
      else if (qty > have) { warnings.push(`Only ${have} of ${p.name} (${sz.label}) left. Quantity adjusted.`); qty = have; }
    }
    const price = money(sz.price); const mrp = Math.max(price, money(sz.mrp));
    lines.push({ ...base, qty, price, mrp, lineTotal: available ? money(price * qty) : 0, available, issue, maxQty: p.trackStock === false ? maxQty : Math.min(maxQty, num(sz.stock)) });
  }
  const live = lines.filter((l) => l.available);
  const subtotal = money(live.reduce((n, l) => n + l.lineTotal, 0));
  const mrpTotal = money(live.reduce((n, l) => n + l.mrp * l.qty, 0));

  // 1) automatic offers (best one wins)
  let offer = null;
  for (const o of offers) {
    if (o.active === false || !inWindow(o) || subtotal < num(o.minOrder)) continue;
    const baseAmt = o.categoryId ? live.filter((l) => l.categoryId === o.categoryId).reduce((n, l) => n + l.lineTotal, 0) : subtotal;
    const amount = discountOf(o, baseAmt);
    if (amount > 0 && (!offer || amount > offer.amount)) offer = { id: o.id, name: o.name, amount };
  }
  // 2) coupon
  let coupon = null; let couponError = '';
  const code = str(couponCode, 24).toUpperCase();
  if (code) {
    const c = await db.get('coupons', code);
    couponError = couponProblem(c, subtotal);
    if (!couponError) {
      const afterOffer = settings.allowStacking !== false && offer ? subtotal - offer.amount : subtotal;
      const amount = discountOf(c, afterOffer);
      if (settings.allowStacking === false && offer) {
        if (amount > offer.amount) { coupon = { code: c.code, amount, label: c.description || `${c.code} applied` }; offer = null; }
        else { couponError = `${c.code} cannot be combined with the "${offer.name}" offer, which saves you more`; }
      } else coupon = { code: c.code, amount, label: c.description || `${c.code} applied` };
    }
  }
  let discount = money((offer?.amount || 0) + (coupon?.amount || 0));
  // 3) manual discount (counter billing)
  let manualAmount = 0;
  if (manual && num(manual.value) > 0) {
    const remaining = Math.max(0, subtotal - discount);
    manualAmount = discountOf({ type: manual.type === 'percent' ? 'percent' : 'flat', value: num(manual.value), maxDiscount: 0 }, remaining);
    discount = money(discount + manualAmount);
  }
  const afterDiscount = money(Math.max(0, subtotal - discount));
  const delivery = pos || !live.length || afterDiscount >= num(settings.freeDeliveryAbove) ? 0 : money(settings.deliveryFee);
  const total = money(afterDiscount + delivery);
  const gst = num(settings.gstPercent);
  const taxAmount = gst > 0 ? money(total - total / (1 + gst / 100)) : 0;
  return {
    lines, subtotal, mrpTotal, offer, coupon, couponError, manualDiscount: manualAmount, discount, delivery, total,
    tax: { percent: gst, amount: taxAmount, inclusive: true }, warnings,
    freeLeft: pos ? 0 : Math.max(0, money(num(settings.freeDeliveryAbove) - afterDiscount)),
    youSaved: money(mrpTotal - subtotal + discount), count: live.reduce((n, l) => n + l.qty, 0), settings,
  };
}
/** What the website needs back from a quote (no server-only data). */
export function publicQuote(q) {
  const { settings, ...rest } = q;
  return { ...rest, freeDeliveryAbove: settings.freeDeliveryAbove, minOrder: settings.minOrder, acceptingOrders: settings.acceptingOrders !== false };
}

/* ---------------------------------- stock ---------------------------------- */
async function logStock(entries) {
  if (!entries.length) return;
  const cmds = [];
  let last = 0;
  for (const e of entries) {
    last = await db.nextId('log');
    cmds.push(['HSET', 'stocklog', String(last), JSON.stringify({ id: last, ts: Date.now(), ...e })]);
  }
  await db.pipe(cmds);
  if (last % 40 === 0 && last > 600) { // keep the newest ~600 entries
    const old = Object.keys((await db.all('stocklog')).reduce((o, e) => ((e.id <= last - 600 ? (o[e.id] = 1) : 0), o), {}));
    if (old.length) await db.pipe(old.map((id) => ['HDEL', 'stocklog', id]));
  }
}
/** Change the stock of one pack size. `delta` adds/removes; `set` sets an exact number. */
export async function changeStock(productId, size, { delta, set, reason = 'Manual change', order = '' }) {
  const release = await db.lock('stock');
  try {
    const p = await db.get('products', productId);
    if (!p) throw new HttpError(404, 'Product not found');
    const s = (p.sizes || []).find((x) => x.label === size);
    if (!s) throw new HttpError(404, 'Pack size not found');
    const before = num(s.stock);
    const after = set !== undefined ? int(set, 0) : Math.max(0, before + Math.trunc(num(delta)));
    if (after === before) return { product: p, before, after };
    s.stock = after; p.updatedAt = Date.now();
    await db.pipe([['HSET', 'products', String(p.id), JSON.stringify(p)], ['INCR', 'ver']]);
    await logStock([{ productId: p.id, name: p.name, size, delta: after - before, after, reason, order }]);
    return { product: p, before, after };
  } finally { await release(); }
}

/* ---------------------------------- orders ---------------------------------- */
export const digits = (s) => String(s || '').replace(/\D/g, '');
function cleanCustomer(c = {}, pos) {
  const name = str(c.name, 80) || (pos ? 'Walk-in customer' : '');
  const phone = digits(c.phone);
  const address = str(c.address, 400);
  if (!pos) {
    if (name.length < 2) throw bad('Please enter your name');
    if (phone.length < 10 || phone.length > 13) throw bad('Please enter a valid 10-digit phone number');
    if (address.length < 8) throw bad('Please enter your full delivery address');
  } else if (c.phone && (phone.length < 10 || phone.length > 13)) throw bad('Enter a valid phone number or leave it empty');
  return { name, phone, email: str(c.email, 100), address, city: str(c.city, 60), pincode: digits(c.pincode).slice(0, 6) };
}

/** Creates an order (website checkout, or counter billing when pos = true). Stock is reserved atomically. */
export async function placeOrder(body, { pos = false, ip = '' } = {}) {
  const settings = await getSettings();
  if (!pos && settings.acceptingOrders === false) throw new HttpError(503, 'We are not taking orders right now. Please try again later.');
  const customer = cleanCustomer(body.customer, pos);
  const method = pos ? (PAY_METHODS.includes(body.payMethod) ? body.payMethod : 'cash') : 'cod';
  const release = await db.lock('stock');
  try {
    const q = await priceCart(body.items, { couponCode: body.coupon, pos, manual: pos ? body.manualDiscount : null, maxQty: pos ? 500 : 20 });
    if (!q.lines.length) throw bad('Your cart is empty');
    const blocked = q.lines.find((l) => !l.available);
    if (blocked) throw new HttpError(409, `${blocked.name}${blocked.size ? ` (${blocked.size})` : ''}: ${blocked.issue}. Please remove it and try again.`);
    if (q.warnings.length) throw new HttpError(409, q.warnings[0]);
    if (body.coupon && q.couponError) throw bad(q.couponError);
    if (!pos && q.subtotal < num(settings.minOrder)) throw bad(`The minimum order is ₹${settings.minOrder}`);

    // reserve stock + count sales
    const touched = new Map();
    const log = [];
    const id = await db.nextId('order');
    const number = `TH-${1000 + id}`;
    for (const l of q.lines) {
      const p = touched.get(l.id) || (await db.get('products', l.id));
      touched.set(l.id, p);
      const s = p.sizes.find((x) => x.label === l.size);
      if (p.trackStock !== false) { s.stock = Math.max(0, num(s.stock) - l.qty); log.push({ productId: p.id, name: p.name, size: l.size, delta: -l.qty, after: s.stock, reason: pos ? 'Counter bill' : 'Website order', order: number }); }
      p.sold = num(p.sold) + l.qty;
    }
    const now = Date.now();
    const paid = pos && body.markPaid !== false;
    const order = {
      id, number, source: pos ? 'pos' : 'web', status: pos ? 'delivered' : 'pending',
      payment: { method, status: paid ? 'paid' : 'unpaid', paidAt: paid ? now : null },
      customer, note: str(body.note, 400),
      items: q.lines.map((l) => ({ productId: l.id, name: l.name, size: l.size, qty: l.qty, price: l.price, mrp: l.mrp, lineTotal: l.lineTotal, image: l.image, category: l.category })),
      subtotal: q.subtotal, offer: q.offer, coupon: q.coupon ? { code: q.coupon.code, amount: q.coupon.amount } : null, manualDiscount: q.manualDiscount,
      discount: q.discount, delivery: q.delivery, tax: q.tax, total: q.total, youSaved: q.youSaved,
      history: [{ status: pos ? 'delivered' : 'pending', at: now, note: pos ? 'Counter bill created' : 'Order placed on website' }], ip, createdAt: now, updatedAt: now,
    };
    const cmds = [...[...touched.values()].map((p) => ['HSET', 'products', String(p.id), JSON.stringify(p)]), ['HSET', 'orders', String(id), JSON.stringify(order)], ['INCR', 'ver']];
    if (q.coupon) {
      const c = await db.get('coupons', q.coupon.code);
      if (c) { c.used = num(c.used) + 1; cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]); }
    }
    await db.pipe(cmds);
    await logStock(log);
    return order;
  } finally { await release(); }
}

async function restoreStock(o, reason) {
  const touched = new Map();
  const log = [];
  for (const it of o.items) {
    const p = touched.get(it.productId) || (await db.get('products', it.productId));
    if (!p) continue;
    touched.set(it.productId, p);
    const s = p.sizes.find((x) => x.label === it.size);
    if (s && p.trackStock !== false) { s.stock = num(s.stock) + it.qty; log.push({ productId: p.id, name: p.name, size: it.size, delta: it.qty, after: s.stock, reason, order: o.number }); }
    p.sold = Math.max(0, num(p.sold) - it.qty);
  }
  const cmds = [...touched.values()].map((p) => ['HSET', 'products', String(p.id), JSON.stringify(p)]);
  if (o.coupon?.code) {
    const c = await db.get('coupons', o.coupon.code);
    if (c) { c.used = Math.max(0, num(c.used) - 1); cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]); }
  }
  if (cmds.length) await db.pipe(cmds);
  await logStock(log);
}

export async function setOrderStatus(o, status, note) {
  if (!ORDER_STATUSES.includes(status)) throw bad('Unknown order status');
  if (o.status === 'cancelled') throw new HttpError(409, 'A cancelled order cannot be changed');
  if (status === o.status) return o;
  if (status === 'cancelled') {
    if (o.status === 'delivered') throw new HttpError(409, 'A delivered order cannot be cancelled');
    const release = await db.lock('stock');
    try { await restoreStock(o, 'Order cancelled'); } finally { await release(); }
  }
  o.status = status; o.updatedAt = Date.now();
  o.history = [...(o.history || []), { status, at: Date.now(), note: str(note, 200) }];
  if (status === 'delivered' && o.payment?.status !== 'paid') o.payment = { ...o.payment, status: 'paid', paidAt: Date.now(), method: o.payment?.method === 'cod' ? 'cash' : o.payment?.method };
  if (status === 'cancelled' && o.payment?.status === 'paid') o.payment = { ...o.payment, status: 'refund-due' };
  await db.pipe([['HSET', 'orders', String(o.id), JSON.stringify(o)], ['INCR', 'ver']]);
  return o;
}
export async function setOrderPayment(o, b) {
  const status = ['paid', 'unpaid'].includes(b.status) ? b.status : o.payment?.status;
  const method = PAY_METHODS.includes(b.method) ? b.method : o.payment?.method;
  o.payment = { method, status, paidAt: status === 'paid' ? o.payment?.paidAt || Date.now() : null };
  o.updatedAt = Date.now();
  await db.cmd('HSET', 'orders', String(o.id), JSON.stringify(o));
  return o;
}
export const safeOrder = ({ ip, ...o }) => o;

/* ----------------------------- stats & customers ----------------------------- */
export async function stats(tzMin = 330) {
  const [orders, products, cats] = await Promise.all([db.all('orders'), db.all('products'), db.all('categories')]);
  const live = orders.filter((o) => o.status !== 'cancelled');
  const dayKey = (t) => new Date(t + tzMin * 60000).toISOString().slice(0, 10);
  const nowKey = dayKey(Date.now());
  const sum = (arr) => money(arr.reduce((n, o) => n + o.total, 0));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() + tzMin * 60000 - i * 86400000).toISOString().slice(0, 10);
    const day = live.filter((o) => dayKey(o.createdAt) === d);
    days.push({ date: d, label: new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }), revenue: sum(day), orders: day.length });
  }
  const since = (n) => live.filter((o) => o.createdAt >= Date.now() - n * 86400000);
  const monthKey = nowKey.slice(0, 7);
  const sold = new Map();
  for (const o of since(30)) for (const it of o.items) { const r = sold.get(it.productId) || { productId: it.productId, name: it.name, qty: 0, revenue: 0 }; r.qty += it.qty; r.revenue += it.lineTotal; sold.set(it.productId, r); }
  const cm = maps(cats);
  const lowStock = [];
  for (const p of products) {
    if (p.active === false || p.trackStock === false) continue;
    for (const s of p.sizes || []) if (s.enabled !== false && num(s.stock) <= num(p.lowStockAt, 10)) lowStock.push({ productId: p.id, name: p.name, size: s.label, stock: num(s.stock), image: p.image, category: cm.get(p.categoryId)?.name || '' });
  }
  lowStock.sort((a, b) => a.stock - b.stock);
  const todayOrders = live.filter((o) => dayKey(o.createdAt) === nowKey);
  return {
    totals: {
      products: products.length, categories: cats.length, orders: orders.length,
      todayRevenue: sum(todayOrders), todayOrders: todayOrders.length,
      weekRevenue: sum(since(7)), weekOrders: since(7).length,
      monthRevenue: sum(live.filter((o) => dayKey(o.createdAt).startsWith(monthKey))),
      pending: orders.filter((o) => o.status === 'pending').length,
      avgOrder: live.length ? money(sum(live) / live.length) : 0,
      outOfStock: products.filter((p) => p.active !== false && p.trackStock !== false && totalStock(p) <= 0).length,
      lowStock: lowStock.length,
    },
    days, top: [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 6), lowStock: lowStock.slice(0, 12),
    recent: orders.sort((a, b) => b.id - a.id).slice(0, 6).map(safeOrder),
  };
}
export async function customers() {
  const orders = (await db.all('orders')).filter((o) => o.status !== 'cancelled');
  const m = new Map();
  for (const o of orders) {
    const k = digits(o.customer?.phone).slice(-10);
    if (!k) continue;
    const c = m.get(k) || { phone: o.customer.phone, name: o.customer.name, email: o.customer.email || '', address: o.customer.address || '', orders: 0, spent: 0, last: 0 };
    c.orders += 1; c.spent = money(c.spent + o.total);
    if (o.createdAt >= c.last) { c.last = o.createdAt; c.name = o.customer.name; c.address = o.customer.address || c.address; c.email = o.customer.email || c.email; }
    m.set(k, c);
  }
  return [...m.values()].sort((a, b) => b.spent - a.spent);
}

export const newImageId = () => Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
