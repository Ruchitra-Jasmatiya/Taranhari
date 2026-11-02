

import { products as sample } from '../data/products.js';

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* not JSON */
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Everything the website needs in one call (products, categories, contact, home, shop, settings). */
export async function fetchSite() {
  const data = await request('GET', '/site');
  if (!data || !Array.isArray(data.products)) throw new Error('Bad site data');
  return data;
}

export async function fetchVersion() {
  const d = await request('GET', '/version');
  return d.v;
}

export async function getProducts(category) {
  try {
    const d = await fetchSite();
    return category && category !== 'All' ? d.products.filter((p) => p.category === category) : d.products;
  } catch {
    return category && category !== 'All' ? sample.filter((p) => p.category === category) : [...sample];
  }
}

export async function getProduct(id) {
  try {
    return (await request('GET', `/products/${encodeURIComponent(id)}`)).product;
  } catch {
    return sample.find((p) => p.id === id) || null;
  }
}

/** Server-side price check (offers, coupon, delivery). items: [{id,size,qty}] */
export async function quoteCart(items, coupon) {
  return (await request('POST', '/cart/quote', { items, coupon: coupon || '' })).quote;
}

/** Place a real order. customer: {name, phone, address, city, pincode, email} */
export async function placeOrder({ items, coupon, customer, note, website = '', elapsed = 0 }) {
  return (await request('POST', '/orders', { items, coupon: coupon || '', customer, note, website, elapsed })).order;
}

export async function trackOrder(number, phone) {
  const q = new URLSearchParams({ number, phone });
  return (await request('GET', `/orders/track?${q}`)).order;
}