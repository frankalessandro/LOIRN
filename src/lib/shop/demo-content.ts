/**
 * Texto demo mientras el catálogo de Shopify no tenga contenido cargado.
 *
 * Hoy las 31 prendas reales de Shopify solo tienen título y precio —
 * descripción, detalles, colorway y drop llegan vacíos de la Storefront
 * API. Este módulo rellena esos campos con copy de marca (voz LOIRN) para
 * poder ver cómo se ve una ficha de producto completa: párrafo largo,
 * bullets de detalle, colorway, drop.
 *
 * Por campo, no por producto: en cuanto alguien cargue una descripción, un
 * metafield `details` o un tag `drop:` en Shopify para una prenda puntual,
 * ese campo deja de rellenarse aquí — el resto sigue con placeholder hasta
 * que también se cargue. Nada de esto toca Shopify ni escribe nada.
 */
import type { Product } from "./types";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Selección determinista (mismo producto = mismo texto en cada build). */
function hashPick<T>(seed: string, pool: T[]): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

/** Color mencionado en el título ("Bolso Metálico Red" → "Rojo"). Gana sobre el colorway por defecto de la categoría. */
const COLOR_WORDS: [RegExp, string][] = [
  [/\bblack\b|\bnegr[oa]\b/, "Negro"],
  [/\bwhite\b|\bblanc[oa]\b/, "Blanco"],
  [/\bred\b|\brojo?\b/, "Rojo"],
  [/\bblue\b|\bazul\b/, "Azul"],
  [/\bgold\b|\bdorad[oa]\b/, "Dorado"],
  [/\bsilver\b|\bplateado\b|\bmetalic[oa]\b/, "Plateado"],
  [/\bdenim\b/, "Denim"],
  [/\bcafe\b|\bbrown\b/, "Café"],
  [/\bgris\b|\bgrey\b|\bgray\b/, "Gris"],
];
function colorFromTitle(name: string): string | undefined {
  const n = norm(name);
  for (const [re, color] of COLOR_WORDS) if (re.test(n)) return color;
  return undefined;
}

interface CategoryCopy {
  /** Plantillas de descripción — "{n}" se reemplaza por el nombre de la prenda. */
  desc: string[];
  details: string[];
  colorway: string;
}

/**
 * Voz LOIRN (manual de marca): seguro, con criterio, cercano; urbano,
 * claro, aspiracional sin perder humanidad. Directo, no genérico.
 * "Vístete con presencia" — la ropa comunica antes que hables.
 */
const LIB: Record<string, CategoryCopy> = {
  gorras: {
    desc: [
      "{n} no es un accesorio de relleno: es lo primero que se ve y lo último que se olvida. Copa estructurada, visera plana sin curvar y ajuste ceñido — la llevas puesta como quien no necesita decir nada más.",
      "Diseñada para completar el look, no para acompañarlo en silencio. {n} tiene la actitud de las gorras que se llevan puestas todo el día, del trabajo a la calle, sin perder la forma ni la presencia.",
      "{n} se construye sobre una base de seis paneles y costura reforzada en la copa, pensada para aguantar uso real — no solo la foto del primer día. El remate frontal es la firma; el resto es carácter.",
    ],
    details: [
      "Copa de seis paneles con entretela rígida — no se deforma con el uso",
      "Visera plana pre-curvada, lista para llevar recta o con quiebre propio",
      "Cierre trasero ajustable — un solo talle, calce real",
      "Bordado/estampado de alta densidad, resistente a lavado en frío",
      "Ojales metálicos para ventilación bajo sol fuerte",
      "Etiqueta interior LOIRN — pieza numerada de la colección",
    ],
    colorway: "Negro",
  },
  camisas: {
    desc: [
      "{n} se mueve entre lo deportivo y la calle sin pedir permiso. Corte recto, tela que respira y un gráfico que no se desgasta a las primeras lavadas — hecha para rotar en el clóset, no para guardarse.",
      "Referencia directa a las camisetas de equipo que marcaron una época, reinterpretada por LOIRN para el día a día: {n} tiene el peso y la caída justa para llevar sola o como capa base.",
      "{n} prioriza la tela sobre el ruido visual. Malla técnica ligera, costuras planas que no rozan y un fit que no se pega ni sobra — la base perfecta del sistema LOIRN.",
    ],
    details: [
      "Malla técnica 100% poliéster transpirable",
      "Costuras planas — sin roce en hombros ni axilas",
      "Cuello redondo con cinta interior que no se estira",
      "Estampado por sublimación — no se agrieta ni descascara",
      "Corte recto clásico, cae igual seco que después de lavar",
      "Hecha y confeccionada en Colombia",
    ],
    colorway: "Multicolor",
  },
  "camisas oversize": {
    desc: [
      "{n} es la base del sistema LOIRN: caída amplia, hombro caído a propósito y un algodón con cuerpo que no se transparenta ni se deforma. Se lleva sola, en capas, o como statement — nunca pasa desapercibida.",
      "Oversize no significa sin forma. {n} tiene una silueta pensada: ancho controlado, largo modular que cae recto sobre el cinturón, cuello reforzado que no se estira con el tiempo. Presencia sin esfuerzo.",
      "{n} nace de una idea simple: la prenda básica también comunica. Algodón peinado de gramaje alto, tacto mate, corte boxy — la pieza que sostiene cualquier fit del sistema LOIRN.",
    ],
    details: [
      "Algodón peinado de gramaje alto — cae con peso, no se transparenta",
      "Corte oversize con hombro caído intencional",
      "Cuello acanalado reforzado, no pierde forma con los lavados",
      "Costuras dobles en zonas de tensión (sisas y dobladillo)",
      "Preencogido de fábrica — mínima deformación en el primer lavado",
      "Etiqueta tejida LOIRN en dobladillo lateral",
    ],
    colorway: "Negro",
  },
  pantalonetas: {
    desc: [
      "{n} está pensada para moverse: pretina elástica con cordón ajustable, tela ligera que no marca y un largo que funciona tanto en la calle como en la cancha. Comodidad sin renunciar a la línea del sistema LOIRN.",
      "Nada de básico aburrido. {n} tiene bolsillos funcionales, caída recta sin embolsarse en la rodilla y un tejido que seca rápido — para los días donde la ropa no puede ser el problema.",
    ],
    details: [
      "Tejido ligero de secado rápido",
      "Pretina elástica con cordón interno ajustable",
      "Bolsillos laterales funcionales, sin abultar",
      "Costuras reforzadas en la entrepierna",
      "Largo por encima de la rodilla — corte urbano, no deportivo puro",
    ],
    colorway: "Negro",
  },
  sudaderas: {
    desc: [
      "{n} es peso, no volumen vacío. French terry grueso, capucha con forro doble y bolsillo canguro reforzado — la prenda que se pone primero cuando baja la temperatura y no se quita en todo el día.",
      "Construida para las mañanas frías de Palmira y las noches de Cali. {n} tiene cordón plano con herrajes mate, puños acanalados que no se sueltan y un gramaje que se siente apenas te la pones.",
    ],
    details: [
      "French terry de gramaje alto, 100% algodón peinado",
      "Capucha de doble capa con cordón plano y herrajes mate",
      "Bolsillo canguro con costura reforzada",
      "Puños y cintura en canalé — retienen la forma con el uso",
      "Preencogida — mínima deformación tras el lavado",
      "Diseñada en Palmira, Valle del Cauca",
    ],
    colorway: "Gris ceniza",
  },
  jhos: {
    desc: [
      "{n} — jogger de corte urbano con puño ajustado y bolsillos utilitarios. La pieza que conecta la parte de arriba con los tenis sin que se note el esfuerzo: entra fácil en cualquier fit del sistema LOIRN.",
      "Estructura sin rigidez. {n} tiene tiro cómodo, pierna cónica que no se ve entallada y un tejido con el punto justo de elasticidad para moverte todo el día sin pensarlo.",
    ],
    details: [
      "Twill de algodón con elastano — movimiento real sin perder forma",
      "Puño elástico en el tobillo, ajuste limpio",
      "Bolsillos laterales profundos + bolsillo trasero con solapa",
      "Pretina interior con cordón ajustable",
      "Costuras reforzadas en zonas de mayor tensión",
    ],
    colorway: "Negro",
  },
  bermudas: {
    desc: [
      "{n} lleva la línea del pantalón cargo a un largo de calle: bolsillos volumétricos, caída recta y una pretina que no se enrolla. Entre la comodidad del short y la presencia de un pantalón.",
      "{n} está hecha para el clima del Valle del Cauca — tela que no pesa, corte que no aprieta, y el mismo criterio de construcción que el resto del sistema LOIRN: nada sobra, nada falta.",
    ],
    details: [
      "Twill de algodón con un toque de elastano",
      "Bolsillos utilitarios laterales + traseros con cierre",
      "Pretina interior antideslizante",
      "Dobladillo recto con refuerzo — no se deshilacha",
      "Largo justo sobre la rodilla",
    ],
    colorway: "Negro",
  },
  pantalones: {
    desc: [
      "{n} — pierna recta, caída limpia y la estructura justa para no perder la línea en todo el día. Diseñado para combinar con cualquier capa de arriba del sistema LOIRN sin competir por atención.",
      "{n} tiene el equilibrio que buscas: ni tan ajustado que incomode, ni tan ancho que pierda forma. Twill resistente, pretina cómoda, bolsillos donde realmente los usas.",
    ],
    details: [
      "Twill de algodón 320 gsm con un margen de elastano",
      "Pierna recta — corte que no se deforma con el uso diario",
      "Bolsillos delanteros de corte diagonal + traseros funcionales",
      "Pretina interior antideslizante",
      "Dobladillo reforzado con doble pespunte",
    ],
    colorway: "Negro",
  },
  bolsos: {
    desc: [
      "{n} resuelve lo que un bolsillo no puede: espacio real, cierre seguro y una estructura que no se deforma con el peso del día. Diseñado para llevarse cruzado o al hombro sin perder la línea del outfit.",
      "Minimalista por decisión, no por falta de detalle. {n} tiene compartimentos pensados para lo esencial — llaves, cargador, billetera — con acabados que envejecen bien, no que se ven gastados a la semana.",
    ],
    details: [
      "Compartimento principal + bolsillo interior con cierre",
      "Correa ajustable — cruzada u hombro",
      "Herrajes metálicos anti-óxido",
      "Base reforzada — mantiene la forma con el uso diario",
      "Costuras dobles en puntos de mayor tensión",
    ],
    colorway: "Negro",
  },
};

const withName = (tpl: string, name: string) => tpl.replace(/\{n\}/g, name);

/** true si el string vino vacío de Shopify (null/"" ya se normalizan a "" en el adapter). */
const isBlank = (s: string | null | undefined) => !s || !s.trim();

export function withDemoContent(products: Product[]): Product[] {
  return products.map((p) => {
    const lib = LIB[norm(p.collection)];
    if (!lib) return p;

    const description = isBlank(p.description)
      ? withName(hashPick(p.slug + ":desc", lib.desc), p.name)
      : p.description;
    const details = p.details.length ? p.details : lib.details;
    const colorway = isBlank(p.colorway) ? colorFromTitle(p.name) ?? lib.colorway : p.colorway;
    // Un solo drop activo hoy — en cuanto una prenda traiga el tag `drop:` real de Shopify, gana ese.
    const drop = isBlank(p.drop) ? "DROP 01 · AW26" : p.drop;

    if (
      description === p.description &&
      details === p.details &&
      colorway === p.colorway &&
      drop === p.drop
    ) {
      return p;
    }
    return { ...p, description, details, colorway, drop };
  });
}
