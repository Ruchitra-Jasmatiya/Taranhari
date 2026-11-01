# Taran Hari - frontend

Mobile-first React + Vite site for the Taran Hari namkeen brand. Frontend only: the cart is saved in the browser, and checkout and the contact form are placeholders until a backend is connected.

## Run it

```bash
npm install
npm run dev        # opens http://localhost:5173
npm run build      # production build into /dist
npm run preview    # test the production build
```

## Try the colour themes

Use the A / B / C buttons at the bottom of the footer (A = Haldi & Chilli, B = Saffron & Leaf, C = Tomato & Corn). The choice is remembered. All colours live in `src/styles/theme.css`. When you have picked one, set it as the default there and delete the `footer__themes` block in `src/components/Footer.jsx`.

## Things you MUST add (placeholders are shown until you do)

Missing images show a coloured box that prints the exact path to use, so you can also just open the site and follow the boxes.

### Videos (`public/videos/`)
| File | What | Notes |
|---|---|---|
| `intro.mp4` | Welcome video, plays 2-3 s | Under 3 MB, 720p. Compress: `ffmpeg -i original.mp4 -vf scale=-2:720 -an -t 3 -crf 30 -preset slow -movflags +faststart intro.mp4` |
| `factory.mp4` | Factory / brand video (Shop page) | Keep it light; it loops muted, tap for sound |

### Images
| Folder | Files | Used for |
|---|---|---|
| `public/images/hero/` | `intro-poster.jpg`, `hero-product.png`, `float-1.png` to `float-4.png`, `cat-namkeen.png`, `cat-khasta.png`, `cat-corn.png`, `cat-sev.png`, `about.jpg`, `shop-banner.jpg`, `factory-poster.jpg` | Intro poster, Home hero, drifting snacks, category tiles, about photo, Shop banner |
| `public/images/story/` | `01-dough.jpg` to `05-packing.jpg` | Scroll story on Home (edit the `STORY` array in `Home.jsx` to change or add) |
| `public/images/team/` | `founder.jpg`, `director.jpg`, `cofounder.jpg`, `kitchen.jpg`, `owner.jpg` | Team cards and Contact owner |
| `public/images/products/` | one `.jpg` per product, named like the `image` field in `src/data/products.js` (for example `aloo-bhujia.jpg`) | Product cards |
| `public/images/chaat/` | `pani-puri-chaat.jpg`, `khasta-kachori-chaat.jpg`, `sev-puri.jpg`, `bhel.jpg`, `dahi-papdi-chaat.jpg`, `masala-puri.jpg`, `sev-tamatar.jpg`, `corn-chaat.jpg` | Chaat gallery (Shop) |

## Text you MUST replace (search the project for `REPLACE`)

- `src/pages/Contact.jsx` - the `CONTACT` object at the top: phone, WhatsApp number, email, address, map embed link, Instagram/Facebook/YouTube, owner, business hours. The footer reads from the same object.
- `src/pages/Home.jsx` - `ABOUT_TEXT`, `TEAM`, `WHY` (check every claim is true), `REVIEWS`, `STORY`.
- `src/pages/Shop.jsx` - `QUOTES` (customer quotes).
- `src/data/products.js` - prices, descriptions, ratings are sample values.
- `src/context/CartContext.jsx` - free-delivery limit (`FREE_DELIVERY_AT`), delivery fee, coupon codes (`TARAN10`, `CRUNCH15`).

## Connecting a backend later

- Products: change the two functions in `src/lib/api.js` to `fetch()` calls.
- Checkout: the placeholder is at the bottom of `src/pages/Cart.jsx`.
- Contact form: see the `TODO` in `submit()` in `src/pages/Contact.jsx`.

## Folder map

```
src/
  main.jsx  App.jsx
  styles/   theme.css (all variables + 3 themes)  global.css
  components/  Intro Navbar Footer ProductCard QuickView FilterSheet Toast Reveal
               + small helpers: Logo Img Stars Stepper BottomSheet
  pages/    Home Shop Cart Contact   (each with its own .css)
  context/  CartContext.jsx
  data/     products.js
  lib/      api.js  effects.js  theme.js
public/     images/ and videos/
```
