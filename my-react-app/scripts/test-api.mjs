// End-to-end API test.  Usage:  npm run dev:all   (then in another terminal)   npm run test:api
//   API=http://localhost:3001 ADMIN_PASSWORD=... node scripts/test-api.mjs
const BASE = process.env.API || 'http://localhost:3001';
const PASS = process.env.ADMIN_PASSWORD || 'admin123';
let cookie = ''; let fails = 0; let n = 0;
async function call(method, path, body, { admin = false } = {}) {
  const h = { 'Content-Type': 'application/json' };
  if (admin) { h['X-Requested-With'] = 'th-admin'; h.Cookie = cookie; }
  const r = await fetch(BASE + '/api' + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
  const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch { /* not json */ }
  return { s: r.status, j, h: r.headers };
}
const ok = (name, cond, extra = '') => { n++; if (!cond) { fails++; console.log('  ✗', name, extra); } else console.log('  ✓', name); };
const A = { admin: true };
const cust = { name: 'Ruchi Test', phone: '+91 98765 43210', address: '12 MG Road, Nagpur, Maharashtra', pincode: '440001' };

console.log('Public site');
let r = await call('GET', '/health'); ok('health', r.s === 200 && r.j.ok);
r = await call('GET', '/site'); const site = r.j;
ok('site payload', r.s === 200 && site.products.length === 24 && site.categories.length === 4);
ok('product has sizes with stock flags', site.products[0].sizes.length === 3 && site.products[0].sizes[0].inStock === true && site.products[0].sizes[0].stock === undefined);
ok('categories carry image/note/tone', site.categories[0].image && site.categories[0].note && site.categories[0].tone);
ok('contact + home + shop content', site.contact.phoneDisplay && 'banners' in site.home && 'quotes' in site.shop);
ok('public settings hide invoice/private', site.settings.shopName === 'Taran Hari' && !('invoice' in site.settings) && !('passwordHash' in site.settings));
const etag = r.h.get('etag'); const r304 = await fetch(BASE + '/api/site', { headers: { 'If-None-Match': etag } }); ok('304 when unchanged', r304.status === 304);
r = await call('GET', '/products?category=Sev'); ok('filter by category', r.j.total === 6);
r = await call('GET', '/products?q=bhujia'); ok('search', r.j.total >= 2);
const aloo = site.products.find((p) => p.name === 'Aloo Bhujia');

console.log('Cart quote, coupons, offers');
const item = (id, size, qty) => ({ id, size, qty });
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 2)] }); let q = r.j.quote;
ok('quote subtotal + delivery fee', q.subtotal === 170 && q.delivery === 49 && q.total === 219, JSON.stringify(q));
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 6)] }); q = r.j.quote; ok('free delivery above limit', q.subtotal === 510 && q.delivery === 0);
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 6)], coupon: 'taran10' }); q = r.j.quote; ok('percent coupon (case-insensitive)', q.coupon?.amount === 51 && q.total === 508, JSON.stringify(q.coupon));
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 1)], coupon: 'CRUNCH15' }); q = r.j.quote; ok('min-order coupon explained', !q.coupon && /minimum order/.test(q.couponError), q.couponError);
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 1)], coupon: 'NOPE' }); ok('bad coupon', /not valid/.test(r.j.quote.couponError));
r = await call('POST', '/cart/quote', { items: [item('n1', '1 kg', 1), item('zzz', '1 kg', 1), item('n1', '999 g', 1)] }); q = r.j.quote;
ok('unknown product / size flagged, others kept', q.lines.length === 3 && q.lines.filter((l) => !l.available).length === 2 && q.subtotal === q.lines[0].lineTotal, JSON.stringify(q.lines.map((l) => l.issue)));
r = await call('POST', '/cart/quote', { items: [{ id: 'n1', size: '200 g', qty: 1, price: 1 }] }); ok('client-sent price ignored', r.j.quote.subtotal === 85);

console.log('Admin login');
r = await call('GET', '/admin/stats', null, A); ok('admin blocked without login', r.s === 401);
r = await call('POST', '/admin/login', { password: 'wrong' }); ok('wrong password rejected', r.s === 401);
r = await call('POST', '/admin/login', { password: PASS }); ok('login ok + cookie', r.s === 200 && cookie.startsWith('th_admin='));
let rr = await fetch(BASE + '/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: '{}' }); ok('CSRF header required for writes', rr.status === 403);
rr = await fetch(BASE + '/api/admin/session', { headers: { Cookie: cookie } }); ok('session authenticated', (await rr.json()).authenticated === true);

console.log('Categories');
r = await call('POST', '/admin/categories', { name: 'Test Sweets', note: 'Mithai corner', image: 'https://example.com/x.jpg', tone: 'accent' }, A); ok('create category', r.s === 201); const catId = r.j.category?.id;
r = await call('POST', '/admin/categories', { name: 'test sweets' }, A); ok('duplicate category blocked', r.s === 409);
r = await call('POST', '/admin/categories', { name: 'Bad', image: 'javascript:alert(1)' }, A); ok('javascript: image rejected', r.s === 400);
r = await call('PUT', '/admin/categories/' + catId, { name: 'Test Sweets', note: 'Updated note' }, A); ok('update category', r.j.category.note === 'Updated note');
r = await call('GET', '/site'); ok('empty category hidden from site? (shown with 0 products)', r.j.categories.some((c) => c.name === 'Test Sweets' && c.productCount === 0));

console.log('Products + sizes');
const v0 = (await call('GET', '/version')).j.v;
r = await call('POST', '/admin/products', { name: 'Test Chivda', categoryId: catId, description: 'Test', image: '/images/products/x.jpg', veg: true, tags: 'test, chivda', sizes: [{ label: '200 g', price: 50, mrp: 60, stock: 5 }, { label: '1 kg', price: 220, mrp: 260, stock: 2 }] }, A);
ok('create product', r.s === 201 && r.j.product.totalStock === 7 && r.j.product.id.startsWith('p'), JSON.stringify(r.j)); const pid = r.j.product?.id;
ok('version bumped', (await call('GET', '/version')).j.v > v0);
r = await call('GET', '/site'); let sp = r.j.products.find((p) => p.id === pid);
ok('new product live on site, default size', sp && sp.weight === '200 g' && sp.price === 50 && sp.discountPercent === 17 && sp.sizes.length === 2);
r = await call('POST', '/admin/products', { name: 'x', categoryId: catId, sizes: [{ label: '1 kg', price: 1 }] }, A); ok('validation: short name', r.s === 400);
r = await call('POST', '/admin/products', { name: 'Valid Name', categoryId: catId, sizes: [{ label: '1 kg', price: -5 }] }, A); ok('validation: negative price', r.s === 400);
r = await call('POST', '/admin/products', { name: 'Valid Name', categoryId: catId, sizes: [{ label: '1 kg', price: 5 }, { label: '1 KG', price: 6 }] }, A); ok('validation: duplicate size', r.s === 400);
r = await call('POST', '/admin/products', { name: 'Valid Name', categoryId: 9999, sizes: [{ label: '1 kg', price: 5 }] }, A); ok('validation: bad category', r.s === 400);
r = await call('PATCH', '/admin/products/' + pid, { active: false }, A);
r = await call('GET', '/site'); ok('hidden product disappears', !r.j.products.some((p) => p.id === pid));
r = await call('PATCH', '/admin/products/' + pid, { active: true }, A);
r = await call('DELETE', '/admin/categories/' + catId, null, A); ok('cannot delete category with products', r.s === 409);

console.log('Stock');
r = await call('GET', '/admin/stock', null, A); ok('stock list per size', r.j.rows.length >= 24 * 3 && r.j.summary.units > 0);
r = await call('POST', '/admin/stock/adjust', { productId: pid, size: '1 kg', delta: 3, reason: 'Restock' }, A); ok('add stock', r.s === 200 && r.j.stock === 5);
r = await call('POST', '/admin/stock/adjust', { productId: pid, size: '1 kg', set: 2 }, A); ok('set exact stock', r.j.stock === 2);
r = await call('POST', '/admin/stock/adjust', { productId: pid, size: '1 kg', delta: -50 }, A); ok('stock never below zero', r.j.stock === 0);
r = await call('POST', '/admin/stock/adjust', { productId: pid, size: '1 kg', set: 2 }, A);
r = await call('GET', '/admin/stock/log?productId=' + pid, null, A); ok('stock log recorded', r.j.log.length >= 3 && r.j.log[0].reason);

console.log('Orders, stock deduction, coupon usage');
r = await call('POST', '/orders', { items: [item(pid, '1 kg', 3)], customer: cust }); ok('cannot order more than stock', r.s === 409, JSON.stringify(r.j));
r = await call('POST', '/orders', { items: [item(pid, '1 kg', 1)], customer: { name: 'A', phone: '1', address: 'x' } }); ok('customer validation', r.s === 400);
const c0 = (await call('GET', '/admin/coupons', null, A)).j.coupons.find((c) => c.code === 'TARAN10').used;
r = await call('POST', '/orders', { items: [item(pid, '1 kg', 2), item('n1', '200 g', 1)], coupon: 'TARAN10', customer: cust, note: 'Less spicy please' });
ok('place order', r.s === 201 && /^TH-\d+$/.test(r.j.order.number) && r.j.order.subtotal === 525 && r.j.order.coupon.amount === 52.5 && r.j.order.total === 521.5, JSON.stringify(r.j.order)); const order = r.j.order;
ok('order response hides phone/address', !r.j.order.customer.phone);
r = await call('GET', '/admin/stock', null, A); ok('stock deducted', r.j.rows.find((x) => x.productId === pid && x.size === '1 kg').stock === 0);
r = await call('POST', '/orders', { items: [item(pid, '1 kg', 1)], customer: cust }); ok('sold-out size blocked', r.s === 409 && /out of stock/i.test(r.j.error), r.j.error);
r = await call('GET', '/site'); sp = r.j.products.find((p) => p.id === pid); ok('site marks size out of stock', sp.sizes.find((s) => s.label === '1 kg').inStock === false && sp.inStock === true);
r = await call('GET', '/admin/coupons', null, A); ok('coupon usage counted', r.j.coupons.find((c) => c.code === 'TARAN10').used === c0 + 1);
r = await call('GET', `/orders/track?number=${order.number}&phone=9876543210`); ok('customer tracking', r.s === 200 && r.j.order.status === 'pending' && !r.j.order.customer.phone);
r = await call('GET', `/orders/track?number=${order.number}&phone=1111111111`); ok('tracking needs matching phone', r.s === 404);
r = await call('GET', '/admin/orders?q=' + order.number, null, A); ok('admin sees order', r.j.orders[0].number === order.number && r.j.orders[0].customer.phone);
r = await call('PATCH', '/admin/orders/' + order.id, { status: 'confirmed' }, A); ok('status -> confirmed', r.j.order.status === 'confirmed');
r = await call('PATCH', '/admin/orders/' + order.id, { status: 'cancelled', note: 'test' }, A); ok('cancel order', r.j.order.status === 'cancelled');
r = await call('GET', '/admin/stock', null, A); ok('cancel restores stock', r.j.rows.find((x) => x.productId === pid && x.size === '1 kg').stock === 2);
r = await call('GET', '/admin/coupons', null, A); ok('cancel restores coupon use', r.j.coupons.find((c) => c.code === 'TARAN10').used === c0);
r = await call('PATCH', '/admin/orders/' + order.id, { status: 'pending' }, A); ok('cancelled cannot be re-opened', r.s === 409);

console.log('Two buyers, one pack left (no overselling)');
await call('POST', '/admin/stock/adjust', { productId: pid, size: '200 g', set: 1 }, A);
const both = await Promise.all([1, 2].map(() => call('POST', '/orders', { items: [item(pid, '200 g', 1)], customer: cust })));
ok('exactly one order succeeds', both.filter((x) => x.s === 201).length === 1 && both.filter((x) => x.s === 409).length === 1, both.map((x) => x.s).join(','));
await call('POST', '/admin/stock/adjust', { productId: pid, size: '200 g', set: 5 }, A);

console.log('Offers + discounts');
r = await call('POST', '/admin/offers', { name: 'Big basket', type: 'percent', value: 10, minOrder: 300, maxDiscount: 40 }, A); ok('create offer', r.s === 201); const offId = r.j.offer.id;
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 6)] }); q = r.j.quote; ok('offer auto-applied & capped', q.offer?.amount === 40 && q.discount === 40 && q.total === 519, JSON.stringify(q.offer));
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 6)], coupon: 'TARAN10' }); q = r.j.quote; ok('offer + coupon stack', q.offer.amount === 40 && q.coupon.amount === 47 && q.discount === 87, JSON.stringify([q.offer, q.coupon]));
r = await call('PUT', '/admin/settings', { allowStacking: false }, A);
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 6)], coupon: 'TARAN10' }); q = r.j.quote; ok('no-stacking: bigger saving wins', q.coupon?.amount === 51 && !q.offer && q.discount === 51, JSON.stringify([q.offer, q.coupon]));
r = await call('PUT', '/admin/settings', { allowStacking: true }, A);
r = await call('PUT', '/admin/offers/' + offId, { name: 'Big basket', type: 'percent', value: 10, minOrder: 300, active: false }, A);
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 6)] }); ok('inactive offer ignored', !r.j.quote.offer);
r = await call('DELETE', '/admin/offers/' + offId, null, A); ok('delete offer', r.s === 200);
r = await call('POST', '/admin/coupons', { code: 'flat50', type: 'flat', value: 50, minOrder: 100, usageLimit: 1 }, A); ok('create flat coupon', r.s === 201 && r.j.coupon.code === 'FLAT50');
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 2)], coupon: 'FLAT50' }); ok('flat coupon works instantly', r.j.quote.coupon?.amount === 50);
r = await call('POST', '/admin/coupons', { code: 'OLD', type: 'flat', value: 10, endsAt: '2020-01-01' }, A);
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 2)], coupon: 'OLD' }); ok('expired coupon rejected', /expired/.test(r.j.quote.couponError));
r = await call('POST', '/orders', { items: [item('n1', '200 g', 2)], coupon: 'FLAT50', customer: cust }); const fo = r.j.order;
r = await call('POST', '/cart/quote', { items: [item('n1', '200 g', 2)], coupon: 'FLAT50' }); ok('usage limit enforced', /fully used/.test(r.j.quote.couponError));
r = await call('POST', '/admin/products/bulk-discount', { categoryId: 1, percent: 20 }, A); ok('bulk discount by category', r.j.updated === 6);
r = await call('GET', '/site'); const aloo2 = r.j.products.find((p) => p.name === 'Aloo Bhujia'); ok('bulk discount reflected (price = MRP - 20%)', aloo2.price === 80 && aloo2.discountPercent === 20, JSON.stringify([aloo2.price, aloo2.mrp]));
r = await call('POST', '/admin/products/bulk-discount', { categoryId: 1, percent: 0 }, A); r = await call('GET', '/site'); ok('ending the sale restores the earlier price', r.j.products.find((p) => p.name === 'Aloo Bhujia').price === 85);
for (const c of ['FLAT50', 'OLD']) await call('DELETE', '/admin/coupons/' + c, null, A);

console.log('Billing (counter sale)');
r = await call('POST', '/admin/billing/quote', { items: [item('n1', '200 g', 3)], manualDiscount: { type: 'percent', value: 10 } }, A); q = r.j.quote;
ok('billing quote: no delivery fee, manual discount', q.delivery === 0 && q.manualDiscount === 25.5 && q.total === 229.5, JSON.stringify(q));
r = await call('POST', '/admin/billing', { items: [item('n1', '200 g', 3)], manualDiscount: { type: 'flat', value: 20 }, customer: { name: 'Walk-in Ramesh' }, payMethod: 'upi' }, A);
ok('create counter bill', r.s === 201 && r.j.order.source === 'pos' && r.j.order.status === 'delivered' && r.j.order.payment.status === 'paid' && r.j.order.total === 235 && r.j.settings.invoice, JSON.stringify(r.j.order)); const bill = r.j.order;
ok('settings in bill response hide password hash', !('passwordHash' in r.j.settings));
r = await call('GET', '/admin/orders/' + bill.id, null, A); ok('fetch order for printing', r.j.order.number === bill.number && r.j.settings.shopName);
r = await call('POST', '/admin/billing', { items: [], customer: {} }, A); ok('empty bill rejected', r.s === 400);
r = await call('PUT', '/admin/settings', { gstPercent: 5, invoice: { businessName: 'Taran Hari Foods', address: 'Nagpur', phone: '9876543210', gstin: '27ABCDE1234F1Z5' } }, A); ok('invoice settings saved', r.j.settings.gstPercent === 5 && r.j.settings.invoice.gstin);
r = await call('POST', '/admin/billing', { items: [item('n1', '200 g', 1)], customer: {}, payMethod: 'cash' }, A); ok('GST (inclusive) calculated', r.j.order.tax.percent === 5 && r.j.order.tax.amount === 4.05, JSON.stringify(r.j.order.tax));
r = await call('PUT', '/admin/settings', { gstPercent: 0 }, A);

console.log('Customers, stats');
r = await call('GET', '/admin/customers', null, A); ok('customers built from orders', r.j.customers.length >= 1 && r.j.customers[0].orders >= 1);
r = await call('GET', '/admin/stats?tz=330', null, A); ok('stats', r.s === 200 && r.j.totals.products >= 25 && r.j.days.length === 7 && r.j.top.length >= 1 && Array.isArray(r.j.lowStock), JSON.stringify(r.j.totals));

console.log('Website content (home / shop / contact)');
r = await call('PUT', '/admin/content/home', { banners: [{ src: 'https://example.com/b1.jpg', alt: 'One' }, { src: '/api/images/abc123' }], team: [{ name: 'Test Person', role: 'Founder', photo: 'https://example.com/p.jpg', text: 'Hi' }] }, A);
ok('save home banners + team', r.s === 200 && r.j.content.banners.length === 2 && r.j.content.team[0].id);
r = await call('PUT', '/admin/content/home', { banners: [{ src: 'javascript:alert(1)' }] }, A); ok('unsafe banner link rejected', r.s === 400);
r = await call('GET', '/site'); ok('home content live on site', r.j.home.banners.length === 2 && r.j.home.reviews === null);
r = await call('PUT', '/admin/content/home', { banners: null, team: null }, A); r = await call('GET', '/site'); ok('null restores built-in default', r.j.home.banners === null);
r = await call('PUT', '/admin/content/shop', { quotes: [{ text: 'Mast!', who: 'Asha, Pune' }], chaat: [{ src: 'https://example.com/c.jpg', caption: 'Bhel' }], factoryVideo: '/videos/factory.mp4' }, A); ok('save shop content', r.s === 200 && r.j.content.quotes.length === 1);
r = await call('PUT', '/admin/content/contact', { phoneDisplay: '+91 99999 11111', phoneTel: '+91 99999-11111', email: 'hello@taranhari.com', addressShort: 'Nagpur, MH', instagram: 'https://instagram.com/taranhari' }, A);
ok('update contact details', r.s === 200 && r.j.content.phoneTel === '+919999911111' && r.j.content.addressShort === 'Nagpur, MH');
r = await call('PUT', '/admin/content/contact', { email: 'not-an-email' }, A); ok('contact email validated', r.s === 400);
r = await call('GET', '/site'); ok('contact change live on site', r.j.contact.phoneDisplay === '+91 99999 11111');
r = await call('PUT', '/admin/content/nonsense', {}, A); ok('unknown page 404', r.s === 404);

console.log('Settings, images, backup');
r = await call('PUT', '/admin/settings', { announcement: 'Diwali sale', deliveryFee: 30, freeDeliveryAbove: 399 }, A); ok('update settings', r.j.settings.deliveryFee === 30 && !('passwordHash' in r.j.settings));
r = await call('GET', '/site'); ok('announcement live', r.j.settings.announcement === 'Diwali sale' && r.j.settings.freeDeliveryAbove === 399);
r = await call('PUT', '/admin/settings', { acceptingOrders: false }, A); r = await call('POST', '/orders', { items: [item('n1', '200 g', 1)], customer: cust }); ok('orders blocked when closed', r.s === 503);
r = await call('PUT', '/admin/settings', { acceptingOrders: true, announcement: '', deliveryFee: 49, freeDeliveryAbove: 499 }, A);
const px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
r = await call('POST', '/admin/upload', { dataUrl: px }, A); ok('upload image', r.s === 201 && r.j.url.startsWith('/api/images/'));
const imgUrl = r.j.url; rr = await fetch(BASE + imgUrl); ok('uploaded image is served publicly', rr.status === 200 && rr.headers.get('content-type') === 'image/png');
r = await call('POST', '/admin/upload', { dataUrl: 'data:text/html;base64,PGI+' }, A); ok('non-image upload rejected', r.s === 400);
r = await call('POST', '/admin/images/cleanup', {}, A); ok('unused images cleaned up', r.s === 200 && r.j.removed >= 1); rr = await fetch(BASE + imgUrl); ok('removed image is gone', rr.status === 404);
rr = await fetch(BASE + '/api/admin/export', { headers: { Cookie: cookie } }); const backup = await rr.json(); ok('export backup', backup.products.length >= 25 && backup.orders.length >= 1 && !('passwordHash' in backup.settings));
r = await call('POST', '/admin/password', { current: PASS, next: 'short' }, A); ok('weak new password rejected', r.s === 400);

console.log('Cleanup');
for (const o of (await call('GET', '/admin/orders?limit=100', null, A)).j.orders) await call('DELETE', '/admin/orders/' + o.id, null, A);
r = await call('GET', '/admin/stock', null, A); ok('deleting orders restored all stock', r.j.rows.find((x) => x.productId === pid && x.size === '200 g').stock === 6);
r = await call('DELETE', '/admin/products/' + pid, null, A); ok('delete product', r.s === 200);
r = await call('DELETE', '/admin/categories/' + catId, null, A); ok('delete category', r.s === 200);
r = await call('PUT', '/admin/content/contact', { phoneDisplay: '+91 98765 43210', phoneTel: '+919876543210', email: 'contact@taranhari.com', addressShort: 'Add your factory address in /admin', instagram: 'https://www.instagram.com/' }, A);
r = await call('POST', '/admin/logout', {}); rr = await fetch(BASE + '/api/admin/stats', { headers: { Cookie: 'th_admin=' } }); ok('logged out -> 401', rr.status === 401);

console.log(`\n${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
