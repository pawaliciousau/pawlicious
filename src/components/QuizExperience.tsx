"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { quizStepVariants } from "@/lib/animations";
import { PRODUCTS, SIZE_OPTIONS, UNAVAILABLE_LABEL, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import UnavailableBanner from "@/components/UnavailableBanner";

type LifeStage = "Puppy" | "Adult" | "Senior";
type Vibe = "Tiny tornado" | "Professional napper" | "Adventure buddy" | "Snack enthusiast";
type Flavour = "Chicken" | "Beef" | "Turkey" | "Kangaroo" | "Mixed — surprise us";

const LIFE_STAGES: LifeStage[] = ["Puppy", "Adult", "Senior"];
const VIBES: Vibe[] = ["Tiny tornado", "Professional napper", "Adventure buddy", "Snack enthusiast"];
const FLAVOURS: Flavour[] = ["Chicken", "Beef", "Turkey", "Kangaroo", "Mixed — surprise us"];

const VIBE_FALLBACK: Record<Vibe, string> = {
  "Tiny tornado": "chicken",
  "Professional napper": "turkey",
  "Adventure buddy": "kangaroo",
  "Snack enthusiast": "beef",
};

function matchProduct(vibe: Vibe | null, flavour: Flavour | null): Product {
  if (flavour && flavour !== "Mixed — surprise us") {
    const found = PRODUCTS.find((p) => p.protein === flavour);
    if (found) return found;
  }
  const fallbackSlug = vibe ? VIBE_FALLBACK[vibe] : "chicken";
  return PRODUCTS.find((p) => p.slug === fallbackSlug) ?? PRODUCTS[0];
}

const TOTAL_STEPS = 4;

export default function QuizExperience() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dogName, setDogName] = useState("");
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [flavour, setFlavour] = useState<Flavour | null>(null);
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const displayName = dogName.trim() || "your dog";
  const match = useMemo(() => matchProduct(vibe, flavour), [vibe, flavour]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleAdd() {
    if (match.unavailable) return;
    const size = SIZE_OPTIONS[0];
    addItem(
      {
        slug: match.slug,
        name: match.name,
        protein: match.protein,
        image: match.heroImage,
        sizeLabel: size.label,
        grams: size.grams,
        price: size.price,
      },
      1
    );
    setAdded(true);
  }

  function restart() {
    setDogName("");
    setLifeStage(null);
    setVibe(null);
    setFlavour(null);
    setAdded(false);
    goTo(0);
  }

  const progress = Math.min(100, (step / TOTAL_STEPS) * 100);

  return (
    <section className="min-h-[85vh] bg-white pb-24 pt-32 lg:pt-40">
      <div className="container-shell mx-auto max-w-2xl">
        {step <= TOTAL_STEPS - 1 && (
          <div className="mb-10">
            <div className="h-1.5 w-full overflow-hidden rounded-chip bg-ink/10">
              <motion.div
                className="h-full rounded-chip bg-coral"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {step === 0 && (
            <motion.div
              key="step-0"
              custom={direction}
              variants={quizStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <p className="script-accent text-3xl text-coral">let&apos;s find their match</p>
              <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-medium text-ink text-balance">
                What&apos;s your dog&apos;s name?
              </h1>
              <input
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                aria-label="Your dog's name"
                placeholder="e.g. Bella"
                maxLength={30}
                className="mt-8 w-full rounded-card border border-ink/15 bg-cream-soft px-6 py-4 text-center font-display text-2xl text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-coral/40"
                onKeyDown={(e) => e.key === "Enter" && goTo(1)}
              />
              <button
                type="button"
                onClick={() => goTo(1)}
                className="btn btn-coral mt-8"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={quizStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <h2 className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium text-ink text-balance">
                How old is {displayName}?
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {LIFE_STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => {
                      setLifeStage(stage);
                      goTo(2);
                    }}
                    className={`rounded-card border-2 px-6 py-8 font-display text-xl font-medium transition hover:border-coral hover:bg-coral-tint ${
                      lifeStage === stage ? "border-coral bg-coral-tint" : "border-ink/10 bg-cream-soft"
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => goTo(0)} className="mt-8 text-sm font-bold text-ink-faint underline">
                Back
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              variants={quizStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <h2 className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium text-ink text-balance">
                What&apos;s {displayName}&apos;s vibe?
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {VIBES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setVibe(v);
                      goTo(3);
                    }}
                    className={`rounded-card border-2 px-6 py-7 font-display text-lg font-medium transition hover:border-teal hover:bg-teal-tint ${
                      vibe === v ? "border-teal bg-teal-tint" : "border-ink/10 bg-cream-soft"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => goTo(1)} className="mt-8 text-sm font-bold text-ink-faint underline">
                Back
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              variants={quizStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <h2 className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium text-ink text-balance">
                Any flavour {displayName} already loves?
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {FLAVOURS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFlavour(f);
                      goTo(4);
                    }}
                    className={`rounded-card border-2 px-6 py-7 font-display text-lg font-medium transition hover:border-coral hover:bg-coral-tint ${
                      flavour === f ? "border-coral bg-coral-tint" : "border-ink/10 bg-cream-soft"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => goTo(2)} className="mt-8 text-sm font-bold text-ink-faint underline">
                Back
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              custom={direction}
              variants={quizStepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="text-center"
            >
              <p className="script-accent text-3xl text-coral">we found it!</p>
              <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3rem)] font-medium text-ink text-balance">
                {displayName}&apos;s Paw-a-licious match
              </h2>

              <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-media bg-cream-soft shadow-[0_20px_50px_-20px_rgba(35,35,35,0.25)]">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={match.heroImage}
                    alt={match.name}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  {match.unavailable && <UnavailableBanner />}
                </div>
                <div className="p-7 text-left">
                  <p className="script-accent text-xl text-teal">{match.tagline}</p>
                  <h3 className="mt-1 font-display text-3xl font-medium text-ink">{match.name}</h3>
                  <p className="mt-2 text-ink-soft">{match.description}</p>
                  <p className="mt-4 font-display text-lg text-ink">
                    From {formatPrice(SIZE_OPTIONS[0].price)}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/shop/${match.slug}`} className="btn btn-outline flex-1 !py-2.5 !text-sm text-center">
                      View recipe
                    </Link>
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={match.unavailable}
                      className={
                        match.unavailable
                          ? "btn flex-1 cursor-not-allowed bg-ink/10 !py-2.5 !text-sm text-ink-faint"
                          : "btn btn-coral flex-1 !py-2.5 !text-sm"
                      }
                    >
                      {match.unavailable ? UNAVAILABLE_LABEL : added ? "Added ✓" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={restart}
                className="mt-8 text-sm font-bold text-ink-faint underline"
              >
                Start over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
