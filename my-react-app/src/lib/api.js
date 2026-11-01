// =========================================================
// api.js - the ONLY place the app gets product data from.
//
// Right now it reads src/data/products.js. When your backend
// is ready, swap the bodies for fetch() calls, e.g.:
//
//   export async function getProducts() {
//     const res = await fetch('/api/products');
//     return res.json();
//   }
//
// Nothing else in the app needs to change.
// =========================================================

import { products } from '../data/products.js';

// Small fake delay so loading states can be tested. Set to 0 to remove.
const FAKE_DELAY_MS = 120;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// All products (optionally filtered by category name)
export async function getProducts(category) {
  await wait(FAKE_DELAY_MS);
  if (category && category !== 'All') {
    return products.filter((p) => p.category === category);
  }
  return [...products];
}

// One product by id (or null if not found)
export async function getProduct(id) {
  await wait(FAKE_DELAY_MS);
  return products.find((p) => p.id === id) || null;
}
