/**
 * Genera los mutations productSet para el inventario real de LOIRN,
 * agrupando tallas de la planilla en productos con variantes.
 *
 * Precios corregidos por decisión del usuario: talla 28 de "Pantalón
 * Sencillo" (cód. 714, decía $1) y talla L de "Camisa Básica Oversize"
 * (cód. 479, decía $600.000) se igualan al resto de tallas del mismo
 * producto. Nunca se sube costo/margen — son datos internos.
 *
 * Uso: node scripts/build-real-catalog.mjs
 * Salida: scripts/tmp/batch-N.graphql + batch-N.vars.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tmp = path.join(root, "scripts/tmp");
mkdirSync(tmp, { recursive: true });

const LOCATION = "gid://shopify/Location/125153345822";

/** talla+sku+stock por variante; price a nivel de producto salvo excepción. */
const products = [
  // ---- Gorras (una talla) ----
  { title: "Gorra Bandy Hast", collection: "Gorras", price: 120000, sku: "201", stock: 1 },
  { title: "Gorra Supreme", collection: "Gorras", price: 60000, sku: "202", stock: 3 },
  { title: "Gorra Triple Bordado", collection: "Gorras", price: 80000, sku: "203", stock: 2 },
  { title: "Gorra Multibordada", collection: "Gorras", price: 65000, sku: "205", stock: 5 },
  { title: "Gorra Semibordada", collection: "Gorras", price: 55000, sku: "206", stock: 1 },
  { title: "Gorra Ajustable", collection: "Gorras", price: 45000, sku: "207", stock: 13 },
  { title: "Gorra Supreme Ajustable", collection: "Gorras", price: 50000, sku: "208", stock: 0 },

  // ---- Camisas sin talla ----
  { title: "Camisa Deportiva Retro", collection: "Camisas", price: 150000, sku: "301", stock: 9 },
  { title: "Camisa Deportiva Calidad 1.1", collection: "Camisas", price: 120000, sku: "302", stock: 6 },

  // ---- Camisas con talla ----
  {
    title: "Camisa Diseño Exclusivo", collection: "Camisas", price: 140000,
    sizes: [{ size: "M", sku: "410", stock: 1 }, { size: "L", sku: "411", stock: 0 }, { size: "XL", sku: "412", stock: 1 }],
  },
  {
    title: "Camisa Diseño en Brillo", collection: "Camisas", price: 120000,
    sizes: [{ size: "M", sku: "420", stock: 2 }, { size: "L", sku: "421", stock: 1 }],
  },
  {
    title: "Camisa Sencilla", collection: "Camisas", price: 90000,
    sizes: [{ size: "S", sku: "433", stock: 1 }, { size: "M", sku: "430", stock: 1 }, { size: "L", sku: "431", stock: 1 }],
  },
  {
    title: "Camisa Camitp", collection: "Camisas", price: 120000,
    sizes: [{ size: "S", sku: "443", stock: 0 }, { size: "M", sku: "440", stock: 0 }, { size: "XL", sku: "442", stock: 1 }],
  },

  // ---- Camisas oversize ----
  {
    title: "Camisa Oversize Algodón 260g", collection: "Camisas Oversize", price: 65000,
    sizes: [{ size: "M", sku: "450", stock: 6 }, { size: "L", sku: "451", stock: 4 }, { size: "XL", sku: "452", stock: 0 }],
  },
  {
    title: "Camisa Oversize Algodón 260g Brillo", collection: "Camisas Oversize", price: 80000,
    sizes: [{ size: "S", sku: "463", stock: 1 }, { size: "M", sku: "460", stock: 2 }, { size: "L", sku: "461", stock: 0 }],
  },
  {
    title: "Camisa Oversize Algodón 380g", collection: "Camisas Oversize", price: 90000,
    sizes: [{ size: "M", sku: "470", stock: 0 }, { size: "L", sku: "471", stock: 0 }, { size: "XL", sku: "472", stock: 1 }],
  },
  {
    title: "Camisa Básica Boxy Fit", collection: "Camisas Oversize", price: 60000,
    sizes: [{ size: "S", sku: "473", stock: 0 }, { size: "M", sku: "474", stock: 1 }, { size: "L", sku: "475", stock: 2 }, { size: "XL", sku: "476", stock: 1 }],
  },
  {
    // cód. 479 (L) decía $600.000 en la planilla — corregido a $60.000 (resto de tallas) por decisión del usuario.
    title: "Camisa Básica Oversize", collection: "Camisas Oversize", price: 60000,
    sizes: [{ size: "S", sku: "477", stock: 0 }, { size: "M", sku: "478", stock: 3 }, { size: "L", sku: "479", stock: 4 }, { size: "XL", sku: "480", stock: 1 }],
  },
  {
    title: "Camisa Básica Slim", collection: "Camisas Oversize", price: 60000,
    sizes: [{ size: "S", sku: "481", stock: 1 }, { size: "M", sku: "482", stock: 3 }, { size: "L", sku: "483", stock: 4 }, { size: "XL", sku: "484", stock: 0 }],
  },

  // ---- Pantalonetas / Sudaderas ----
  {
    title: "Pantaloneta", collection: "Pantalonetas", price: 110000,
    sizes: [{ size: "S", sku: "513", stock: 1 }, { size: "L", sku: "511", stock: 1 }, { size: "XL", sku: "512", stock: 2 }],
  },
  {
    title: "Sudadera", collection: "Sudaderas", price: 150000,
    sizes: [{ size: "XL", sku: "522", stock: 1 }],
  },

  // ---- Jhos / Bermudas ----
  {
    title: "Jhos", collection: "Jhos", price: 130000,
    sizes: [
      { size: "28", sku: "614", stock: 1 }, { size: "30", sku: "610", stock: 3 },
      { size: "32", sku: "611", stock: 3 }, { size: "34", sku: "612", stock: 3 },
      { size: "36", sku: "613", stock: 3 },
    ],
  },
  {
    title: "Bermudas", collection: "Bermudas", price: 150000,
    sizes: [{ size: "34", sku: "622", stock: 1 }, { size: "36", sku: "623", stock: 2 }],
  },

  // ---- Pantalones ----
  {
    // cód. 714 (talla 28) decía $1 en la planilla — corregido a $140.000 (resto de tallas).
    title: "Pantalón Sencillo", collection: "Pantalones", price: 140000,
    sizes: [
      { size: "28", sku: "714", stock: 0 }, { size: "30", sku: "710", stock: 1 },
      { size: "32", sku: "711", stock: 3 }, { size: "34", sku: "712", stock: 2 },
      { size: "36", sku: "713", stock: 1 },
    ],
  },
  {
    title: "Pantalón Style", collection: "Pantalones", price: 150000,
    sizes: [
      { size: "28", sku: "724", stock: 0 }, { size: "30", sku: "720", stock: 2 },
      { size: "32", sku: "721", stock: 4 }, { size: "34", sku: "722", stock: 2 },
      { size: "36", sku: "723", stock: 1 },
    ],
  },

  // ---- Bolsos (colorway derivado del nombre) ----
  { title: "Bolso Cuero Modero Black", collection: "Bolsos", price: 60000, sku: "810", stock: 2, colorway: "Negro" },
  { title: "Bolso Cuero Modero White", collection: "Bolsos", price: 60000, sku: "811", stock: 2, colorway: "Blanco" },
  { title: "Bolso Metálico Black/White", collection: "Bolsos", price: 50000, sku: "812", stock: 4, colorway: "Negro / Blanco" },
  { title: "Bolso Metálico Red", collection: "Bolsos", price: 55000, sku: "813", stock: 1, colorway: "Rojo" },
  { title: "Bolso Cuadrado", collection: "Bolsos", price: 80000, sku: "814", stock: 1 },
];

function toInput(p) {
  const sizes = p.sizes ?? [{ size: "Única", sku: p.sku, stock: p.stock }];
  return {
    title: p.title,
    vendor: "LOIRN",
    status: "ACTIVE",
    productOptions: [{ name: "Talla", values: sizes.map((s) => ({ name: s.size })) }],
    variants: sizes.map((s) => ({
      optionValues: [{ optionName: "Talla", name: s.size }],
      price: String(p.price),
      sku: s.sku,
      inventoryPolicy: "DENY",
      inventoryQuantities: [{ locationId: LOCATION, name: "available", quantity: s.stock }],
    })),
  };
}

const BATCH = 6;
for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH);
  const n = i / BATCH + 1;
  const fields = batch
    .map((_, j) => `p${j}: productSet(input: $p${j}, synchronous: true) {
    product { id title handle }
    userErrors { field message }
  }`)
    .join("\n  ");
  const query = `mutation Batch(${batch.map((_, j) => `$p${j}: ProductSetInput!`).join(", ")}) {\n  ${fields}\n}`;
  const vars = Object.fromEntries(batch.map((p, j) => [`p${j}`, toInput(p)]));

  writeFileSync(path.join(tmp, `batch-${n}.graphql`), query);
  writeFileSync(path.join(tmp, `batch-${n}.vars.json`), JSON.stringify(vars, null, 2));
  writeFileSync(path.join(tmp, `batch-${n}.titles.json`), JSON.stringify(batch.map((p) => p.title)));
}

// Colecciones únicas + qué producto (por índice global) va en cuál.
const collections = [...new Set(products.map((p) => p.collection))];
writeFileSync(path.join(tmp, "collections.json"), JSON.stringify(collections, null, 2));
writeFileSync(
  path.join(tmp, "product-collections.json"),
  JSON.stringify(products.map((p) => ({ title: p.title, collection: p.collection, colorway: p.colorway ?? null })), null, 2)
);

console.log(`✓ ${products.length} productos en ${Math.ceil(products.length / BATCH)} lotes · ${collections.length} colecciones`);
