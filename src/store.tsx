import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { byId, toMinor, fromMinor } from "./data";

type Line = { id: string; qty: number };
type Ctx = {
  lines: Line[];
  count: number;
  subtotal: number;
  subtotalMinor: number;
  drawer: boolean;
  setDrawer: (v: boolean) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  bump: number;
};

const CartCtx = createContext<Ctx>(null!);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kl-cart") || "[]");
    } catch {
      return [];
    }
  });
  const [drawer, setDrawer] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    localStorage.setItem("kl-cart", JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<Ctx>(() => {
    const valid = lines.filter((l) => byId(l.id));
    // Compute in smallest integer unit (pence/paise) to prevent floating-point accumulation errors
    const subtotalMinor = valid.reduce((sum, l) => {
      const p = byId(l.id)!;
      return sum + toMinor(p.price) * l.qty;
    }, 0);

    return {
      lines: valid,
      count: valid.reduce((n, l) => n + l.qty, 0),
      subtotalMinor,
      subtotal: fromMinor(subtotalMinor),
      drawer,
      setDrawer,
      bump,
      add: (id, qty = 1) => {
        setBump((b) => b + 1);
        setLines((ls) =>
          ls.some((l) => l.id === id)
            ? ls.map((l) => (l.id === id ? { ...l, qty: Math.min(20, l.qty + qty) } : l))
            : [...ls, { id, qty }],
        );
      },
      setQty: (id, qty) =>
        setLines((ls) => ls.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l))),
      remove: (id) => setLines((ls) => ls.filter((l) => l.id !== id)),
    };
  }, [lines, drawer, bump]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
