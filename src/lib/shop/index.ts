/**
 * Punto único de acceso al catálogo.
 *
 * Elige adaptador según haya credenciales de Shopify en el entorno. Ninguna
 * página importa un adaptador directamente: así migrar a Shopify es poner
 * dos variables en .env y volver a construir.
 */
import type { CatalogFacets, Product } from "./types";
import { shopifyEnabled } from "./shopify-client";
import { localAdapter } from "./adapters/local";
import { shopifyAdapter } from "./adapters/shopify";

const adapter = shopifyEnabled ? shopifyAdapter : localAdapter;

/** "shopify" | "local" — útil para avisos en dev y para el checkout. */
export const shopSource = shopifyEnabled ? "shopify" : "local";

/** Memoizado: en build estático esto se pide desde varias páginas. */
let cache: Promise<Product[]> | null = null;

export function getProducts(): Promise<Product[]> {
  cache ??= adapter.getProducts();
  return cache;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const list = await getProducts();
  return list.find((p) => p.slug === slug) ?? adapter.getProduct(slug);
}

export async function getFeatured(): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.featured);
}

/** Orden de tallas para que los filtros no salgan alfabéticos. */
const SIZE_ORDER = ["Única", "XS", "S", "M", "L", "XL", "XXL"];
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b, "es");
  });
}

/** Facetas del catálogo completo — alimentan la barra de filtros. */
export async function getFacets(): Promise<CatalogFacets> {
  const list = await getProducts();
  const prices = list.map((p) => p.price);
  return {
    collections: [...new Set(list.map((p) => p.collection))].sort((a, b) =>
      a.localeCompare(b, "es")
    ),
    sizes: sortSizes([...new Set(list.flatMap((p) => p.sizes))]),
    colorways: [...new Set(list.map((p) => p.colorway).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "es")
    ),
    drops: [...new Set(list.map((p) => p.drop).filter(Boolean))],
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

export { money, CURRENCY } from "./money";
export type { Product, ProductVariant, CartLine, CatalogFacets } from "./types";
