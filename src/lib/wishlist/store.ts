/**
 * Wishlist de LOIRN - estado de cliente.
 *
 * Vive en localStorage y se sincroniza entre pestanas.
 * Mismo patron que src/lib/cart/store.ts para consistencia.
 */

const KEY = "loirn:wishlist:v1";
const EVENT = "loirn:wishlist";

export interface WishlistState {
  slugs: string[];
  updatedAt: number;
}

const empty = (): WishlistState => ({ slugs: [], updatedAt: 0 });

let state: WishlistState = empty();
let hydrated = false;

function read(): WishlistState {
  if (typeof localStorage === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as WishlistState;
    return {
      slugs: Array.isArray(parsed.slugs) ? parsed.slugs.filter((s) => typeof s === "string") : [],
      updatedAt: parsed.updatedAt ?? 0,
    };
  } catch {
    return empty();
  }
}

function commit(next: string[]) {
  state = { slugs: next, updatedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* modo privado */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { state } }));
}

export function getWishlist(): WishlistState {
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

export function subscribe(fn: (s: WishlistState) => void): () => void {
  const h = () => fn(getWishlist());
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

export function toggleWish(slug: string): boolean {
  const slugs = [...getWishlist().slugs];
  const idx = slugs.indexOf(slug);
  if (idx === -1) {
    slugs.push(slug);
    commit(slugs);
    return true;
  } else {
    slugs.splice(idx, 1);
    commit(slugs);
    return false;
  }
}

export function isWishlisted(slug: string): boolean {
  return getWishlist().slugs.includes(slug);
}

export const wishCount = (s: WishlistState = getWishlist()) => s.slugs.length;
