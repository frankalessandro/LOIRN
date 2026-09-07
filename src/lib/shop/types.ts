/**
 * Modelo de datos de la tienda.
 *
 * Deliberadamente calcado de la forma que devuelve la Storefront API de
 * Shopify (handle / variants / availableForSale / merchandiseId) para que
 * cambiar del catálogo local a Shopify sea sustituir el adaptador y nada
 * más. Ver `src/lib/shop/index.ts`.
 */

/** Una variante comprable = lo que Shopify llama `ProductVariant`. */
export interface ProductVariant {
  /** `merchandiseId` para la Cart API. Local: `local:slug:TALLA`. */
  id: string;
  /** Título de la variante tal como lo muestra Shopify: "M", "32". */
  title: string;
  /** Opción "Talla" aislada (Shopify: selectedOptions[name="Talla"]). */
  size: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  availableForSale: boolean;
}

export interface Product {
  /** `gid://shopify/Product/...` — id opaco. */
  id: string;
  /** `handle` en Shopify. Es la ruta: /producto/{slug}. */
  slug: string;
  name: string;
  description: string;
  /** Colección principal (Shopify: collections.nodes[0].title). */
  collection: string;
  /** Drop al que pertenece (Shopify: tag `drop:...`). */
  drop: string;
  colorway: string;
  sku: string;
  /** Precio de la variante más barata disponible. */
  price: number;
  compareAt: number | null;
  /** "-20%" o null. Derivado. */
  discountLabel: string | null;
  sizes: string[];
  variants: ProductVariant[];
  /** URLs de imagen, la primera es la principal. */
  images: string[];
  details: string[];
  featured: boolean;
  /** false cuando ninguna variante tiene stock. */
  availableForSale: boolean;
}

/** Facetas del catálogo, calculadas una vez en build. */
export interface CatalogFacets {
  collections: string[];
  sizes: string[];
  colorways: string[];
  drops: string[];
  minPrice: number;
  maxPrice: number;
}

/** Línea del carrito. `variantId` es el `merchandiseId` del checkout. */
export interface CartLine {
  variantId: string;
  productSlug: string;
  name: string;
  size: string;
  price: number;
  compareAt: number | null;
  image: string;
  quantity: number;
}

/**
 * Origen del catálogo. Solo se usa en build/servidor: el checkout vive en
 * `src/lib/cart/checkout.ts` porque corre en el navegador y no debe
 * arrastrar el catálogo entero al bundle.
 */
export interface ShopAdapter {
  getProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
}
