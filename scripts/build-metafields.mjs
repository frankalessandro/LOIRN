import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, "src/data/products.ts"), "utf-8");
const start = src.indexOf("export const rawProducts");
const arrStart = src.indexOf("[", start);
const arrEnd = src.lastIndexOf("];") + 1;
const rawProducts = new Function(`"use strict"; return (${src.slice(arrStart, arrEnd)});`)();

// handle -> gid, de la consulta que ya corrimos
const ids = {
  "presence-puffer": "gid://shopify/Product/15880537178398",
  "criterio-bomber": "gid://shopify/Product/15880537211166",
  "vistete-heavy-hoodie": "gid://shopify/Product/15880537243934",
  "actitud-cargo-pant": "gid://shopify/Product/15880537276702",
  "estilo-propio-tee": "gid://shopify/Product/15880537309470",
  "imagen-work-jacket": "gid://shopify/Product/15880537342238",
  "seguridad-knit": "gid://shopify/Product/15880537375006",
  "cultura-urbana-beanie": "gid://shopify/Product/15880537407774",
};

const metafields = [];
for (const p of rawProducts) {
  const ownerId = ids[p.slug];
  if (!ownerId) continue;
  metafields.push({
    ownerId, namespace: "custom", key: "colorway",
    type: "single_line_text_field", value: p.colorway,
  });
  metafields.push({
    ownerId, namespace: "custom", key: "details",
    type: "list.single_line_text_field", value: JSON.stringify(p.details ?? []),
  });
}

writeFileSync(
  path.join(root, "scripts/tmp/metafields.graphql"),
  `mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id key namespace ownerType }
    userErrors { field message }
  }
}`
);
writeFileSync(
  path.join(root, "scripts/tmp/metafields.vars.json"),
  JSON.stringify({ metafields }, null, 2)
);
console.log(`✓ ${metafields.length} metafields listos para ${Object.keys(ids).length} productos`);
