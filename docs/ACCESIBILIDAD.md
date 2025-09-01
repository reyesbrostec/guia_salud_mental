# Registro de Accesibilidad – Guía de Salud Mental

Fecha: 2025-09-01
Ámbito: Sitio estático (index/inclusion) – Preview y Producción

## Resumen
Se implementó un conjunto de mejoras de accesibilidad orientadas a soporte visual, auditivo, motriz y cognitivo, alineadas con WCAG 2.1 AA, con un panel de ajustes activables por el usuario y mejoras técnicas globales.

## Situación actual (snapshot)
- UI de accesibilidad
  - Botón flotante fijo (abajo-izquierda), siempre visible y navegable con teclado (Alt+A).
  - Panel (role="dialog"): foco atrapado al abrir; cierre con Escape y clic fuera; aria-expanded en el botón; mensajes aria-live al abrir/cerrar y cambiar de modo.
  - Skip link “Saltar al contenido principal” hacia `<main id="main">`; `nav` con `aria-label`; `*:focus-visible` global.
- Modos (solo se aplican cuando se seleccionan)
  - Visual: `html.acc-visual` aumenta font-size base (~1.15rem) y mejora leve contraste/saturación sobre `body > *` excluyendo `#accessibility-btn` y `#accessibility-panel`.
  - Motriz: `html.acc-motriz` incrementa padding en enlaces/botones (objetivos más grandes).
  - Cognitiva: `html.acc-cognitiva` incrementa el `line-height`.
  - Dislexia: `html.acc-dislexia` aplica OpenDyslexic; carga on-demand (local `assets/css/opendyslexic.css` con fallback CDN).
  - Auditiva: sin cambios visuales (preparado para subtítulos/transcripciones donde haya multimedia).
- Robustez
  - El filtro visual no afecta botón/panel; el botón permanece visible con z-index máximo.
  - Auditoría de `alt` en cliente: rellena desde `data-alt`/`title` o marca decorativa (`alt=""`, `role="presentation"`) y avisa en consola.
- Build y despliegue
  - Build: PASS. Preview: cambios publicados en rama `preview`. Producción: pendiente de merge a `main`.
- Observaciones de consola
  - Advertencia `cdn.tailwindcss.com` solo en src; en dist se usa CSS compilado.
  - Mensajes de extensiones y source maps de terceros: informativos; no afectan el sitio.
- Pendientes recomendados
  - Subir fuentes locales (assets/fonts) para OpenDyslexic (evitar CDN).
  - Completar manualmente `alt` en imágenes significativas.
  - Si hay video/audio: subtítulos VTT y transcripción; evitar autoplay con sonido > 3s o añadir control claro.
  - Verificar contraste ≥ 4.5:1 (texto normal) y ≥ 3:1 (texto grande) y ajustar colores si hay casos límite.

## Controles y funciones
- Botón flotante de accesibilidad siempre visible; atajo Alt+A.
- Panel accesible (role="dialog"):
  - Cerrar con Escape y clic fuera.
  - Gestión de foco (focus trap) al abrir.
  - Anuncios aria-live al abrir/cerrar y al cambiar de modo.
- Modos activables (sólo aplican cuando se seleccionan):
  - Visual: font-size base ↑ (~1.15rem) y leve mejora de contraste/saturación.
  - Auditiva: sin cambios visuales (comunicación por nota y preparación para subtítulos/transcripciones donde aplique).
  - Motriz: padding mayor en enlaces/botones (objetivos táctiles más grandes).
  - Cognitiva: line-height ↑ para lectura.
  - Dislexia: fuente OpenDyslexic cargada bajo demanda (local con fallback CDN).

## Mejoras globales
- Skip link: "Saltar al contenido principal" enlazado a `<main id="main">`.
- `*:focus-visible` con contorno de alta visibilidad.
- `nav` con `aria-label="Navegación principal"`.
- Evitar desaparición del botón al aplicar filtros: el filtro visual se aplica a `body > *` excluyendo `#accessibility-btn` y `#accessibility-panel`.
- Auditoría de alt text en cliente: se rellenan automáticamente `alt` desde `data-alt` o `title`; si no hay, se marca como decorativa (`alt=""`, `role="presentation"`) y se muestra advertencia en consola.

## Buenas prácticas adicionales (pendiente/continuo)
- Textos alternativos: revisar y completar manualmente los `alt` de imágenes significativas.
- Contraste: verificar ≥ 4.5:1 (texto normal) y ≥ 3:1 (texto grande); ajustar colores cuando sea necesario.
- Video/audio: incluir subtítulos (VTT) y transcripciones; evitar autoplay con sonido > 3s o proveer controles.
- Estructura semántica: mantener jerarquía de encabezados (H1→H2→H3), títulos de página descriptivos.
- Formularios: mensajes de error claros y asociados a inputs (aria-describedby), validación no intrusiva.

## Archivos relevantes
- `assets/js/accessibility.js`: lógica del panel, atajos de teclado, focus management, aria-live, carga de OpenDyslexic y auditoría de alt.
- `build.js`: inyección de botón, panel, skip link, landmarks, y estilos de soporte.
- `assets/css/opendyslexic.css`: fuentes locales de OpenDyslexic (con fallback a CDN en runtime).

## Verificación
- Navegación por teclado: PASS (panel, menú, acordeones, formulario).
- Focus visible: PASS.
- Persistencia del botón: PASS (no desaparece con modos activos).
- Modos aplican sólo al activarse: PASS.
- Preview desplegado en Vercel: PASS.

## Próximos pasos sugeridos
- Integrar un verificador de contraste en build o preview (reportes de elementos con ratio bajo).
- Añadir ejemplos de video con subtítulos VTT y bloque de transcripción.
- Pruebas con usuarios/lectores de pantalla (NVDA/JAWS/VoiceOver) y dispositivos táctiles.
