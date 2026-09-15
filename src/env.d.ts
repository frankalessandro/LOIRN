/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Dominio de la tienda Shopify, ej: "loirn.myshopify.com".
   * Solo presente con Shopify activo. Sin valor → adaptador local + WhatsApp.
   */
  readonly PUBLIC_SHOPIFY_DOMAIN: string | undefined;

  /**
   * Token de Storefront API (solo lectura de catálogo + gestión de carritos).
   * ES PÚBLICO por diseño — prefijo PUBLIC_ obligatorio.
   * NUNCA usar un Admin API token aquí.
   */
  readonly PUBLIC_SHOPIFY_STOREFRONT_TOKEN: string | undefined;

  /**
   * Versión de la Storefront API. Por defecto "2025-07".
   * @default "2025-07"
   */
  readonly PUBLIC_SHOPIFY_API_VERSION: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
