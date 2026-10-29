# Criseida

## Marca

- El nombre de marca es Criseida; el wordmark oficial es `CRISEIDA`, en alfabeto latino. No uses letras griegas en la marca.
- El lema principal es "Donde el tiempo se vuelve luz.". El subtitulo oficial es "Joyas inspiradas en los mitos y las civilizaciones que nos precedieron. Diseñadas en España.".
- Lee `docs/brand.md` antes de cualquier decision de marca, diseño o redaccion. Es la fuente de verdad.
- Lee nombre, wordmark, lema, subtitulo y URL desde `src/config/brand.ts`; no escribas el nombre o los lemas a mano en componentes.
- La guia de marca v0.3 sustituye a cualquier guia anterior. No afirmes que la marca, el dominio, los materiales ni las propiedades del producto estan verificados si el documento los deja pendientes.

## Proyecto

- Next.js App Router, TypeScript, Tailwind CSS y Shopify Storefront API; no hay backend propio.
- Conserva Server Components por defecto. No cambies integraciones Shopify, Server Actions, rutas ni logica de datos durante tareas limitadas a presentacion.
- Los secretos solo viven en `.env.local`; nunca los expongas al cliente ni los incluyas en el repositorio.
- Mantén la interfaz en español de España, accesible WCAG AA y preparada para movimiento reducido.
- Haz cambios pequenos y valida con `npm run lint` y `npm run build`.