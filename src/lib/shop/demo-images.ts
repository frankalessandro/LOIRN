/**
 * Fotografía demo mientras la tienda de Shopify no tenga imágenes subidas.
 *
 * Solo rellena productos con `images` vacío: en cuanto una prenda tenga fotos
 * reales en Shopify, este relleno deja de aplicarse a ella sin tocar nada.
 *
 * Asigna 3 fotos por prenda (para ver carrusel de card y galería de ficha)
 * desde src/assets, optimizadas con `astro:assets` (webp, 1100 px). Las gorras
 * usan fotos de gorras y las camisas fotos de camisetas; el resto de
 * categorías aún no tiene fotos propias y toma de la bolsa completa.
 */
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import type { Product } from "./types";

const files = import.meta.glob<{ default: ImageMetadata }>(
  "../../assets/WhatsApp Image *.jpeg",
  { eager: true }
);
const pick = (name: string) => files[`../../assets/WhatsApp Image 2026-09-14 at ${name}.jpeg`].default;

const caps = [
  "11.13.08 PM (1)", // NY negra · David
  "11.13.08 PM (2)", // LA azul · David
  "11.13.08 PM (3)", // NY roja
  "11.13.08 PM (4)", // NY roja · bordado
  "11.13.08 PM (5)", // NY negra · graffiti
  "11.13.08 PM (6)", // Supreme roja
  "11.13.08 PM",     // LA denim
  "11.13.09 PM",     // Supreme negra
  "11.13.10 PM (1)", // LA café
  "11.13.10 PM",     // Sox · alambre
].map(pick);

// "11.13.11 PM (2)" es la misma Barcelona de "(1)": se omite para no repetir en un carrusel.
const jerseys = [
  "11.13.11 PM (1)", // Barcelona
  "11.13.11 PM",     // Portugal
  "11.13.12 PM (1)", // Brasil
  "11.13.12 PM",     // Manchester United
].map(pick);

const pools: { match: RegExp; imgs: ImageMetadata[] }[] = [
  { match: /^gorras?$/i, imgs: caps },
  { match: /^camisas?$/i, imgs: jerseys },
];
const fallback = [...caps, ...jerseys];

const optimized = new Map<ImageMetadata, Promise<string>>();
const url = (img: ImageMetadata) => {
  if (!optimized.has(img)) {
    optimized.set(img, getImage({ src: img, width: 1100, format: "webp" }).then((r) => r.src));
  }
  return optimized.get(img)!;
};

export async function withDemoImages(products: Product[]): Promise<Product[]> {
  const counters = new Map<ImageMetadata[], number>();
  return Promise.all(
    products.map(async (p) => {
      if (p.images.length) return p;
      const pool = pools.find((x) => x.match.test(p.collection))?.imgs ?? fallback;
      const k = counters.get(pool) ?? 0;
      counters.set(pool, k + 1);
      const trio = [0, 1, 2].map((i) => pool[(k + i) % pool.length]);
      return { ...p, images: await Promise.all(trio.map(url)) };
    })
  );
}
