"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UnavailableBanner from "@/components/UnavailableBanner";

export default function ProductGallery({
  images,
  productName,
  unavailable = false,
}: {
  images: string[];
  productName: string;
  unavailable?: boolean;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-media bg-cream-deep sm:aspect-[4/5]">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[active]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${productName} — Paw-a-licious homemade dog food, photo ${active + 1}`}
              fill
              priority={active === 0}
              sizes="(min-width: 1024px) 42vw, 92vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {unavailable && <UnavailableBanner size="lg" />}
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-tight border-2 transition ${
                i === active ? "border-coral" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
