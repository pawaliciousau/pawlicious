import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getProductBySlug, priceFor, SIZE_OPTIONS } from "@/lib/products";
import { DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

type CheckoutLine = { slug: string; grams: number; qty: number };

export async function POST(req: Request) {
  let body: { lines?: CheckoutLine[]; method?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const requestedLines = Array.isArray(body.lines) ? body.lines : [];
  const pickup = body.method === "pickup";
  if (requestedLines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  // Prices are always re-derived from our own product data, never trusted
  // from the client, so a tampered cart in localStorage can't change what's charged.
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  for (const line of requestedLines) {
    const product = getProductBySlug(line.slug);
    if (product?.unavailable) {
      return NextResponse.json(
        { error: `${product.name} is currently unavailable. Please remove it from your cart.` },
        { status: 400 }
      );
    }
    const validSize = SIZE_OPTIONS.some((opt) => opt.grams === line.grams);
    if (!product || !validSize) continue;

    const unitPrice = priceFor(line.grams);
    const qty = Math.max(1, Math.min(20, Math.round(Number(line.qty)) || 1));
    subtotal += unitPrice * qty;

    line_items.push({
      quantity: qty,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(unitPrice * 100),
        product_data: {
          name: `${product.name} — ${line.grams}g tub`,
          description: product.tagline,
          images: origin.startsWith("https://") ? [`${origin}${product.heroImage}`] : undefined,
        },
      },
    });
  }

  if (line_items.length === 0) {
    return NextResponse.json({ error: "No valid items in cart." }, { status: 400 });
  }

  const shipping = pickup || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DELIVERY_FEE;
  if (shipping > 0) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(shipping * 100),
        product_data: { name: "Melbourne Metro delivery" },
      },
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Shows an "Add promotion code" field on Stripe's payment page. The codes
      // themselves (e.g. WOOFWOOF) are managed in the Stripe dashboard.
      allow_promotion_codes: true,
      ...(pickup ? {} : { shipping_address_collection: { allowed_countries: ["AU" as const] } }),
      phone_number_collection: { enabled: true },
      metadata: { fulfilment: pickup ? "pickup" : "delivery" },
      success_url: `${origin}/?order=success`,
      cancel_url: `${origin}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session creation failed:", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
