/**
 * Adaptador Shopify — Storefront API (GraphQL).
 *
 * Se activa solo cuando hay credenciales; hasta entonces el sitio corre con
 * el adaptador local. Convenciones esperadas en la tienda:
 *   · la opción de talla se llama "Talla" (o "Size")
 *   · el drop va como tag `drop:DROP 01 · AW26`
 *   · el colorway va como metafield `custom.colorway` o como opción "Color"
 */
import type { Product, ProductVariant, ShopAdapter } from "../types";
import { storefront } from "../shopify-client";

const PRODUCT_FRAGMENT = `
  fragment ProductParts on Product {
    id
    handle
    title
    description
    tags
    availableForSale
    featuredImage { url }
    images(first: 8) { nodes { url } }
    collections(first: 1) { nodes { title } }
    priceRange { minVariantPrice { amount } }
    compareAtPriceRange { maxVariantPrice { amount } }
    colorway: metafield(namespace: "custom", key: "colorway") { value }
    details: metafield(namespace: "custom", key: "details") { value }
    variants(first: 50) {
      nodes {
        id
        title
        sku
        availableForSale
        selectedOptions { name value }
        price { amount }
        compareAtPrice { amount }
      }
    }
  }
`;

interface GqlVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: { amount: string };
  compareAtPrice: { amount: string } | null;
}

interface GqlProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: { url: string } | null;
  images: { nodes: { url: string }[] };
  collections: { nodes: { title: string }[] };
  priceRange: { minVariantPrice: { amount: string } };
  compareAtPriceRange: { maxVariantPrice: { amount: string } };
  colorway: { value: string } | null;
  details: { value: string } | null;
  variants: { nodes: GqlVariant[] };
}

const num = (s: string | undefined | null) => (s == null ? 0 : Number(s));

const sizeOf = (v: GqlVariant) =>
  v.selectedOptions.find((o) => /^(talla|size)$/i.test(o.name))?.value ?? v.title;

const colorOf = (p: GqlProduct) =>
  p.colorway?.value ??
  p.variants.nodes[0]?.selectedOptions.find((o) => /^(color|colorway)$/i.test(o.name))?.value ??
  "";

/** `details` viaja como metafield JSON (list.single_line_text_field). */
function parseDetails(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [String(v)];
  } catch {
    return raw.split("\n").filter(Boolean);
  }
}

function toProduct(p: GqlProduct): Product {
  const variants: ProductVariant[] = p.variants.nodes.map((v) => ({
    id: v.id,
    title: v.title,
    size: sizeOf(v),
    price: num(v.price.amount),
    compareAtPrice: v.compareAtPrice ? num(v.compareAtPrice.amount) : null,
    sku: v.sku ?? "",
    availableForSale: v.availableForSale,
  }));

  const price = num(p.priceRange.minVariantPrice.amount);
  const compareAtRaw = num(p.compareAtPriceRange.maxVariantPrice.amount);
  const compareAt = compareAtRaw > price ? compareAtRaw : null;

  const images = p.images.nodes.map((i) => i.url);
  if (p.featuredImage && !images.includes(p.featuredImage.url)) {
    images.unshift(p.featuredImage.url);
  }

  return {
    id: p.id,
    slug: p.handle,
    name: p.title,
    description: p.description,
    collection: p.collections.nodes[0]?.title ?? "LOIRN",
    drop: p.tags.find((t) => t.startsWith("drop:"))?.slice(5) ?? "",
    colorway: colorOf(p),
    sku: variants[0]?.sku.replace(/-[^-]+$/, "") ?? "",
    price,
    compareAt,
    discountLabel: compareAt ? `-${Math.round((1 - price / compareAt) * 100)}%` : null,
    sizes: [...new Set(variants.map((v) => v.size))],
    variants,
    images,
    details: parseDetails(p.details?.value),
    featured: p.tags.includes("featured"),
    availableForSale: p.availableForSale,
  };
}

export const shopifyAdapter: ShopAdapter = {
  async getProducts() {
    const data = await storefront<{ products: { nodes: GqlProduct[] } }>(
      `${PRODUCT_FRAGMENT}
       query Products { products(first: 250, sortKey: CREATED_AT, reverse: true) {
         nodes { ...ProductParts }
       } }`
    );
    return data.products.nodes.map(toProduct);
  },

  async getProduct(slug) {
    const data = await storefront<{ product: GqlProduct | null }>(
      `${PRODUCT_FRAGMENT}
       query Product($handle: String!) { product(handle: $handle) { ...ProductParts } }`,
      { handle: slug }
    );
    return data.product ? toProduct(data.product) : undefined;
  },
};
