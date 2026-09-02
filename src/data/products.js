/**
 * Catálogo demo LOIRN.
 * Las imágenes son placeholders editoriales monocromos generados en
 * /public/shots (ver scripts). Respetan la dirección de arte del manual:
 * fondos limpios, contraste marcado, B/N. Sustituir por fotografía real.
 */

const shot = (slug, angle) => `/shots/${slug}-${angle}.svg`;

/** @typedef {typeof products[number]} Product */
export const products = [
  {
    slug: "presence-puffer",
    name: "Presence Hooded Puffer",
    collection: "LOIRN Core",
    price: 389000,
    compareAt: 489000,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorway: "Carbón / Off-Black",
    sku: "LRN-AW26-PUF-01",
    drop: "DROP 01 · AW26",
    featured: true,
    description:
      "Silueta acolchada de volumen medio con capucha estructurada. Presencia inmediata: hombros marcados, caída recta y acabado mate que absorbe la luz.",
    details: [
      "Shell 100% nylon ripstop con repelente al agua",
      "Relleno sintético térmico 250g",
      "Costuras selladas · cierre de dos vías",
      "Etiqueta tejida LOIRN en dobladillo",
      "Diseñado y confeccionado en Palmira, Colombia",
    ],
  },
  {
    slug: "criterio-bomber",
    name: "Criterio Bomber Jacket",
    collection: "LOIRN Studio",
    price: 329000,
    compareAt: null,
    sizes: ["S", "M", "L", "XL"],
    colorway: "Negro humo",
    sku: "LRN-AW26-BMB-04",
    drop: "DROP 01 · AW26",
    featured: true,
    description:
      "Bomber de peso completo con cuello alto y puños acanalados. Pensada para capas: entra sobre hoodie sin perder la línea del hombro.",
    details: [
      "Cuerpo en sarga de algodón encerado",
      "Forro acolchado tipo panal",
      "Bolsillos internos ocultos",
      "Ribs reforzados en cuello, puños y cintura",
    ],
  },
  {
    slug: "vistete-heavy-hoodie",
    name: "Vístete Heavy Hoodie",
    collection: "LOIRN Core",
    price: 219000,
    compareAt: 279000,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colorway: "Gris ceniza",
    sku: "LRN-AW26-HOD-02",
    drop: "DROP 01 · AW26",
    featured: true,
    description:
      "Hoodie de 480 gsm con caída oversize y capucha doble. Estampado dorsal 'VÍSTETE CON PRESENCIA' en descarga tono sobre tono.",
    details: [
      "French terry 480 gsm · 100% algodón peinado",
      "Corte oversize · hombros caídos",
      "Cordón plano con herrajes mate",
      "Preencogido · mínima deformación",
    ],
  },
  {
    slug: "actitud-cargo-pant",
    name: "Actitud Cargo Pant",
    collection: "LOIRN Studio",
    price: 249000,
    compareAt: null,
    sizes: ["28", "30", "32", "34", "36"],
    colorway: "Negro",
    sku: "LRN-AW26-CRG-03",
    drop: "DROP 01 · AW26",
    featured: true,
    description:
      "Cargo de pierna recta con bolsillos utilitarios volumétricos y bastilla ajustable. Estructura sin rigidez.",
    details: [
      "Twill de algodón 320 gsm con elastano 2%",
      "6 bolsillos · fuelles laterales",
      "Pretina interior antideslizante",
      "Dobladillo con cordón de traba",
    ],
  },
  {
    slug: "estilo-propio-tee",
    name: "Estilo Propio Boxy Tee",
    collection: "LOIRN Core",
    price: 99000,
    compareAt: 129000,
    sizes: ["S", "M", "L", "XL"],
    colorway: "Blanco hueso",
    sku: "LRN-AW26-TEE-07",
    drop: "DROP 01 · AW26",
    featured: false,
    description:
      "Camiseta boxy de cuello reforzado. Base perfecta del sistema: cae plana, no se enrolla, aguanta lavados.",
    details: [
      "Jersey 240 gsm · 100% algodón",
      "Cuello acanalado 2x2 reforzado",
      "Corte boxy · largo modular",
    ],
  },
  {
    slug: "imagen-work-jacket",
    name: "Imagen Work Jacket",
    collection: "LOIRN Studio",
    price: 299000,
    compareAt: null,
    sizes: ["S", "M", "L", "XL"],
    colorway: "Acero",
    sku: "LRN-AW26-WRK-05",
    drop: "DROP 01 · AW26",
    featured: false,
    description:
      "Chore jacket de inspiración utilitaria con tres bolsillos frontales y botonadura metálica mate.",
    details: [
      "Lona de algodón 340 gsm",
      "Triple pespunte en zonas de carga",
      "Botones anti-óxido grabados LOIRN",
    ],
  },
  {
    slug: "seguridad-knit",
    name: "Seguridad Ribbed Knit",
    collection: "LOIRN Core",
    price: 229000,
    compareAt: 289000,
    sizes: ["S", "M", "L", "XL"],
    colorway: "Grafito",
    sku: "LRN-AW26-KNT-06",
    drop: "DROP 01 · AW26",
    featured: false,
    description:
      "Suéter de canalé pesado con cuello subido. Textura que aporta cuerpo bajo chaquetas sin sumar volumen.",
    details: [
      "50% lana merino · 50% acrílico",
      "Galga 7 · canalé completo",
      "Puños y cuello con retención de forma",
    ],
  },
  {
    slug: "cultura-urbana-beanie",
    name: "Cultura Urbana Beanie",
    collection: "LOIRN Core",
    price: 69000,
    compareAt: null,
    sizes: ["Única"],
    colorway: "Negro",
    sku: "LRN-AW26-BNE-09",
    drop: "DROP 01 · AW26",
    featured: false,
    description:
      "Gorro de doblez ajustado con etiqueta tejida frontal. Remate limpio para cualquier look del sistema.",
    details: ["100% acrílico suave", "Tejido fino · doblez estructurado", "Etiqueta LOIRN tejida"],
  },
].map((p, i) => ({
  ...p,
  discountLabel:
    p.compareAt ? `-${Math.round((1 - p.price / p.compareAt) * 100)}%` : null,
  images: [shot(p.slug, "a"), shot(p.slug, "b"), shot(p.slug, "c")],
}));

export const money = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export const getProduct = (slug) => products.find((p) => p.slug === slug);
