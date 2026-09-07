/**
 * Genera un CSV listo para Shopify → Products → Import, a partir de
 * src/data/products.ts (única fuente de verdad del catálogo local).
 *
 * Uso: node scripts/export-shopify-csv.mjs
 * Salida: shopify-import.csv en la raíz del proyecto.
 *
 * No sube fotos: las shots actuales son placeholders de grilla, no
 * fotografía de prenda real. Sube las fotos reales manualmente en cada
 * producto después de importar.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/data/products.ts"), "utf-8");

// El archivo es TS pero el array en sí es JS plano (object literals sin
// anotaciones de tipo) — se extrae el literal y se evalúa como JS.
const start = src.indexOf("export const rawProducts");
const arrStart = src.indexOf("[", start);
const arrEnd = src.lastIndexOf("];") + 1;
const literal = src.slice(arrStart, arrEnd);
const rawProducts = new Function(`"use strict"; return (${literal});`)();

const csvEscape = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const HEADERS = [
  "Handle", "Title", "Body (HTML)", "Vendor", "Tags", "Published",
  "Option1 Name", "Option1 Value",
  "Variant SKU", "Variant Inventory Tracker", "Variant Inventory Qty",
  "Variant Inventory Policy", "Variant Fulfillment Service",
  "Variant Price", "Variant Compare At Price",
  "Variant Requires Shipping", "Variant Taxable", "Status",
];

const rows = [HEADERS];

for (const p of rawProducts) {
  const soldOut = new Set(p.soldOut ?? []);
  const tags = [
    p.drop ? `drop:${p.drop}` : null,
    p.featured ? "featured" : null,
    p.collection,
  ]
    .filter(Boolean)
    .join(", ");

  // Descripción + detalles + colorway van en el body: así se ven aunque no
  // se configuren los metafields custom.colorway / custom.details.
  const body = [
    `<p>${p.description}</p>`,
    `<p><strong>Colorway:</strong> ${p.colorway}</p>`,
    p.details?.length
      ? `<ul>${p.details.map((d) => `<li>${d}</li>`).join("")}</ul>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  p.sizes.forEach((size, i) => {
    const isFirst = i === 0;
    const qty = soldOut.has(size) ? 0 : 10;
    rows.push([
      p.slug,
      isFirst ? p.name : "",
      isFirst ? body : "",
      isFirst ? "LOIRN" : "",
      isFirst ? tags : "",
      isFirst ? "TRUE" : "",
      "Talla",
      size,
      `${p.sku}-${size}`,
      "shopify",
      qty,
      "deny",
      "manual",
      p.price,
      p.compareAt ?? "",
      "TRUE",
      "TRUE",
      isFirst ? "active" : "",
    ]);
  });
}

const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
const out = path.join(root, "shopify-import.csv");
writeFileSync(out, csv, "utf-8");
console.log(`✓ ${rows.length - 1} filas (${rawProducts.length} productos) escritas en ${out}`);
