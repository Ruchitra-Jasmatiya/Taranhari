// =========================================================
// products.js - the whole product catalogue (24 items).
//
// HOW TO EDIT: change any value below. To add a product, copy
// one line and give it a new unique id.
//
// REPLACE: put your product photos in public/images/products/
// using the file names in the `image` field (e.g. aloo-bhujia.jpg).
// Until you add them, a coloured placeholder is shown automatically.
//
// spice  : 'Mild' | 'Medium' | 'Hot'
// weight : the default pack - use '200 g', '400 g' or '1 kg'
//          (these three are the "pack size" filter options)
// =========================================================

export const CATEGORIES = ['Namkeen', 'Khasta Puri', 'Corn Puff', 'Sev'];
export const SPICE_LEVELS = ['Mild', 'Medium', 'Hot'];
export const PACK_SIZES = ['200 g', '400 g', '1 kg'];

// Image folder (inside /public)
const img = (file) => `/images/products/${file}.jpg`;

export const products = [
  // ---------------- NAMKEEN ----------------
  { id: 'n1', name: 'Aloo Bhujia', category: 'Namkeen', price: 85, mrp: 100, weight: '200 g', image: img('aloo-bhujia'), rating: 4.7, reviews: 512, spice: 'Medium', veg: true, tags: ['potato', 'crispy', 'tea time'], trending: true, description: 'Thin, golden potato strands tossed in our house masala. Crisp enough to crackle, light enough to finish the packet.' },
  { id: 'n2', name: 'Moong Dal', category: 'Namkeen', price: 90, mrp: 105, weight: '200 g', image: img('moong-dal'), rating: 4.5, reviews: 340, spice: 'Mild', veg: true, tags: ['lentil', 'light', 'salted'], trending: false, description: 'Fried split moong dal with a pinch of rock salt and black pepper. Simple, protein-packed and dangerously snackable.' },
  { id: 'n3', name: 'Ratlami Sev Mix', category: 'Namkeen', price: 150, mrp: 175, weight: '400 g', image: img('ratlami-sev-mix'), rating: 4.8, reviews: 628, spice: 'Hot', veg: true, tags: ['mix', 'ratlami', 'spicy', 'party'], trending: true, description: 'A fiery party mix of clove-pepper ratlami sev, peanuts and crunchy boondi. Keep a glass of chaas nearby.' },
  { id: 'n4', name: 'Khatta Meetha', category: 'Namkeen', price: 140, mrp: 160, weight: '400 g', image: img('khatta-meetha'), rating: 4.4, reviews: 289, spice: 'Mild', veg: true, tags: ['sweet', 'tangy', 'mix'], trending: false, description: 'Sweet, sour and a little bit salty. A bit of everything in every handful, loved by kids and grandparents alike.' },
  { id: 'n5', name: 'Bikaneri Bhujia', category: 'Namkeen', price: 175, mrp: 200, weight: '400 g', image: img('bikaneri-bhujia'), rating: 4.9, reviews: 801, spice: 'Hot', veg: true, tags: ['moth dal', 'bikaner', 'classic'], trending: true, description: 'The classic moth dal bhujia from Bikaner, made with a traditional recipe and a bold kick of red chilli.' },
  { id: 'n6', name: 'Peanut Masala', category: 'Namkeen', price: 80, mrp: 95, weight: '200 g', image: img('peanut-masala'), rating: 4.6, reviews: 455, spice: 'Medium', veg: true, tags: ['peanut', 'besan coated', 'masala'], trending: false, description: 'Crunchy peanuts wrapped in a spiced besan jacket. Ideal with chai, cricket or a long train ride.' },

  // ---------------- KHASTA PURI ----------------
  { id: 'k1', name: 'Classic Khasta Puri', category: 'Khasta Puri', price: 120, mrp: 140, weight: '400 g', image: img('classic-khasta-puri'), rating: 4.8, reviews: 590, spice: 'Mild', veg: true, tags: ['flaky', 'classic', 'ajwain'], trending: true, description: 'Layered, flaky and golden. Rolled by hand with ajwain and fried slow so every bite goes khasta.' },
  { id: 'k2', name: 'Masala Khasta', category: 'Khasta Puri', price: 130, mrp: 150, weight: '400 g', image: img('masala-khasta'), rating: 4.6, reviews: 372, spice: 'Medium', veg: true, tags: ['masala', 'flaky', 'spiced'], trending: false, description: 'Our classic khasta puri with a punchy chaat masala and chilli dusting. Dangerously moreish.' },
  { id: 'k3', name: 'Methi Puri', category: 'Khasta Puri', price: 95, mrp: 110, weight: '200 g', image: img('methi-puri'), rating: 4.5, reviews: 418, spice: 'Mild', veg: true, tags: ['methi', 'fenugreek', 'travel'], trending: false, description: 'Kasuri methi and wheat flour, rolled thin and fried crisp. A Gujarati-style travel snack that stays fresh for days.' },
  { id: 'k4', name: 'Mathri', category: 'Khasta Puri', price: 110, mrp: 125, weight: '400 g', image: img('mathri'), rating: 4.7, reviews: 530, spice: 'Mild', veg: true, tags: ['festival', 'diwali', 'crunchy'], trending: true, description: 'Festival-style mathri with a short, crumbly bite. Made with pure ghee flavour and black pepper.' },
  { id: 'k5', name: 'Papdi', category: 'Khasta Puri', price: 75, mrp: 90, weight: '200 g', image: img('papdi'), rating: 4.4, reviews: 266, spice: 'Mild', veg: true, tags: ['chaat', 'flat', 'crisp'], trending: false, description: 'Flat, crisp papdi, the base of every great chaat. Also brilliant on its own with green chutney.' },
  { id: 'k6', name: 'Pani Puri Kit', category: 'Khasta Puri', price: 199, mrp: 240, weight: '400 g', image: img('pani-puri-kit'), rating: 4.9, reviews: 714, spice: 'Medium', veg: true, tags: ['pani puri', 'kit', 'golgappa', 'party'], trending: true, description: 'Hollow crisp puris with tangy pani masala and a spiced filling mix. Golgappa night at home, sorted.' },

  // ---------------- CORN PUFF ----------------
  { id: 'c1', name: 'Masala Corn Puff', category: 'Corn Puff', price: 60, mrp: 70, weight: '200 g', image: img('masala-corn-puff'), rating: 4.5, reviews: 480, spice: 'Medium', veg: true, tags: ['masala', 'puffed', 'kids'], trending: true, description: 'Light, airy corn puffs in our everyday desi masala. Crunchy outside, melts inside.' },
  { id: 'c2', name: 'Cheese Corn Puff', category: 'Corn Puff', price: 70, mrp: 80, weight: '200 g', image: img('cheese-corn-puff'), rating: 4.6, reviews: 523, spice: 'Mild', veg: true, tags: ['cheese', 'kids', 'puffed'], trending: false, description: 'Golden puffs coated in a creamy cheese seasoning. A lunchbox hero.' },
  { id: 'c3', name: 'Tangy Tomato Puff', category: 'Corn Puff', price: 65, mrp: 75, weight: '200 g', image: img('tangy-tomato-puff'), rating: 4.3, reviews: 233, spice: 'Mild', veg: true, tags: ['tomato', 'tangy', 'puffed'], trending: false, description: 'Sun-ripe tomato tang with a hint of sweetness. Bright, zesty and gone in a minute.' },
  { id: 'c4', name: 'Peri-Peri Puff', category: 'Corn Puff', price: 75, mrp: 90, weight: '200 g', image: img('peri-peri-puff'), rating: 4.6, reviews: 391, spice: 'Hot', veg: true, tags: ['peri peri', 'hot', 'puffed'], trending: true, description: 'Smoky peri-peri heat on feather-light puffs. For people who like their snacks to talk back.' },
  { id: 'c5', name: 'Chatpata Rings', category: 'Corn Puff', price: 60, mrp: 70, weight: '200 g', image: img('chatpata-rings'), rating: 4.4, reviews: 310, spice: 'Medium', veg: true, tags: ['rings', 'chatpata', 'kids'], trending: false, description: 'Crispy corn rings dusted in a chatpata blend of amchur, black salt and chilli. Wear them on your fingers first.' },
  { id: 'c6', name: 'Mint Chutney Puff', category: 'Corn Puff', price: 65, mrp: 75, weight: '200 g', image: img('mint-chutney-puff'), rating: 4.5, reviews: 276, spice: 'Mild', veg: true, tags: ['mint', 'pudina', 'cool'], trending: false, description: 'Cool pudina and green chutney flavour on crunchy puffs. Fresh like a monsoon evening.' },

  // ---------------- SEV ----------------
  { id: 's1', name: 'Plain Sev', category: 'Sev', price: 70, mrp: 80, weight: '200 g', image: img('plain-sev'), rating: 4.5, reviews: 365, spice: 'Mild', veg: true, tags: ['besan', 'topping', 'bhel'], trending: false, description: 'Fine besan sev, lightly salted. Sprinkle on poha, bhel, sabzi or eat it by the fistful.' },
  { id: 's2', name: 'Ratlami Sev', category: 'Sev', price: 85, mrp: 100, weight: '200 g', image: img('ratlami-sev'), rating: 4.8, reviews: 605, spice: 'Hot', veg: true, tags: ['ratlami', 'clove', 'pepper', 'spicy'], trending: true, description: 'Thick, peppery sev from Ratlam with clove, black pepper and a proper kick. The original fire.' },
  { id: 's3', name: 'Garlic Sev', category: 'Sev', price: 80, mrp: 95, weight: '200 g', image: img('garlic-sev'), rating: 4.6, reviews: 342, spice: 'Medium', veg: true, tags: ['garlic', 'lasan', 'bold'], trending: false, description: 'Crisp sev with a strong roasted garlic flavour. Not for first dates, perfect for everything else.' },
  { id: 's4', name: 'Palak Sev', category: 'Sev', price: 90, mrp: 105, weight: '200 g', image: img('palak-sev'), rating: 4.3, reviews: 198, spice: 'Mild', veg: true, tags: ['spinach', 'green', 'natural'], trending: false, description: 'Sev made with fresh spinach puree for a natural green colour and a gentle earthy taste.' },
  { id: 's5', name: 'Lasan Sev', category: 'Sev', price: 95, mrp: 110, weight: '400 g', image: img('lasan-sev'), rating: 4.5, reviews: 287, spice: 'Hot', veg: true, tags: ['lasan', 'garlic', 'red chilli'], trending: false, description: 'Thick red lasan sev with a deep garlic and red chilli punch. Family pack for serious fans.' },
  { id: 's6', name: 'Nylon Sev', category: 'Sev', price: 130, mrp: 150, weight: '400 g', image: img('nylon-sev'), rating: 4.6, reviews: 421, spice: 'Mild', veg: true, tags: ['thin', 'fine', 'poha', 'topping'], trending: true, description: 'Ultra-fine, almost silky sev that melts on the tongue. The finishing touch for poha, chaat and salads.' },
];

// ---------------- helpers ----------------

// Turn "200 g" / "1 kg" into grams.
export function toGrams(label) {
  const n = parseFloat(label);
  return /kg/i.test(label) ? n * 1000 : n;
}

// Percentage off, for the discount sticker.
export function percentOff(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

// Sizes shown in Quick View. Prices scale with weight; bigger packs get 8% off.
export function getSizes(product) {
  // Products from the backend already carry their own sizes, prices and stock
  if (Array.isArray(product.sizes) && product.sizes.length) {
    return product.sizes.map((s) => ({ ...s, mrp: s.mrp || s.price, inStock: s.inStock !== false }));
  }
  const baseG = toGrams(product.weight);
  return PACK_SIZES.map((label) => {
    const g = toGrams(label);
    const ratio = g / baseG;
    const bulk = g > baseG ? 0.92 : 1;
    return {
      label,
      price: label === product.weight ? product.price : Math.round(product.price * ratio * bulk),
      mrp: label === product.weight ? product.mrp : Math.round(product.mrp * ratio),
      inStock: true,
    };
  });
}
