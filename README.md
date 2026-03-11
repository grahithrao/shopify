# Trenzoo E-commerce Store (Google Pay Enabled)

This store now uses a real Stripe Checkout payment flow. Google Pay is available automatically in Stripe Checkout on supported devices/browsers.

## Project structure
- `/Volumes/grahith SSD/shopify/index.html`: storefront UI
- `/Volumes/grahith SSD/shopify/styles.css`: styling and responsive design
- `/Volumes/grahith SSD/shopify/products.js`: product catalog used by frontend + backend pricing
- `/Volumes/grahith SSD/shopify/app.js`: cart logic + checkout session request
- `/Volumes/grahith SSD/shopify/server.js`: secure Stripe backend
- `/Volumes/grahith SSD/shopify/success.html`: post-payment success page
- `/Volumes/grahith SSD/shopify/cancel.html`: payment-canceled page

## 1) Install dependencies
```bash
cd "/Volumes/grahith SSD/shopify"
npm install
```
## 2) Configure Stripe keys
```bash
cp .env.example .env
```

Edit `.env`:
- `STRIPE_SECRET_KEY`: your Stripe secret key (test or live)
- `APP_URL`: public base URL for success/cancel redirects
- `PORT`: local server port (default `4242`)
- `CURRENCY`: currency for checkout (default `inr`)
- `FREE_SHIPPING_THRESHOLD`: free shipping threshold in major units
- `SHIPPING_FLAT_RATE`: shipping cost in major units

## 3) Run the app
```bash
npm run dev
```

Open:
- [http://localhost:4242](http://localhost:4242)

## 4) Enable Google Pay in Stripe
In your Stripe Dashboard:
1. Go to **Settings -> Payment methods**.
2. Ensure **Cards** and **Google Pay** are enabled.
3. For production, use your live keys and a real HTTPS domain.

Google Pay visibility depends on browser/device support (for example Chrome with a signed-in Google account and supported card).

## 5) Add your own products
Edit `/Volumes/grahith SSD/shopify/products.js` and replace sample products.

Each product needs:
- `id`: unique string
- `name`: product title
- `price`: number in major currency unit
- `category`: filter group
- `description`: short copy
- `image`: HTTPS image URL

## Important security note
Never expose your Stripe secret key in frontend files. Keep it only in `.env` and use backend endpoints (already implemented in `server.js`).
