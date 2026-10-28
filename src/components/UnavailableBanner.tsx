import { UNAVAILABLE_LABEL } from "@/lib/products";

// A bold band across a product photo. Place it inside a `relative overflow-hidden`
// container; it ignores pointer events so the photo underneath stays clickable.
export default function UnavailableBanner({ size = "md" }: { size?: "md" | "lg" }) {
  const text =
    size === "lg"
      ? "px-6 py-3 text-base sm:text-xl"
      : "px-4 py-2 text-xs sm:text-sm";

  return (
    <div
      role="img"
      aria-label={UNAVAILABLE_LABEL}
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-ink/30"
    >
      <div
        className={`-rotate-6 w-[125%] bg-coral text-center font-display font-extrabold uppercase tracking-wide text-white shadow-lg ${text}`}
      >
        {UNAVAILABLE_LABEL}
      </div>
    </div>
  );
}
