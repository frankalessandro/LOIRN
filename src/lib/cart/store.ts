/**
 * Carrito de LOIRN — estado de cliente.
 *
 * Vive en localStorage (el sitio es estático) y se sincroniza entre pestañas.
 * Cada línea guarda el `variantId`, que es el `merchandiseId` que la Cart API
 * de Shopify necesita en el checkout: al conectar Shopify no cambia nada aquí.
 */
import type { CartLine } from "../shop/types";

const KEY = "loirn:cart:v1";
const EVENT = "loirn:cart";

export type { CartLine };
export interface CartState {
  lines: CartLine[];
  updatedAt: number;
}

const empty = (): CartState => ({ lines: [], updatedAt: 0 });

let state: CartState = empty();
let hydrated = false;

function isLine(v: unknown): v is CartLine {
  const l = v as CartLine;
  return (
    !!l &&
    typeof l.variantId === "string" &&
    typeof l.name === "string" &&
    typeof l.price === "number" &&
    typeof l.quantity === "number" &&
    l.quantity > 0
  );
}

function read(): CartState {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as CartState;
    return { lines: (parsed.lines ?? []).filter(isLine), updatedAt: parsed.updatedAt ?? 0 };
  } catch {
    return empty();
  }
}

function commit(next: CartLine[], detail: Record<string, unknown> = {}) {
  state = { lines: next, updatedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* modo privado / cuota: el carrito sigue vivo en memoria */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { ...detail, state } }));
}

/** Lee de localStorage la primera vez y engancha la sincronía entre pestañas. */
export function getCart(): CartState {
  if (!hydrated) {
    hydrated = true;
    state = read();
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY) return;
      state = read();
      window.dispatchEvent(new CustomEvent(EVENT, { detail: { external: true, state } }));
    });
  }
  return state;
}

export function subscribe(fn: (s: CartState) => void): () => void {
  const h = () => fn(getCart());
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

export function addLine(line: Omit<CartLine, "quantity">, quantity = 1) {
  const lines = [...getCart().lines];
  const i = lines.findIndex((l) => l.variantId === line.variantId);
  if (i === -1) lines.push({ ...line, quantity });
  else lines[i] = { ...lines[i]!, quantity: lines[i]!.quantity + quantity };
  commit(lines, { added: line.variantId });
}

export function setQuantity(variantId: string, quantity: number) {
  const lines = getCart()
    .lines.map((l) => (l.variantId === variantId ? { ...l, quantity } : l))
    .filter((l) => l.quantity > 0);
  commit(lines);
}

export const removeLine = (variantId: string) => setQuantity(variantId, 0);

export const clearCart = () => commit([]);

export const cartCount = (s: CartState = getCart()) =>
  s.lines.reduce((n, l) => n + l.quantity, 0);

export const cartSubtotal = (s: CartState = getCart()) =>
  s.lines.reduce((n, l) => n + l.price * l.quantity, 0);

/** Ahorro total frente a los precios tachados. */
export const cartSavings = (s: CartState = getCart()) =>
  s.lines.reduce((n, l) => n + (l.compareAt ? (l.compareAt - l.price) * l.quantity : 0), 0);

/** Abre el drawer. Lo escucha CartDrawer.astro. */
export const openCart = () => window.dispatchEvent(new CustomEvent("loirn:cart:open"));
export const closeCart = () => window.dispatchEvent(new CustomEvent("loirn:cart:close"));
