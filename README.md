# Professional E-commerce Starter

This is a responsive, professional e-commerce starter website built with plain HTML, CSS, and JavaScript.

## Files
- `index.html`: Page layout and sections.
- `styles.css`: Design system, responsive styling, animations.
- `products.js`: Your product catalog (edit this first).
- `app.js`: Product rendering, filters, cart, and checkout behavior.

## Add your own products
Open `products.js` and replace the sample objects in the `products` array.

Each product supports:
- `id`: unique string (example: `"p1"`)
- `name`: product title
- `price`: number in USD (example: `89`)
- `category`: grouping label used in filters
- `description`: short sales copy
- `image`: image URL

## Run locally
Because this uses ES modules (`type="module"`), serve it with a local HTTP server:

```bash
cd "/Volumes/grahith SSD/shopify"
python3 -m http.server 8080
```

Then open:
- `http://localhost:8080`

## Make it more professional for launch
- Replace placeholder images with your own product photos.
- Update brand name, story, and testimonials in `index.html`.
- Connect checkout to Stripe/Shopify or your backend API.
- Add your domain, analytics, and legal pages (Privacy Policy, Terms, Returns).
# shopify
