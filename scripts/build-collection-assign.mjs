import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const tmp = path.join(root, "scripts/tmp");

const allProducts = JSON.parse(readFileSync(path.join(tmp, "all-products.json"), "utf-8"))
  .products.nodes;
const byTitle = Object.fromEntries(allProducts.map((p) => [p.title, p.id]));

const mapping = JSON.parse(readFileSync(path.join(tmp, "product-collections.json"), "utf-8"));
const collections = JSON.parse(readFileSync(path.join(tmp, "collections.json"), "utf-8"));

const collectionIds = {
  Gorras: "gid://shopify/Collection/716255559966",
  Camisas: "gid://shopify/Collection/716255592734",
  "Camisas Oversize": "gid://shopify/Collection/716255625502",
  Pantalonetas: "gid://shopify/Collection/716255658270",
  Sudaderas: "gid://shopify/Collection/716255691038",
  Jhos: "gid://shopify/Collection/716255723806",
  Bermudas: "gid://shopify/Collection/716255756574",
  Pantalones: "gid://shopify/Collection/716255789342",
  Bolsos: "gid://shopify/Collection/716255822110",
};

const byCollection = {};
for (const { title, collection } of mapping) {
  const id = byTitle[title];
  if (!id) { console.error(`✗ sin id: ${title}`); continue; }
  (byCollection[collection] ??= []).push(id);
}
// Gorra Clásica no está en mapping.json (fue el test manual) — la agrego a mano.
byCollection["Gorras"].push(byTitle["Gorra Clásica"]);

const fields = Object.entries(byCollection)
  .map(([col, ids], i) => `c${i}: collectionAddProducts(id: "${collectionIds[col]}", productIds: [${ids.map((id) => `"${id}"`).join(", ")}]) {
    userErrors { field message }
  }`)
  .join("\n  ");

writeFileSync(path.join(tmp, "assign.graphql"), `mutation {\n  ${fields}\n}`);
console.log(`✓ asignación lista para ${Object.keys(byCollection).length} colecciones`);
