## Desarrollo local

Requisitos: Node.js 22 o 24 y npm.

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Sin variables de Shopify, la tienda usa `jewelry-dropship.mock.shop` y no necesita credenciales.

## Conectar una tienda Shopify

1. En el admin instala el canal Headless y crea un storefront.
2. Habilita los permisos de lectura de productos, colecciones y medios, y los permisos de carrito.
3. Copia `.env.example` a `.env.local` y completa:

```dotenv
SHOPIFY_STORE_DOMAIN=mi-tienda.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=token-privado-del-storefront
SHOPIFY_API_VERSION=2026-10
SITE_URL=https://www.ejemplo.es
```

El token privado se usa solo desde el servidor. No uses el prefijo `NEXT_PUBLIC_` ni compartas `.env.local`; este archivo está excluido por Git. Si faltan el dominio o el token privado, la app vuelve a la tienda demo. La versión de API indicada es la estable más reciente consultada en la documentación de Shopify; revisa su calendario trimestral antes de un despliegue futuro.

`mock.shop` sirve precios, inventario y productos ficticios. Su checkout es una simulación: no cobra, no envía productos ni crea pedidos. La moneda del catálogo demo es USD; la tienda muestra la moneda que devuelve Shopify y no convierte precios manualmente.

## Comprobaciones

```bash
npm run lint
npm run build
```

## Fuentes oficiales

- [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning)
- [Storefront API](https://shopify.dev/docs/api/storefront)
- [mock.shop](https://shopify.dev/docs/storefronts/headless/mock-shop)
