/**
 * Adaptador local — catálogo estático de `src/data/products.ts`.
 *
 * Deriva variantes con la misma forma que Shopify (una por talla) para que
 * el carrito, el checkout y la UI ya trabajen con `variantId` desde hoy.
 */
import { rawProducts } from "../../../data/products";
import type { Product, ProductVariant, ShopAdapter } from "../types";

const shot = (slug: string, angle: string) => `/shots/${slug}-${angle}.svg`;

function toProduct(raw: (typeof rawProducts)[number]): Product {
  const soldOut = new Set(raw.soldOut ?? []);
  const variants: ProductVariant[] = raw.sizes.map((size) => ({
    id: `local:${raw.slug}:${size}`,
    title: size,
    size,
    price: raw.price,
    compareAtPrice: raw.compareAt,
    sku: `${raw.sku}-${size}`,
    availableForSale: !soldOut.has(size),
  }));

  return {
    id: `local:${raw.slug}`,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    collection: raw.collection,
    drop: raw.drop,
    colorway: raw.colorway,
    sku: raw.sku,
    price: raw.price,
    compareAt: raw.compareAt,
    discountLabel: raw.compareAt
      ? `-${Math.round((1 - raw.price / raw.compareAt) * 100)}%`
      : null,
    sizes: raw.sizes,
    variants,
    images: ["a", "b", "c"].map((a) => shot(raw.slug, a)),
    details: raw.details,
    featured: raw.featured,
    availableForSale: variants.some((v) => v.availableForSale),
  };
}

export const localAdapter: ShopAdapter = {
  async getProducts() {
    return rawProducts.map(toProduct);
  },

  async getProduct(slug) {
    const raw = rawProducts.find((p) => p.slug === slug);
    return raw ? toProduct(raw) : undefined;
  },

};
