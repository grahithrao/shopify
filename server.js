import express from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "./products.js";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const app = express();
const stripe = new Stripe(stripeSecretKey);

const port = Number(process.env.PORT || 4242);
const appUrl = process.env.APP_URL || `http://localhost:${port}`;
const currency = (process.env.CURRENCY || "inr").toLowerCase();
const shippingFlatRate = Number(process.env.SHIPPING_FLAT_RATE || 8);
const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD || 150);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalog = new Map(products.map((product) => [product.id, product]));

function toMinorUnit(value) {
  return Math.round(value * 100);
}

function sanitizeMetadataValue(value, maxLength = 450) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, maxLength);
}

function buildLineItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Cart is empty.");
  }

  const mergedItems = new Map();

  rawItems.forEach((item) => {
    const id = String(item?.id || "");
    const quantity = Number(item?.quantity);

    if (!catalog.has(id)) {
      throw new Error("One or more products are invalid.");
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Invalid quantity in cart.");
    }

    mergedItems.set(id, (mergedItems.get(id) || 0) + quantity);
  });

  let subtotal = 0;

  const lineItems = [...mergedItems.entries()].map(([id, quantity]) => {
    const product = catalog.get(id);
    subtotal += product.price * quantity;

    return {
      price_data: {
        currency,
        product_data: {
          name: product.name,
          description: product.description,
          images: [product.image],
        },
        unit_amount: toMinorUnit(product.price),
      },
      quantity,
    };
  });

  if (subtotal < freeShippingThreshold) {
    lineItems.push({
      price_data: {
        currency,
        product_data: {
          name: "Shipping",
          description: "Standard shipping",
        },
        unit_amount: toMinorUnit(shippingFlatRate),
      },
      quantity: 1,
    });
  }

  return lineItems;
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items, customer } = req.body;
    const line_items = buildLineItems(items);

    const customerEmail = customer?.email ? String(customer.email).trim() : "";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${appUrl}/success.html`,
      cancel_url: `${appUrl}/cancel.html`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "IN", "GB", "CA", "AU"],
      },
      phone_number_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      customer_email: customerEmail || undefined,
      metadata: {
        customer_name: sanitizeMetadataValue(customer?.name),
        shipping_address: sanitizeMetadataValue(customer?.address),
        order_notes: sanitizeMetadataValue(customer?.notes),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error.message);

    res.status(400).json({
      error: error.message || "Unable to create checkout session.",
    });
  }
});

app.get("/api/store-config", (_req, res) => {
  res.json({
    currency: currency.toUpperCase(),
    locale: currency === "inr" ? "en-IN" : "en-US",
    shippingFlatRate,
    freeShippingThreshold,
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Payment server running on http://localhost:${port}`);
});
