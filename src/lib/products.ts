export type SizeOption = {
  label: string;
  grams: number;
  price: number;
};

export type Product = {
  slug: string;
  name: string;
  protein: string;
  tagline: string;
  description: string;
  longDescription: string;
  accent: "coral" | "teal";
  heroImage: string;
  gallery: string[];
  isFavourite?: boolean;
  /** Not orderable right now. Shown with a banner everywhere and blocked at the cart and checkout. */
  unavailable?: boolean;
};

export const UNAVAILABLE_LABEL = "Option currently unavailable";

export const SIZE_OPTIONS: SizeOption[] = [
  { label: "500g tub", grams: 500, price: 18.95 },
  { label: "750g tub", grams: 750, price: 24.95 },
];

export const SHARED_INGREDIENTS = [
  "Sweet potato",
  "Pumpkin",
  "Broccoli",
  "Cauliflower",
  "Carrot",
  "Zucchini",
  "Mushroom",
  "Brown rice",
  "Coconut oil",
  "Psyllium husk",
];

export const NASTIES_FREE = [
  "No fillers",
  "No preservatives",
  "No artificial colours or flavours",
  "Made in small batches",
  "Gently cooked for nutrition",
];

export const FEEDING_GUIDE = [
  { size: "Small dogs", weight: "up to 10kg", amount: "150–250g per meal" },
  { size: "Medium dogs", weight: "10–25kg", amount: "250–450g per meal" },
  { size: "Large dogs", weight: "25kg+", amount: "450–650g per meal" },
];

export const STORAGE_INSTRUCTIONS = [
  "Keep frozen — good for up to 5 months from the packaging date, best used before then.",
  "Thaw in the refrigerator for at least 24 hours before serving.",
  "Serve chilled, or warm slightly in the microwave for 30–40 seconds (varies by microwave) — most dogs prefer it served warm.",
  "Once thawed, keep refrigerated and use within 5 days.",
];

export const OPTIONAL_BOOSTS = [
  {
    title: "Extra protein",
    detail: "Add 1–2 cooked eggs, however your dog prefers them, served alongside the meal.",
  },
  {
    title: "Extra calcium",
    detail: "Add 1–2 tablespoons of all-natural plain yoghurt.",
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "chicken",
    name: "Chicken",
    protein: "Chicken",
    tagline: "The fan favourite",
    description: "Tender chicken with veggies & brown rice.",
    longDescription:
      "Our best-loved recipe: tender, gently-cooked chicken folded through sweet potato, pumpkin and brown rice, with a full garden of veggies mixed in. The one most dogs (and most humans watching them eat it) fall for first.",
    accent: "teal",
    heroImage: "/assets/photos/raw-chicken.jpg",
    gallery: [
      "/assets/photos/raw-chicken.jpg",
      "/assets/photos/bowlbone-chicken.jpg",
      "/assets/photos/mixing-chicken.jpg",
      "/assets/photos/dog-chicken.jpg",
    ],
    isFavourite: true,
  },
  {
    slug: "beef",
    name: "Beef",
    protein: "Beef",
    tagline: "Hearty & rich",
    description: "Hearty beef with veggies & brown rice.",
    longDescription:
      "A hearty, rich recipe built around gently-cooked beef, brown rice and a full mix of real veggies. Made for dogs who like a deeper, heartier bowl — small-batch cooked the same way, every time.",
    accent: "coral",
    heroImage: "/assets/photos/raw-beef.jpg",
    gallery: [
      "/assets/photos/raw-beef.jpg",
      "/assets/photos/bowlbone-beef.jpg",
      "/assets/photos/mixing-beef.jpg",
      "/assets/photos/dog-beef.jpg",
    ],
  },
  {
    slug: "turkey",
    name: "Turkey",
    protein: "Turkey",
    tagline: "Lean & light",
    description: "Lean turkey with veggies & brown rice.",
    longDescription:
      "A lean, lighter recipe built on gently-cooked turkey, brown rice and the same full mix of real vegetables in every Paw-a-licious tub. A great everyday bowl for dogs who do well on leaner proteins.",
    accent: "teal",
    heroImage: "/assets/photos/raw-turkey.jpg",
    gallery: [
      "/assets/photos/raw-turkey.jpg",
      "/assets/photos/bowlbone-turkey.jpg",
      "/assets/photos/mixing-turkey.jpg",
      "/assets/photos/dog-turkey.jpg",
    ],
    unavailable: true,
  },
  {
    slug: "kangaroo",
    name: "Kangaroo",
    protein: "Kangaroo",
    tagline: "Premium & novel",
    description: "Premium kangaroo with veggies & brown rice.",
    longDescription:
      "Our premium recipe, built around gently-cooked kangaroo — a lean, novel Australian protein — with sweet potato, pumpkin and the full Paw-a-licious veggie mix. A favourite for dogs who love trying something different.",
    accent: "coral",
    heroImage: "/assets/photos/raw-kangaroo.jpg",
    gallery: [
      "/assets/photos/raw-kangaroo.jpg",
      "/assets/photos/food-prep-tubs-4.jpg",
      "/assets/photos/mixing-kangaroo.jpg",
      "/assets/photos/dog-kangaroo.jpg",
    ],
    unavailable: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function isUnavailable(slug: string): boolean {
  return getProductBySlug(slug)?.unavailable === true;
}

export function getRelatedProducts(slug: string, count = 3): Product[] {
  return PRODUCTS.filter((p) => p.slug !== slug).slice(0, count);
}

export function priceFor(grams: number): number {
  const option = SIZE_OPTIONS.find((s) => s.grams === grams);
  return option ? option.price : SIZE_OPTIONS[0].price;
}
