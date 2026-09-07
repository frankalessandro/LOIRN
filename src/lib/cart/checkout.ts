/**
 * Checkout. Corre en el navegador, por eso no importa el catálogo.
 *
 * · Con Shopify configurado: crea un carrito real con la Cart API y devuelve
 *   su `checkoutUrl` (pasarela, envíos e impuestos los maneja Shopify).
 * · Sin Shopify: arma el pedido por WhatsApp contra el número real del local.
 *   Es el flujo que la tienda usa hoy, no un placeholder muerto.
 */
import { money } from "../shop/money";
import type { CartLine } from "../shop/types";

const DOMAIN = import.meta.env.PUBLIC_SHOPIFY_DOMAIN as string | undefined;
const TOKEN = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN as string | undefined;
const VERSION = (import.meta.env.PUBLIC_SHOPIFY_API_VERSION as string) || "2025-07";

/** WhatsApp del local (Palmira) — mismo número del footer y de /local. */
export const WHATSAPP = "573128752902";

export const checkoutMode: "shopify" | "whatsapp" = DOMAIN && TOKEN ? "shopify" : "whatsapp";

const CART_CREATE = `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { checkoutUrl }
      userErrors { message }
    }
  }
`;

async function shopifyCheckout(lines: CartLine[]): Promise<string> {
  const res = await fetch(`https://${DOMAIN}/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN!,
    },
    body: JSON.stringify({
      query: CART_CREATE,
      variables: {
        lines: lines.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity })),
      },
    }),
  });
  const json = await res.json();
  const url = json?.data?.cartCreate?.cart?.checkoutUrl;
  const err =
    json?.errors?.[0]?.message ?? json?.data?.cartCreate?.userErrors?.[0]?.message;
  if (!url) throw new Error(err || "Shopify no devolvió una URL de checkout.");
  return url as string;
}

export function whatsappOrderUrl(lines: CartLine[]): string {
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const body = [
    "Hola LOIRN, quiero pedir:",
    "",
    ...lines.map(
      (l) => `• ${l.quantity} × ${l.name} — talla ${l.size} — ${money(l.price * l.quantity)}`
    ),
    "",
    `Total: ${money(total)}`,
  ].join("\n");
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body)}`;
}

/** URL a la que mandar al comprador. Lanza si Shopify falla. */
export async function createCheckoutUrl(lines: CartLine[]): Promise<string> {
  if (!lines.length) throw new Error("El carrito está vacío.");
  return checkoutMode === "shopify" ? shopifyCheckout(lines) : whatsappOrderUrl(lines);
}
