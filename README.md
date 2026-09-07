# LOIRN — storefront

Tienda de LOIRN (Palmira / Cali) en Astro. Sitio 100% estático, sin runtime de
servidor: el catálogo se hornea en build y el carrito vive en el navegador.

## Comandos

| Comando        | Acción                                       |
| :------------- | :------------------------------------------- |
| `pnpm install` | Instala dependencias                          |
| `pnpm dev`     | Servidor local en `localhost:4321`            |
| `pnpm build`   | Compila a `./dist/`                           |
| `pnpm preview` | Previsualiza el build                         |

## Arquitectura de tienda

Todo el comercio pasa por una única fachada, `src/lib/shop`, que elige adaptador
según el entorno. Ninguna página importa un adaptador directamente.

```
src/lib/shop/
  index.ts              fachada: getProducts / getProduct / getFeatured / getFacets
  types.ts              Product · ProductVariant · CartLine (forma Shopify)
  money.ts              formato COP
  shopify-client.ts     cliente GraphQL de la Storefront API
  adapters/local.ts     catálogo de src/data/products.ts   ← activo hoy
  adapters/shopify.ts   Storefront API                     ← listo, inactivo

src/lib/cart/
  store.ts              estado del carrito (localStorage + eventos, multi-pestaña)
  checkout.ts           Cart API de Shopify, o pedido por WhatsApp como respaldo
```

Las variantes locales se generan una por talla con `id` `local:{slug}:{talla}`.
Ese id ocupa el lugar del `merchandiseId` de Shopify, así que el carrito y el
checkout ya trabajan con el modelo definitivo.

### Migrar a Shopify

1. Crear la tienda y subir los productos. Convenciones que espera el adaptador:
   - la opción de talla se llama **Talla** (o `Size`);
   - el drop va como tag `drop:DROP 01 · AW26`;
   - los destacados llevan el tag `featured`;
   - `colorway` y `details` como metafields `custom.colorway` (texto) y
     `custom.details` (lista de texto).
2. Shopify admin → *Settings → Apps and sales channels → Develop apps* → crear
   app → habilitar los scopes de Storefront API
   (`unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`,
   `unauthenticated_read_checkouts`) → instalar → copiar el
   **Storefront API access token**.
3. Copiar `.env.example` a `.env` y rellenar `PUBLIC_SHOPIFY_DOMAIN` y
   `PUBLIC_SHOPIFY_STOREFRONT_TOKEN`.
4. `pnpm build`.

Con esas dos variables presentes el sitio cambia solo: el catálogo sale de la
Storefront API y el botón del carrito pasa de "Pedir por WhatsApp" al checkout
real de Shopify. Sin ellas, sigue corriendo con el catálogo local.

El token de Storefront es público por diseño (solo lee catálogo y crea
carritos), por eso lleva prefijo `PUBLIC_`. **Nunca** poner ahí un token de
Admin API.

## Estado

Hecho: catálogo con filtros (talla, precio, colección, colorway, drop,
disponibilidad) y orden, con estado en la URL; carrito completo con drawer,
cantidades, persistencia y checkout.

Pendiente: página de drops con countdown y estados, wishlist persistente y
buscador real en la barra.
