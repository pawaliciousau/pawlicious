import type Stripe from "stripe";
import { DELIVERY_INFO } from "./utils";

const SITE_URL = "https://www.pawalicious.com.au";

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const money = (cents: number | null | undefined, currency = "aud") =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: currency.toUpperCase() }).format(
    (cents ?? 0) / 100
  );

export type OrderEmail = { to: string; subject: string; html: string; text: string; replyTo?: string };

export function orderReference(session: Stripe.Checkout.Session): string {
  return session.id.slice(-8).toUpperCase();
}

export const isPickup = (session: Stripe.Checkout.Session) => session.metadata?.fulfilment === "pickup";

function addressLines(session: Stripe.Checkout.Session): string[] {
  const ship = session.collected_information?.shipping_details;
  if (!ship?.address) return [];
  const a = ship.address;
  return [
    ship.name,
    a.line1,
    a.line2,
    [a.city, a.state, a.postal_code].filter(Boolean).join(" "),
    a.country === "AU" ? "Australia" : a.country,
  ].filter((l): l is string => Boolean(l));
}

export function buildOrderEmail(session: Stripe.Checkout.Session): OrderEmail | null {
  const to = session.customer_details?.email;
  if (!to) return null;

  const ref = orderReference(session);
  const currency = session.currency ?? "aud";
  const firstName = (session.customer_details?.name ?? "").trim().split(/\s+/)[0] || "there";
  const items = session.line_items?.data ?? [];
  const address = addressLines(session);
  const phone = session.customer_details?.phone;
  const pickup = isPickup(session);

  const subject = `Your Paw-a-licious order is confirmed (#${ref})`;

  const text = [
    `Hi ${firstName},`,
    "",
    "Thank you for your order! It's confirmed and we're getting it ready.",
    "",
    `ORDER #${ref}`,
    ...items.map((i) => `- ${i.description} x ${i.quantity}: ${money(i.amount_total, currency)}`),
    `Total paid: ${money(session.amount_total, currency)}`,
    "",
    ...(pickup
      ? ["PICKUP DETAILS", DELIVERY_INFO.pickup, DELIVERY_INFO.pickupNote]
      : ["DELIVERY DETAILS", ...(address.length ? address : ["(no address provided)"])]),
    ...(phone ? [`Phone: ${phone}`] : []),
    "",
    "DELIVERY & PICKUP",
    DELIVERY_INFO.metro,
    DELIVERY_INFO.free,
    DELIVERY_INFO.pickup,
    ...(pickup ? [] : ["Picking up instead? Just reply to this email and we'll send you the exact pick up location."]),
    "",
    "STORING & SERVING",
    "Keep frozen for up to 5 months from the date on the package. Thaw in the fridge for at least 24 hours, and use within 5 days once thawed.",
    `Full guide: ${SITE_URL}/how-to-serve`,
    "",
    "Questions? Just reply to this email.",
    "",
    "With love,",
    "The Paw-a-licious team",
  ].join("\n");

  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee6dc;color:#232323;">${esc(i.description)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #eee6dc;color:#5b534c;text-align:center;">${esc(i.quantity)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee6dc;color:#232323;text-align:right;">${esc(money(i.amount_total, currency))}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#232323;">
<div style="max-width:560px;margin:0 auto;padding:24px 20px;">
  <div style="text-align:center;padding-bottom:16px;">
    <img src="${SITE_URL}/assets/logo/paw-a-licious-logo.png" alt="Paw-a-licious" width="220" style="max-width:220px;height:auto;">
  </div>
  <div style="background:#e4f3f4;border-radius:18px;padding:22px;text-align:center;">
    <h1 style="margin:0 0 6px;font-size:22px;color:#123b42;">Thank you, ${esc(firstName)}!</h1>
    <p style="margin:0;color:#5b534c;">Your order is confirmed and we're getting it ready.</p>
    <p style="margin:10px 0 0;font-size:13px;color:#04889c;font-weight:bold;letter-spacing:1px;">ORDER #${esc(ref)}</p>
  </div>

  <h2 style="font-size:16px;color:#04889c;margin:28px 0 6px;">Your order</h2>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;">
    ${rows}
    <tr>
      <td style="padding:12px 0;font-weight:bold;">Total paid</td><td></td>
      <td style="padding:12px 0;font-weight:bold;text-align:right;">${esc(money(session.amount_total, currency))}</td>
    </tr>
  </table>

  <h2 style="font-size:16px;color:#04889c;margin:24px 0 6px;">${pickup ? "Pickup details" : "Delivery details"}</h2>
  <p style="margin:0;font-size:14px;line-height:1.6;color:#232323;">
    ${pickup ? `${esc(DELIVERY_INFO.pickup)}<br>${esc(DELIVERY_INFO.pickupNote)}` : address.length ? address.map(esc).join("<br>") : "No address provided"}
    ${phone ? `<br>Phone: ${esc(phone)}` : ""}
  </p>

  <h2 style="font-size:16px;color:#04889c;margin:24px 0 6px;">Delivery &amp; pickup</h2>
  <p style="margin:0;font-size:14px;line-height:1.7;color:#5b534c;">
    ${esc(DELIVERY_INFO.metro)}<br>${esc(DELIVERY_INFO.free)}<br>${esc(DELIVERY_INFO.pickup)}
  </p>
  ${pickup ? "" : `<p style="margin:8px 0 0;font-size:14px;color:#5b534c;">Picking up instead? Just reply to this email and we'll send you the exact pick up location.</p>`}

  <h2 style="font-size:16px;color:#04889c;margin:24px 0 6px;">Storing &amp; serving</h2>
  <p style="margin:0;font-size:14px;line-height:1.6;color:#5b534c;">
    Keep frozen for up to 5 months from the date on the package. Thaw in the fridge for at least 24 hours, and use within 5 days once thawed.
    <a href="${SITE_URL}/how-to-serve" style="color:#e8560f;font-weight:bold;">See the full How to Serve guide</a>
  </p>

  <p style="margin:28px 0 4px;font-size:14px;color:#5b534c;">Questions? Just reply to this email.</p>
  <p style="margin:0;font-size:14px;color:#e8560f;font-weight:bold;">With love, the Paw-a-licious team</p>
</div>
</body></html>`;

  return { to, subject, html, text };
}

export const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "info@pawalicious.com.au";

export function buildOwnerEmail(session: Stripe.Checkout.Session): OrderEmail {
  const ref = orderReference(session);
  const currency = session.currency ?? "aud";
  const name = session.customer_details?.name ?? session.collected_information?.shipping_details?.name ?? "Customer";
  const customerEmail = session.customer_details?.email ?? "";
  const phone = session.customer_details?.phone ?? "";
  const items = session.line_items?.data ?? [];
  const address = addressLines(session);
  const pickup = isPickup(session);
  const total = money(session.amount_total, currency);
  const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const stripeUrl = pi
    ? `https://dashboard.stripe.com/${session.livemode ? "" : "test/"}payments/${pi}`
    : "";

  const subject = `New ${pickup ? "PICKUP" : "DELIVERY"} order #${ref} — ${total} — ${name}`;

  const text = [
    `NEW ORDER #${ref} — ${pickup ? "PICKUP" : "DELIVERY"}`,
    `Total paid: ${total}`,
    "",
    "CUSTOMER",
    name,
    customerEmail ? `Email: ${customerEmail}` : "Email: (none)",
    phone ? `Phone: ${phone}` : "Phone: (none)",
    "",
    pickup ? "PICKUP (no delivery address)" : "DELIVERY ADDRESS",
    ...(pickup
      ? [DELIVERY_INFO.pickup, "Customer has been told to email for the exact pick up location."]
      : address.length
        ? address
        : ["(no address provided)"]),
    "",
    "ITEMS",
    ...items.map((i) => `- ${i.description} x ${i.quantity}: ${money(i.amount_total, currency)}`),
    ...(stripeUrl ? ["", `View in Stripe: ${stripeUrl}`] : []),
    "",
    "Reply to this email to contact the customer directly.",
  ].join("\n");

  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;">${esc(i.description)}</td><td style="padding:6px 8px;text-align:center;">${esc(i.quantity)}</td><td style="padding:6px 0;text-align:right;">${esc(money(i.amount_total, currency))}</td></tr>`
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#232323;">
<div style="max-width:560px;margin:0 auto;padding:24px 20px;">
  <div style="background:#fde3da;border-radius:14px;padding:18px 20px;">
    <h1 style="margin:0;font-size:20px;color:#a02f18;">New order #${esc(ref)} — ${pickup ? "PICKUP" : "DELIVERY"}</h1>
    <p style="margin:6px 0 0;font-size:18px;font-weight:bold;">${esc(total)} paid</p>
  </div>

  <h2 style="font-size:15px;color:#04889c;margin:22px 0 6px;">Customer</h2>
  <p style="margin:0;font-size:14px;line-height:1.7;">
    ${esc(name)}<br>
    ${customerEmail ? `<a href="mailto:${esc(customerEmail)}" style="color:#e8560f;">${esc(customerEmail)}</a>` : "No email"}<br>
    ${phone ? `<a href="tel:${esc(phone)}" style="color:#e8560f;">${esc(phone)}</a>` : "No phone"}
  </p>

  <h2 style="font-size:15px;color:#04889c;margin:22px 0 6px;">${pickup ? "Pickup (no delivery address)" : "Delivery address"}</h2>
  <p style="margin:0;font-size:14px;line-height:1.7;">${pickup ? `${esc(DELIVERY_INFO.pickup)}<br>Customer has been told to email for the exact pick up location.` : address.length ? address.map(esc).join("<br>") : "No address provided"}</p>

  <h2 style="font-size:15px;color:#04889c;margin:22px 0 6px;">Items</h2>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;">
    ${rows}
    <tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #eee6dc;">Total paid</td><td style="border-top:1px solid #eee6dc;"></td><td style="padding:10px 0;font-weight:bold;text-align:right;border-top:1px solid #eee6dc;">${esc(total)}</td></tr>
  </table>

  ${stripeUrl ? `<p style="margin:20px 0 0;font-size:14px;"><a href="${esc(stripeUrl)}" style="color:#e8560f;font-weight:bold;">View this payment in Stripe</a></p>` : ""}
  <p style="margin:16px 0 0;font-size:13px;color:#5b534c;">Reply to this email to contact the customer directly.</p>
</div>
</body></html>`;

  return { to: OWNER_EMAIL, subject, html, text, replyTo: customerEmail || undefined };
}
