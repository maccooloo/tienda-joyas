# Dirección visual revisada · 29 octubre 2026

Referencia revisada en navegador: https://twojeys.com/es, escritorio 1440 × 1000 y móvil 390 × 844.

## Observaciones
- Cabecera superpuesta de unos 50 px, aviso negro de 25 px, navegación compacta y marca centrada.
- Vídeo de campaña horizontal 16:9 en escritorio; recorte vertical en móvil. Dos vídeos reproducidos en bucle, sin sonido.
- Titular de campaña de unos 40 px, grueso y cursivo; texto funcional de 11–13 px. La fotografía ocupa casi todo el primer pantallazo.
- Rejilla de producto blanca, cuatro columnas en escritorio y dos en móvil, nombres y precios centrados.
- Fotografías de categorías en dos columnas sin márgenes, con enlaces pequeños superpuestos.
- Panel de navegación lateral blanco que deja visible la campaña.

## Revisión artística solicitada

### Colecciones por épocas

La navegación editorial pasa a capítulos: I Grecia (actual), II Egipto, III Roma y IV Renacimiento (adelantos). Es el orden de lanzamiento de la marca, no una cronología histórica. Una configuración compartida alimenta el inicio, el menú y las páginas `/epocas/[slug]`; se pueden añadir capítulos sin duplicar componentes.

Se mantienen blanco #ffffff, tinta #242824, oro #c9a24f, oro profundo #735a2b y champán #ebddb8. Garamond clásica y dorada. Composición: campaña griega / navegación por capítulos / selección actual / cuatro imágenes por época / relato. El acento distintivo sigue siendo el diálogo entre arte y joyas. Grecia, Egipto y Roma tienen imágenes editoriales imaginadas; Botticelli acompaña Renacimiento. Ingres permanece en el manifiesto y no se clasifica como renacentista. Los capítulos futuros no ofrecen productos ficticios ni fechas de lanzamiento.

### Ajuste de tipografía y dorado

El usuario pide una letra menos moderna y mayor presencia dorada. Títulos en EB Garamond con cursiva de trazo clásico en la campaña y el manifiesto; nombres de piezas y menús en su variante romana. GFS Didot se mantiene en el wordmark, Inter en precios y formularios. Blanco #ffffff para catálogo, tinta #242824, oro #c9a24f para botones y filetes, oro profundo #735a2b para texto sobre blanco, oro claro #e3c77f y champán #ebddb8 sobre pintura oscurecida.

Se conserva la composición: navegación / cuadro / catálogo / retratos / relato. La cursiva se reserva a titulares editoriales completos; los controles deben seguir siendo fáciles de leer. El dorado se aplica a marca, títulos, enlaces y acciones principales, sin añadir ornamentos ni fondos dorados grandes. Esta revisión sustituye los acentos verdes de la primera versión artística.

Mantener la estructura de la referencia y hacer la expresión más delicada: blanco #ffffff, tinta #242824, línea #deded8, verde pintura #424d43, rosa antiguo #bd8e83. Inter pequeña y normal para navegación y fichas; GFS Didot para dos titulares editoriales. Cuadros reinterpretados con las piezas reales del catálogo de demostración; ningún producto inventado ni promesas sobre materiales. El gesto distintivo está en las pinturas, no en adornos de interfaz.

```text
nav pequeña / marca / carrito
cuadro en movimiento lento, título breve a la izquierda
joya aislada   joya aislada   joya aislada   joya aislada
retrato + colección           retrato + colección
invitación al manifiesto / ayuda
```

Revisión crítica: el denim y los titulares gruesos se acercaban a streetwear pero no a la idea artística del usuario. Se reemplazan por retratos con joyas, fundidos lentos y tipografía más ligera. Catálogo sobre blanco sin decorado. Menús de escritorio al pasar el cursor, móvil al tocar. Recomendaciones del carrito automáticas con pausa y variantes reales. El vídeo es un montaje animado de imágenes reinterpretadas, no una filmación histórica.

## Primera aplicación (sustituida por la revisión anterior)
Paleta: blanco #ffffff, negro #000000, superficie #f5f5f5, gris #666666, línea #dedede. Inter para la interfaz y campaña; wordmark propio en GFS Didot. Márgenes de 12–16 px; encabezados de sección pequeños. Mantener nombre, catálogo, precios y carrito.

```text
aviso / navegación compacta con marca centrada
vídeo a sangre + título corto + enlace
título de selección / ver todo
producto  producto  producto  producto
producto  producto  producto  producto
foto colección        foto colección
texto de marca / ayuda / pie
```

Se sustituye la portada de paisaje y la composición de titulares grandes por la estructura de campaña observada. Se eliminan las cintas decorativas, el carrusel añadido y la repetición del paisaje. El movimiento principal procede de vídeo real, con pausa visible y alternativa estática para movimiento reducido o ahorro de datos.

Los antiguos recursos de stock se han retirado. Las imágenes y vídeos artísticos actuales se documentan en `editorial-assets.json`; los prompts están en `art-generation.json`. Los recortes de producto y los nombres españoles se aplican únicamente a la tienda de demostración. Los identificadores, variantes, precios y existencias siguen viniendo de Shopify.

## Verificación final

`npm run lint` y `npm run build` correctos. Edge headless a 1440×1000, 390×844 y 320×640: apertura por hover y clic, Escape y devolución del foco, navegación táctil, vídeo con pausa y respeto de movimiento reducido. Flujo contra Mock Shop: añadir producto, rotación automática y pausa por interacción, seleccionar variante recomendada, añadirla, excluirla de las sugerencias, recargar y conservar carrito, modificar cantidad y eliminar. Sin errores de navegador. Las capturas locales de revisión están en `out/design-review/final-*.png` (directorio ignorado por Git). No se ha realizado ningún pago ni despliegue.
