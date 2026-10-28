"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DELIVERY_FEE, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { isUnavailable } from "@/lib/products";

export type CartLine = {
  slug: string;
  name: string;
  protein: string;
  image: string;
  sizeLabel: string;
  grams: number;
  price: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  lastAdded: CartLine | null;
  itemCount: number;
  subtotal: number;
  amountToFreeShipping: number;
  freeShippingProgress: number;
  deliveryFee: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (line: Omit<CartLine, "qty">, qty?: number) => void;
  updateQty: (slug: string, grams: number, qty: number) => void;
  incrementQty: (slug: string, grams: number, max?: number) => void;
  decrementQty: (slug: string, grams: number, min?: number) => void;
  removeItem: (slug: string, grams: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "pawalicious-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartLine | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Captured once, synchronously, during the initial render — before any
  // effect (including OrderSuccessBanner's, a descendant, which strips this
  // query param via history.replaceState) has had a chance to run. Reading
  // window.location.search from inside an effect instead would race that
  // cleanup, since child effects commit before parent effects.
  const [justCompletedOrder] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("order") === "success"
  );

  useEffect(() => {
    // One-time hydration from localStorage on mount. Intentionally
    // synchronous: the cart must reflect saved state before first paint,
    // and this only ever runs once (empty dependency array).
    //
    // A completed Stripe checkout redirects back here with ?order=success —
    // skip restoring the old cart in that case (and wipe the stored copy)
    // rather than racing OrderSuccessBanner's own clearCart() call.
    try {
      if (justCompletedOrder) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        // Drop anything that has since become unavailable (e.g. a cart saved before
        // a recipe was paused) so it can't reach checkout.
        if (raw) setLines((JSON.parse(raw) as CartLine[]).filter((l) => !isUnavailable(l.slug)));
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, [justCompletedOrder]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota errors
    }
  }, [lines, hydrated]);

  const addItem = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    if (isUnavailable(line.slug)) return;
    setLines((prev) => {
      const existing = prev.find(
        (l) => l.slug === line.slug && l.grams === line.grams
      );
      if (existing) {
        return prev.map((l) =>
          l.slug === line.slug && l.grams === line.grams
            ? { ...l, qty: l.qty + qty }
            : l
        );
      }
      return [...prev, { ...line, qty }];
    });
    setLastAdded({ ...line, qty });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((slug: string, grams: number, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) {
        return prev.filter((l) => !(l.slug === slug && l.grams === grams));
      }
      return prev.map((l) =>
        l.slug === slug && l.grams === grams ? { ...l, qty } : l
      );
    });
  }, []);

  // Functional increment/decrement — always derives the next qty from the
  // latest state rather than a possibly-stale prop, so rapid clicks never
  // get lost to batching.
  const incrementQty = useCallback((slug: string, grams: number, max = 20) => {
    setLines((prev) =>
      prev.map((l) =>
        l.slug === slug && l.grams === grams
          ? { ...l, qty: Math.min(max, l.qty + 1) }
          : l
      )
    );
  }, []);

  const decrementQty = useCallback((slug: string, grams: number, min = 1) => {
    setLines((prev) => {
      const target = prev.find((l) => l.slug === slug && l.grams === grams);
      if (target && target.qty - 1 < min) {
        return prev.filter((l) => !(l.slug === slug && l.grams === grams));
      }
      return prev.map((l) =>
        l.slug === slug && l.grams === grams ? { ...l, qty: l.qty - 1 } : l
      );
    });
  }, []);

  const removeItem = useCallback((slug: string, grams: number) => {
    setLines((prev) => prev.filter((l) => !(l.slug === slug && l.grams === grams)));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    [lines]
  );
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const value: CartContextValue = {
    lines,
    isOpen,
    lastAdded,
    itemCount,
    subtotal,
    amountToFreeShipping,
    freeShippingProgress,
    deliveryFee: DELIVERY_FEE,
    openCart,
    closeCart,
    addItem,
    updateQty,
    incrementQty,
    decrementQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
