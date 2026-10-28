"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";
import { SIZE_OPTIONS, UNAVAILABLE_LABEL } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { EASE_OUT } from "@/lib/animations";
import ProductGallery from "@/components/ProductGallery";
import QtyStepper from "@/components/QtyStepper";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";

export default function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [sizeIdx, setSizeIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const { addItem } = useCart();
  const size = SIZE_OPTIONS[sizeIdx];
  const accentText = product.accent === "coral" ? "text-coral" : "text-teal";
  const unavailable = product.unavailable === true;

  useEffect(() => {
    function onScroll() {
      setShowStickyBar(window.scrollY > 560);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAdd() {
    if (unavailable) return;
    addItem(
      {
        slug: product.slug,
        name: product.name,
        protein: product.protein,
        image: product.heroImage,
        sizeLabel: size.label,
        grams: size.grams,
        price: size.price,
      },
      qty
    );
  }

  return (
    <>
      <section className="pb-16 pt-28 lg:pb-24 lg:pt-36">
        <div className="container-shell">
          <p className="mb-6 flex items-center gap-2 text-sm text-ink-faint">
            <Link href="/shop" className="link-underline font-bold text-ink-soft">
              Shop
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </p>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <ProductGallery
              images={product.gallery}
              productName={product.name}
              unavailable={unavailable}
            />

            <div>
              {product.isFavourite && !unavailable && (
                <span className="mb-3 inline-block rounded-chip bg-coral px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-cream-soft">
                  Fan favourite
                </span>
              )}
              <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.02] text-ink">
                {product.name}
              </h1>
              <p className={`mt-2 script-accent text-2xl ${accentText}`}>{product.tagline}</p>
              <p className="mt-5 max-w-md text-lg text-ink-soft">{product.longDescription}</p>

              {unavailable ? (
                <div className="mt-8 rounded-card border-2 border-coral bg-coral-tint p-6">
                  <p className="font-display text-xl font-bold uppercase tracking-wide text-coral-dark">
                    {UNAVAILABLE_LABEL}
                  </p>
                  <p className="mt-2 text-ink-soft">
                    {product.name} isn&apos;t available to order right now. Our other recipes are
                    ready when you are.
                  </p>
                  <Link href="/shop" className="btn btn-coral mt-5 inline-flex">
                    Shop other recipes
                  </Link>
                </div>
              ) : (
              <>
              <div className="mt-8">
                <p className="mb-3 text-sm font-bold text-ink-soft">Size</p>
                <div className="flex flex-wrap gap-3">
                  {SIZE_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSizeIdx(i)}
                      className={`rounded-card border px-5 py-3 text-left transition ${
                        i === sizeIdx
                          ? "border-ink bg-ink text-cream-soft"
                          : "border-ink/15 text-ink hover:border-ink/40"
                      }`}
                    >
                      <span className="block font-display font-medium">{opt.label}</span>
                      <span className={i === sizeIdx ? "text-cream-soft/80" : "text-ink-soft"}>
                        {formatPrice(opt.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <QtyStepper
                  qty={qty}
                  onIncrement={() => setQty((q) => Math.min(20, q + 1))}
                  onDecrement={() => setQty((q) => Math.max(1, q - 1))}
                />
                <button type="button" onClick={handleAdd} className="btn btn-coral flex-1 sm:flex-none">
                  Add to cart — {formatPrice(size.price * qty)}
                </button>
              </div>
              </>
              )}

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/10 pt-6 text-sm font-bold text-ink-soft">
                <span>100% natural ingredients</span>
                <span>No preservatives</span>
                <span>Gently cooked</span>
              </div>

              <div className="mt-10">
                <ProductTabs protein={product.protein} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink/10 bg-white py-20 lg:py-24">
          <div className="container-shell">
            <ScrollReveal>
              <p className="eyebrow text-coral-dark">You might also like</p>
              <h2 className="mt-2 font-display text-3xl font-medium text-ink">
                More recipes to try
              </h2>
            </ScrollReveal>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky mobile buy bar */}
      {!unavailable && (
      <motion.div
        initial={false}
        animate={{ y: showStickyBar ? 0 : "100%" }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream-soft/97 px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(35,35,35,0.15)] backdrop-blur-md lg:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-tight">
            <Image src={product.heroImage} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-medium text-ink">{product.name}</p>
            <p className="text-xs text-ink-faint">{size.label} · {formatPrice(size.price)}</p>
          </div>
          <button type="button" onClick={handleAdd} className="btn btn-coral !py-2.5 !text-sm shrink-0">
            Add to cart
          </button>
        </div>
      </motion.div>
      )}
    </>
  );
}
