/**
 * Cliente mínimo de la Storefront API de Shopify.
 *
 * El token de Storefront es público por diseño (se expone en el navegador y
 * solo lee catálogo / gestiona carritos), por eso lleva prefijo PUBLIC_.
 * NUNCA usar aquí un Admin API token.
 */
const DOMAIN = import.meta.env.PUBLIC_SHOPIFY_DOMAIN as string | undefined;
const TOKEN = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN as string | undefined;
const VERSION = (import.meta.env.PUBLIC_SHOPIFY_API_VERSION as string) || "2025-07";

/** true cuando hay credenciales: decide qué adaptador se usa. */
export const shopifyEnabled = Boolean(DOMAIN && TOKEN);

export const shopifyEndpoint = () =>
  `https://${DOMAIN}/api/${VERSION}/graphql.json`;

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  if (!shopifyEnabled) {
    throw new Error(
      "Shopify no está configurado: falta PUBLIC_SHOPIFY_DOMAIN o PUBLIC_SHOPIFY_STOREFRONT_TOKEN."
    );
  }
  const res = await fetch(shopifyEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Storefront API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`Storefront API: ${json.errors.map((e) => e.message).join(" · ")}`);
  }
  return json.data as T;
}
