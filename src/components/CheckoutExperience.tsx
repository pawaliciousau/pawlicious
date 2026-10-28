"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice, CONTACT } from "@/lib/utils";
import QtyStepper from "@/components/QtyStepper";
import DeliveryInfo from "@/components/DeliveryInfo";
import PageIntro from "@/components/PageIntro";

export default function CheckoutExperience() {
  const { lines, incrementQty, decrementQty, subtotal, deliveryFee, amountToFreeShipping } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const pickup = method === "pickup";
  const shipping = pickup || lines.length === 0 || amountToFreeShipping <= 0 ? 0 : deliveryFee;
  const total = subtotal + shipping;

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((l) => ({ slug: l.slug, grams: l.grams, qty: l.qty })),
          method,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <PageIntro eyebrow="Checkout" title="Your order summary">
        Secure payment via Stripe. Questions about your order? Message us on{" "}
        <a
          href={CONTACT.instagramHref}
          target="_blank"
          rel="noreferrer"
          className="link-underline font-bold"
        >
          Instagram
        </a>{" "}
        or call{" "}
        <a href={CONTACT.phoneHref} className="link-underline font-bold">
          {CONTACT.phone}
        </a>
        .
      </PageIntro>

      <section className="bg-white pb-24 pt-4 lg:pb-32">
        <div className="container-shell grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {lines.length === 0 ? (
              <div className="rounded-card bg-cream-soft p-10 text-center">
                <p className="font-display text-2xl text-ink">Your cart is empty.</p>
                <Link href="/shop" className="btn btn-coral mt-6 inline-flex">
                  Shop Paw-a-licious
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-6">
                {lines.map((line) => (
                  <li
                    key={`${line.slug}-${line.grams}`}
                    className="flex gap-4 rounded-card bg-cream-soft p-4"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-tight">
                      <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-display text-lg font-medium text-ink">{line.name}</p>
                        <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                          {line.sizeLabel}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <QtyStepper
                          size="sm"
                          qty={line.qty}
                          onIncrement={() => incrementQty(line.slug, line.grams)}
                          onDecrement={() => decrementQty(line.slug, line.grams)}
                        />
                        <span className="font-display font-medium text-ink">
                          {formatPrice(line.price * line.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="h-fit rounded-card bg-teal-tint p-7">
            <h2 className="font-display text-2xl font-medium text-teal">Order total</h2>
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-bold text-teal">How would you like to get your order?</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(
                  [
                    { value: "delivery", title: "Delivery", sub: "Melbourne Metro" },
                    { value: "pickup", title: "Free pickup", sub: "Balwyn North or Templestowe Lower" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className="cursor-pointer rounded-tight border-2 bg-white p-3 text-teal transition"
                    style={{ borderColor: method === opt.value ? "#04889c" : "transparent" }}
                  >
                    <input
                      type="radio"
                      name="fulfilment"
                      value={opt.value}
                      checked={method === opt.value}
                      onChange={() => setMethod(opt.value)}
                      className="sr-only"
                    />
                    <span className="block font-bold">{opt.title}</span>
                    <span className="block text-xs text-teal/70">{opt.sub}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 flex flex-col gap-3 text-teal">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{pickup ? "Pickup" : "Delivery (Melbourne Metro)"}</span>
                <span className="font-bold">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              {!pickup && amountToFreeShipping > 0 && lines.length > 0 && (
                <p className="text-xs">
                  Add {formatPrice(amountToFreeShipping)} more for free delivery.
                </p>
              )}
              <div className="mt-2 flex justify-between border-t border-teal/20 pt-3 text-lg">
                <span className="font-bold">Total</span>
                <span className="font-display font-medium">{formatPrice(total)}</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-teal/70">
              Got a promo code? You can enter it on the secure payment page.
            </p>

            <button
              type="button"
              disabled={lines.length === 0 || loading}
              onClick={handleCheckout}
              className="btn btn-teal mt-7 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Redirecting to payment…" : "Checkout with Stripe"}
            </button>
            {error && (
              <p className="mt-4 text-sm font-bold text-coral-dark">{error}</p>
            )}
            <DeliveryInfo className="mt-5 text-xs text-teal/70" />
          </div>
        </div>
      </section>
    </>
  );
}
