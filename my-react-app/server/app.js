// =========================================================
// app.js - ONE request handler for every /api/* route.
// (On Vercel it runs as the single serverless function api/index.js.)
// =========================================================
import { db } from './store.js';
import * as auth from './auth.js';
import {
  HttpError, bad, str, num, bool, int, money, ORDER_STATUSES, ensureSeed, writeSeed, getSettings, publicSettings, cleanSettings,
  getContent, cleanContent, cleanCategory, catOrder, maps, cleanProduct, adminProduct, visibleProducts, visibleCategories,
  cleanCoupon, cleanOffer, priceCart, publicQuote, changeStock, placeOrder, setOrderStatus, setOrderPayment, safeOrder, stats, customers,
  digits, newImageId,
} from './shop.js';

/* ------------------------------ request plumbing ------------------------------ */
const routes = [];
const add = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:([a-z]+)/gi, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ method, rx, keys, handler, ...opts });
};
const pub = (m, p, h, o) => add(m, p, h, o);
const adm = (m, p, h, o) => add(m, p, h, { ...o, admin: true });

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && !(req.body instanceof Uint8Array)) {
    if (typeof req.body === 'string') { if (!req.body.trim()) return {}; try { return JSON.parse(req.body); } catch { throw bad('Invalid JSON'); } }
    return req.body;
  }
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > 4_000_000) throw new HttpError(413, 'Request too large'); chunks.push(c); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw bad('Invalid JSON'); }
}
function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.statusCode = status;
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers };
  for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
  res.end(status === 204 || status === 304 ? undefined : body);
}
const ipOf = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();

function cors(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const o = req.headers.origin;
  if (o && allowed.includes(o)) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  }
}

export default async function handler(req, res) {
  const t0 = Date.now();
  try {
    cors(req, res);
    if (req.method === 'OPTIONS') return send(res, 204, '');
    const u = new URL(req.url, 'http://x');
    const p = u.pathname.replace(/^\/api/, '') || '/';
    const route = routes.map((r) => { const m = r.method === req.method && p.match(r.rx); return m ? { r, m } : null; }).find(Boolean);
    if (!route) return send(res, 404, { error: 'Not found' });
    const { r, m } = route;
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));

    await ensureSeed();

    if (r.admin) {
      if (!(await auth.isAdmin(req))) return send(res, 401, { error: 'Please log in' });
      if (req.method !== 'GET' && req.headers['x-requested-with'] !== 'th-admin') return send(res, 403, { error: 'Forbidden' });
    }
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : {};
    const out = await r.handler({ req, res, params, query: Object.fromEntries(u.searchParams), body, ip: ipOf(req) });
    if (out === undefined) return; // handler wrote the response itself
    if (out.__raw) return send(res, out.__status || 200, out.body, out.__headers);
    const { __status, __headers, ...data } = out;
    send(res, __status || 200, data, { ...(__headers || {}), 'Server-Timing': `app;dur=${Date.now() - t0}` });
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...e.extra });
    console.error('API error:', e);
    send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}

const bump = () => ['INCR', 'ver'];
const noSecret = ({ passwordHash, passwordSalt, ...rest }) => rest;
const imgUrlsIn = (o) => [...new Set(JSON.stringify(o ?? '').match(/\/api\/images\/[a-f0-9]+/g) || [])];

/* ================================== PUBLIC ================================== */
pub('GET', '/health', async () => ({ ok: true, storage: db.mode, persistent: db.persistent, time: Date.now() }));
pub('GET', '/version', async () => ({ v: await db.version() }));

// Everything the website needs, in ONE call. The version is used as an ETag so polling is a cheap 304.
pub('GET', '/site', async ({ req }) => {
  const { products, categories, version } = await db.catalogRaw();
  const etag = `W/"s${version}"`;
  if (req.headers['if-none-match'] === etag) return { __raw: true, __status: 304, body: '', __headers: { ETag: etag } };
  const [settings, content] = await Promise.all([getSettings(), getContent()]);
  return {
    __headers: { ETag: etag }, version, settings: publicSettings(settings),
    contact: content.contact, home: content.home, shop: content.shop,
    categories: visibleCategories(categories, products),
    products: visibleProducts(products, categories),
  };
});
pub('GET', '/products', async ({ query }) => {
  const { products, categories } = await db.catalogRaw();
  let l = visibleProducts(products, categories);
  if (query.category) { const q = String(query.category).toLowerCase(); l = l.filter((p) => p.category.toLowerCase() === q || String(p.categoryId) === q); }
  if (query.q) { const q = String(query.q).toLowerCase(); l = l.filter((p) => `${p.name} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q)); }
  return { total: l.length, products: l };
});
pub('GET', '/products/:id', async ({ params }) => {
  const { products, categories } = await db.catalogRaw();
  const p = visibleProducts(products, categories).find((x) => String(x.id) === params.id);
  if (!p) throw new HttpError(404, 'Product not found');
  return { product: p };
});
pub('GET', '/images/:id', async ({ params, res }) => {
  const data = await db.cmd('HGET', 'images', params.id);
  const m = data && String(data).match(/^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/s);
  if (!m) throw new HttpError(404, 'Image not found');
  res.statusCode = 200;
  res.setHeader('Content-Type', m[1]);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(Buffer.from(m[2], 'base64'));
});

// Live price check for the cart (prices, offers, coupon and delivery are all decided here)
pub('POST', '/cart/quote', async ({ body, ip }) => {
  if ((await db.hit(`quote:${ip}`, 60)) > 120) throw new HttpError(429, 'Too many requests. Please slow down.');
  return { quote: publicQuote(await priceCart(body.items, { couponCode: body.coupon, maxQty: 20 })) };
});
pub('POST', '/orders', async ({ body, ip }) => {
  if ((await db.hit(`order:${ip}`, 3600)) > 15) throw new HttpError(429, 'Too many orders from this device. Please try later.');
  const o = await placeOrder(body, { ip });
  const { items, customer, ...rest } = safeOrder(o);
  return { __status: 201, order: { ...rest, items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price, lineTotal: i.lineTotal })), customer: { name: customer.name } } };
});
pub('GET', '/orders/track', async ({ query, ip }) => {
  if ((await db.hit(`track:${ip}`, 600)) > 30) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
  const number = str(query.number, 20).toUpperCase();
  const phone = digits(query.phone);
  const o = (await db.all('orders')).find((x) => x.number === number);
  if (!o || !phone || digits(o.customer.phone).slice(-8) !== phone.slice(-8)) throw new HttpError(404, 'Order not found. Check the order number and phone.');
  const { ip: _ip, customer, ...rest } = o;
  return { order: { ...rest, customer: { name: customer.name } } };
});

/* =================================== ADMIN =================================== */
pub('POST', '/admin/login', async ({ req, res, body, ip }) => {
  if ((await db.hit(`login:${ip}`, 900)) > 8) throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.');
  const settings = (await db.getJSON('settings')) || {};
  const r = await auth.verifyPassword(body.password, settings);
  if (r.notConfigured) throw new HttpError(503, 'Admin password is not configured. Add ADMIN_PASSWORD in your Vercel project environment variables and redeploy.');
  if (!r.ok) throw new HttpError(401, 'Wrong password');
  res.setHeader('Set-Cookie', auth.sessionCookie(req, await auth.signToken(settings)));
  return { ok: true, usingDefaultPassword: !!r.isDefault };
});
pub('POST', '/admin/logout', async ({ req, res }) => { res.setHeader('Set-Cookie', auth.sessionCookie(req, '')); return { ok: true }; });
pub('GET', '/admin/session', async ({ req }) => ({ authenticated: await auth.isAdmin(req), storage: { mode: db.mode, persistent: db.persistent } }));

adm('POST', '/admin/password', async ({ req, res, body }) => {
  const settings = (await db.getJSON('settings')) || {};
  const ok = await auth.verifyPassword(body.current, settings);
  if (!ok.ok) throw new HttpError(403, 'Current password is wrong');
  const next = String(body.next || '');
  if (next.length < 8) throw bad('New password must be at least 8 characters');
  const { salt, hash } = auth.hashPassword(next);
  const upd = { ...settings, passwordSalt: salt, passwordHash: hash };
  await db.setJSON('settings', upd);
  res.setHeader('Set-Cookie', auth.sessionCookie(req, await auth.signToken(upd)));
  return { ok: true };
});

adm('GET', '/admin/stats', async ({ query }) => stats(num(query.tz, 330)));

/* ---- categories ---- */
adm('GET', '/admin/categories', async () => {
  const { products, categories } = await db.catalogRaw();
  return { categories: [...categories].sort(catOrder).map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length })) };
});
adm('POST', '/admin/categories', async ({ body }) => {
  const all = await db.all('categories');
  const id = await db.nextId('category');
  const c = cleanCategory(body, all, { id, createdAt: Date.now(), sortOrder: all.length + 1 });
  await db.pipe([['HSET', 'categories', String(id), JSON.stringify(c)], bump()]);
  return { __status: 201, category: c };
});
adm('PUT', '/admin/categories/:id', async ({ params, body }) => {
  const all = await db.all('categories');
  const cur = all.find((c) => String(c.id) === params.id);
  if (!cur) throw new HttpError(404, 'Category not found');
  const c = cleanCategory(body, all, cur);
  await db.pipe([['HSET', 'categories', String(cur.id), JSON.stringify(c)], bump()]);
  return { category: c };
});
adm('DELETE', '/admin/categories/:id', async ({ params }) => {
  const cur = await db.get('categories', params.id);
  if (!cur) throw new HttpError(404, 'Category not found');
  const n = (await db.all('products')).filter((p) => p.categoryId === cur.id).length;
  if (n) throw new HttpError(409, `This category still has ${n} product${n > 1 ? 's' : ''}. Move or delete them first.`);
  await db.pipe([['HDEL', 'categories', String(cur.id)], bump()]);
  return { ok: true };
});

/* ---- products ---- */
adm('GET', '/admin/products', async () => {
  const { products, categories } = await db.catalogRaw();
  const cm = maps(categories);
  return { products: products.map((p) => adminProduct(p, cm)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || String(a.name).localeCompare(b.name)) };
});
adm('POST', '/admin/products', async ({ body }) => {
  const cats = await db.all('categories');
  const id = `p${await db.nextId('product')}`;
  const p = cleanProduct(body, cats, { id, createdAt: Date.now() });
  await db.pipe([['HSET', 'products', id, JSON.stringify(p)], bump()]);
  return { __status: 201, product: adminProduct(p, maps(cats)) };
});
adm('PUT', '/admin/products/:id', async ({ params, body }) => {
  const release = await db.lock('stock');
  try {
    const cur = await db.get('products', params.id);
    if (!cur) throw new HttpError(404, 'Product not found');
    const cats = await db.all('categories');
    const p = cleanProduct(body, cats, cur);
    await db.pipe([['HSET', 'products', String(cur.id), JSON.stringify(p)], bump()]);
    return { product: adminProduct(p, maps(cats)) };
  } finally { await release(); }
});
adm('PATCH', '/admin/products/:id', async ({ params, body }) => { // quick toggles
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  const next = { ...cur, updatedAt: Date.now() };
  for (const k of ['active', 'trending', 'veg']) if (body[k] !== undefined) next[k] = bool(body[k]);
  await db.pipe([['HSET', 'products', String(cur.id), JSON.stringify(next)], bump()]);
  return { product: next };
});
adm('POST', '/admin/products/:id/duplicate', async ({ params }) => {
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  const id = `p${await db.nextId('product')}`;
  const copy = { ...cur, id, name: `${cur.name} (copy)`.slice(0, 120), active: false, sold: 0, createdAt: Date.now(), updatedAt: Date.now() };
  await db.pipe([['HSET', 'products', id, JSON.stringify(copy)], bump()]);
  return { __status: 201, product: copy };
});
adm('DELETE', '/admin/products/:id', async ({ params }) => {
  const cur = await db.get('products', params.id);
  if (!cur) throw new HttpError(404, 'Product not found');
  await db.pipe([['HDEL', 'products', String(cur.id)], bump()]);
  return { ok: true };
});
// Run a sale on many products at once: new price = MRP minus percent. percent 0 ends the sale and restores the earlier prices.
adm('POST', '/admin/products/bulk-discount', async ({ body }) => {
  const percent = num(body.percent, -1);
  if (!(percent >= 0 && percent <= 90)) throw bad('Enter a discount between 0 and 90 percent');
  const scope = body.categoryId ? Number(body.categoryId) : 0;
  const release = await db.lock('stock');
  try {
    const products = (await db.all('products')).filter((p) => !scope || p.categoryId === scope);
    const cmds = [];
    for (const p of products) {
      for (const s of p.sizes) {
        if (percent === 0) { if (s.basePrice !== undefined) { s.price = s.basePrice; delete s.basePrice; } continue; } // end the sale: restore the original price
        if (s.basePrice === undefined) s.basePrice = s.price; // remember the price from before the sale
        const mrp = Math.max(num(s.mrp), num(s.basePrice));
        s.mrp = mrp; s.price = Math.max(1, Math.round(mrp * (1 - percent / 100)));
      }
      p.updatedAt = Date.now();
      cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]);
    }
    if (cmds.length) await db.pipe([...cmds, bump()]);
    return { ok: true, updated: products.length };
  } finally { await release(); }
});

/* ---- stock ---- */
adm('GET', '/admin/stock', async () => {
  const { products, categories } = await db.catalogRaw();
  const cm = maps(categories);
  const rows = [];
  for (const p of products) for (const s of p.sizes || []) {
    const stock = num(s.stock);
    rows.push({
      productId: p.id, name: p.name, image: p.image, category: cm.get(p.categoryId)?.name || '', size: s.label, enabled: s.enabled !== false,
      price: s.price, stock, lowStockAt: num(p.lowStockAt, 10), tracked: p.trackStock !== false, active: p.active !== false,
      status: p.trackStock === false ? 'untracked' : stock <= 0 ? 'out' : stock <= num(p.lowStockAt, 10) ? 'low' : 'ok', value: money(stock * num(s.price)),
    });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return { rows, summary: { units: rows.reduce((n, r) => n + (r.tracked ? r.stock : 0), 0), value: money(rows.reduce((n, r) => n + (r.tracked ? r.value : 0), 0)), out: rows.filter((r) => r.status === 'out' && r.enabled && r.active).length, low: rows.filter((r) => r.status === 'low' && r.enabled && r.active).length } };
});
adm('POST', '/admin/stock/adjust', async ({ body }) => {
  const hasSet = body.set !== undefined && body.set !== null && body.set !== '';
  if (!hasSet && !Number.isFinite(Number(body.delta))) throw bad('Enter a number');
  const r = await changeStock(str(body.productId, 40), str(body.size, 16), { delta: hasSet ? undefined : num(body.delta), set: hasSet ? num(body.set) : undefined, reason: str(body.reason, 80) || (hasSet ? 'Stock count updated' : 'Stock adjusted') });
  return { stock: r.after, before: r.before };
});
adm('GET', '/admin/stock/log', async ({ query }) => {
  const all = (await db.all('stocklog')).sort((a, b) => b.id - a.id);
  const list = query.productId ? all.filter((e) => String(e.productId) === query.productId) : all;
  return { log: list.slice(0, int(query.limit, 100, 1, 300)) };
});

/* ---- orders ---- */
adm('GET', '/admin/orders', async ({ query }) => {
  let l = (await db.all('orders')).sort((a, b) => b.id - a.id);
  if (query.status && ORDER_STATUSES.includes(query.status)) l = l.filter((o) => o.status === query.status);
  if (query.source) l = l.filter((o) => o.source === query.source);
  if (query.q) { const q = String(query.q).toLowerCase(); l = l.filter((o) => `${o.number} ${o.customer.name} ${o.customer.phone} ${o.customer.address}`.toLowerCase().includes(q)); }
  const total = l.length;
  const limit = int(query.limit, 50, 1, 300); const page = int(query.page, 1, 1);
  return { total, page, orders: l.slice((page - 1) * limit, page * limit).map(safeOrder) };
});
adm('GET', '/admin/orders/:id', async ({ params }) => {
  const o = await db.get('orders', params.id);
  if (!o) throw new HttpError(404, 'Order not found');
  return { order: safeOrder(o), settings: noSecret(await getSettings()) };
});
adm('PATCH', '/admin/orders/:id', async ({ params, body }) => {
  const o = await db.get('orders', params.id);
  if (!o) throw new HttpError(404, 'Order not found');
  let next = o;
  if (body.status) next = await setOrderStatus(next, str(body.status, 30), body.note);
  if (body.payment) next = await setOrderPayment(next, body.payment);
  return { order: safeOrder(next) };
});
adm('DELETE', '/admin/orders/:id', async ({ params }) => {
  const o = await db.get('orders', params.id);
  if (!o) throw new HttpError(404, 'Order not found');
  if (o.status !== 'cancelled' && o.status !== 'delivered') await setOrderStatus(o, 'cancelled', 'Deleted by admin'); // puts the stock back
  await db.pipe([['HDEL', 'orders', String(o.id)], bump()]);
  return { ok: true };
});

/* ---- billing (counter / phone orders) ---- */
adm('POST', '/admin/billing/quote', async ({ body }) => ({ quote: publicQuote(await priceCart(body.items, { couponCode: body.coupon, pos: true, manual: body.manualDiscount, maxQty: 500 })) }));
adm('POST', '/admin/billing', async ({ body }) => {
  const o = await placeOrder(body, { pos: true });
  return { __status: 201, order: safeOrder(o), settings: noSecret(await getSettings()) };
});

/* ---- customers ---- */
adm('GET', '/admin/customers', async () => ({ customers: await customers() }));

/* ---- coupons ---- */
adm('GET', '/admin/coupons', async () => ({ coupons: (await db.all('coupons')).sort((a, b) => a.code.localeCompare(b.code)) }));
adm('POST', '/admin/coupons', async ({ body }) => {
  const c = cleanCoupon(body);
  if (await db.get('coupons', c.code)) throw new HttpError(409, 'A coupon with this code already exists');
  await db.pipe([['HSET', 'coupons', c.code, JSON.stringify(c)], bump()]);
  return { __status: 201, coupon: c };
});
adm('PUT', '/admin/coupons/:code', async ({ params, body }) => {
  const cur = await db.get('coupons', params.code.toUpperCase());
  if (!cur) throw new HttpError(404, 'Coupon not found');
  const c = cleanCoupon({ ...body, code: cur.code }, cur);
  await db.pipe([['HSET', 'coupons', c.code, JSON.stringify(c)], bump()]);
  return { coupon: c };
});
adm('DELETE', '/admin/coupons/:code', async ({ params }) => { await db.pipe([['HDEL', 'coupons', params.code.toUpperCase()], bump()]); return { ok: true }; });

/* ---- automatic offers (discount rules) ---- */
adm('GET', '/admin/offers', async () => ({ offers: (await db.all('offers')).sort((a, b) => a.id - b.id) }));
adm('POST', '/admin/offers', async ({ body }) => {
  const id = await db.nextId('offer');
  const o = cleanOffer(body, { id });
  await db.pipe([['HSET', 'offers', String(id), JSON.stringify(o)], bump()]);
  return { __status: 201, offer: o };
});
adm('PUT', '/admin/offers/:id', async ({ params, body }) => {
  const cur = await db.get('offers', params.id);
  if (!cur) throw new HttpError(404, 'Offer not found');
  const o = cleanOffer(body, cur);
  await db.pipe([['HSET', 'offers', String(cur.id), JSON.stringify(o)], bump()]);
  return { offer: o };
});
adm('DELETE', '/admin/offers/:id', async ({ params }) => { await db.pipe([['HDEL', 'offers', params.id], bump()]); return { ok: true }; });

/* ---- website pages (home / shop / contact) ---- */
adm('GET', '/admin/content', async () => ({ content: await getContent() }));
adm('PUT', '/admin/content/:section', async ({ params, body }) => {
  const all = (await db.getJSON('content')) || {};
  const merged = await getContent();
  if (!merged[params.section]) throw new HttpError(404, 'Unknown page');
  const next = cleanContent(params.section, body, merged[params.section]);
  await db.pipe([['SET', 'content', JSON.stringify({ ...all, [params.section]: next })], bump()]);
  return { content: next };
});

/* ---- settings ---- */
adm('GET', '/admin/settings', async () => ({ settings: noSecret(await getSettings()), storage: { mode: db.mode, persistent: db.persistent } }));
adm('PUT', '/admin/settings', async ({ body }) => {
  const cur = (await db.getJSON('settings')) || {};
  const next = cleanSettings(body, await getSettings());
  await db.pipe([['SET', 'settings', JSON.stringify({ ...cur, ...next })], bump()]);
  return { settings: noSecret(next) };
});

/* ---- image upload (browser compresses first; stored in the database, served at /api/images/:id) ---- */
adm('POST', '/admin/upload', async ({ body }) => {
  const m = String(body.dataUrl || '').match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw bad('Please upload a PNG, JPG, WEBP or GIF image');
  const bytes = Buffer.byteLength(m[2], 'base64');
  if (bytes > 900_000) throw new HttpError(413, 'Image is too large (max ~900 KB after compression)');
  const id = newImageId();
  await db.cmd('HSET', 'images', id, body.dataUrl);
  return { __status: 201, url: `/api/images/${id}`, bytes };
});
// Deletes uploaded pictures that no product, category or page uses any more
adm('POST', '/admin/images/cleanup', async () => {
  const [p, c, content, imgs] = await Promise.all([db.all('products'), db.all('categories'), db.getJSON('content'), db.cmd('HGETALL', 'images')]);
  const used = new Set([...imgUrlsIn(p), ...imgUrlsIn(c), ...imgUrlsIn(content)].map((u) => u.split('/').pop()));
  const ids = []; for (let i = 0; i < (imgs || []).length; i += 2) ids.push(imgs[i]);
  const gone = ids.filter((id) => !used.has(id));
  if (gone.length) await db.pipe(gone.map((id) => ['HDEL', 'images', id]));
  return { ok: true, removed: gone.length };
});

/* ---- backup / restore ---- */
adm('GET', '/admin/export', async ({ res }) => {
  const [products, categories, coupons, offers, orders, settings, content] = await Promise.all([db.all('products'), db.all('categories'), db.all('coupons'), db.all('offers'), db.all('orders'), db.getJSON('settings'), db.getJSON('content')]);
  const { passwordHash, passwordSalt, ...s } = settings || {};
  const imgs = {};
  for (const u of imgUrlsIn({ products, categories, content })) imgs[u.split('/').pop()] = await db.cmd('HGET', 'images', u.split('/').pop());
  const body = JSON.stringify({ app: 'taranhari', exportedAt: new Date().toISOString(), products, categories, coupons, offers, orders, settings: s, content, images: imgs });
  return { __raw: true, body, __headers: { 'Content-Disposition': `attachment; filename="taranhari-backup-${new Date().toISOString().slice(0, 10)}.json"` } };
});
adm('POST', '/admin/import', async ({ body }) => {
  if (!Array.isArray(body.products) || !Array.isArray(body.categories)) throw bad('This does not look like a Taran Hari backup file');
  const cur = (await db.getJSON('settings')) || {};
  await db.wipeAll();
  const cmds = [];
  for (const c of body.categories) cmds.push(['HSET', 'categories', String(c.id), JSON.stringify(c)]);
  for (const p of body.products) cmds.push(['HSET', 'products', String(p.id), JSON.stringify(p)]);
  for (const c of body.coupons || []) cmds.push(['HSET', 'coupons', c.code, JSON.stringify(c)]);
  for (const o of body.offers || []) cmds.push(['HSET', 'offers', String(o.id), JSON.stringify(o)]);
  for (const o of body.orders || []) cmds.push(['HSET', 'orders', String(o.id), JSON.stringify(o)]);
  for (const [id, d] of Object.entries(body.images || {})) if (/^[a-f0-9]+$/.test(id) && d) cmds.push(['HSET', 'images', id, d]);
  const merged = { ...cur, ...cleanSettings(body.settings || {}, { ...(await getSettings()) }), passwordHash: cur.passwordHash, passwordSalt: cur.passwordSalt };
  if (!merged.passwordHash) { delete merged.passwordHash; delete merged.passwordSalt; }
  cmds.push(['SET', 'settings', JSON.stringify(merged)]);
  cmds.push(['SET', 'content', JSON.stringify(body.content || {})]);
  cmds.push(['SET', 'meta:seeded', '1']);
  cmds.push(['SET', 'seq:category', String(Math.max(0, ...body.categories.map((c) => num(c.id))))]);
  cmds.push(['SET', 'seq:offer', String(Math.max(0, ...(body.offers || []).map((o) => num(o.id))))]);
  cmds.push(['SET', 'seq:order', String(Math.max(0, ...(body.orders || []).map((o) => num(o.id))))]);
  cmds.push(['SET', 'seq:product', String(Math.max(0, ...body.products.map((p) => num(String(p.id).replace(/\D/g, '')))))]);
  cmds.push(bump());
  await db.pipe(cmds);
  return { ok: true };
});
adm('POST', '/admin/reset', async ({ body }) => {
  if (body.confirm !== 'RESET') throw bad('Type RESET to confirm');
  const cur = (await db.getJSON('settings')) || {};
  await db.wipeAll();
  await db.cmd('SET', 'meta:seeded', '1');
  await writeSeed();
  if (cur.passwordHash) { const s = await getSettings(); await db.setJSON('settings', { ...s, passwordHash: cur.passwordHash, passwordSalt: cur.passwordSalt }); }
  return { ok: true };
});
