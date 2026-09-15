/**
 * Metadata de drops de LOIRN.
 *
 * Estado del drop:
 *   · "upcoming"  - no ha salido. Se muestra countdown.
 *   · "active"    - lanzado, productos disponibles.
 *   · "soldout"   - todo agotado o cerrado.
 *
 * `launchDate` en ISO 8601 (UTC). Si status es "active" o "soldout",
 * el countdown no se muestra aunque la fecha sea futura.
 *
 * `productSlugs` enlaza con handles reales del catálogo activo (Shopify si
 * hay credenciales, si no src/data/products.ts) para filtrar las prendas
 * de este drop en la página individual.
 */

export interface DropMeta {
  slug: string;
  name: string;
  /** Numero de drop: "01", "02"... */
  number: string;
  /** Temporada: "AW26", "SS27"... */
  season: string;
  /** ISO 8601 UTC - cuando sale / salio el drop. */
  launchDate: string;
  status: "upcoming" | "active" | "soldout";
  headline: string;
  description: string;
  /** Slugs de productos de este drop (de src/data/products.ts). */
  productSlugs: string[];
  /** Color de acento del hero de este drop (CSS color string). */
  accentColor?: string;
}

export const drops: DropMeta[] = [
  {
    slug: "drop-01-aw26",
    name: "DROP 01 · AW26",
    number: "01",
    season: "AW26",
    launchDate: "2026-09-01T00:00:00Z",
    status: "active",
    headline: "Vistete con presencia.",
    description:
      "El primer drop de LOIRN: ocho prendas construidas alrededor de la misma idea — vestirte no es solo cubrirte, es comunicar antes de hablar. Sistema completo de base, capas y remates para Otono/Invierno 2026.",
    productSlugs: [
      "camisa-oversize-algodon-260g",
      "camisa-oversize-algodon-380g",
      "sudadera",
      "pantalon-style",
      "bermudas",
      "jhos",
      "gorra-ajustable",
      "bolso-cuadrado",
    ],
    accentColor: "var(--loirn-gold)",
  },
  {
    slug: "drop-02-ss27",
    name: "DROP 02 · SS27",
    number: "02",
    season: "SS27",
    launchDate: "2027-03-01T00:00:00Z",
    status: "upcoming",
    headline: "Proximamente.",
    description:
      "Primavera/Verano 2027. Silhouettes mas ligeras, paleta extendida. El sistema sigue creciendo.",
    productSlugs: [],
  },
];

/** Devuelve el drop por slug, o undefined. */
export const getDrop = (slug: string): DropMeta | undefined =>
  drops.find((d) => d.slug === slug);
