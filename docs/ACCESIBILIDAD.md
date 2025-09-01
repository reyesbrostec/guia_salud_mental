# Registro de Accesibilidad – Guía de Salud Mental

Fecha: 2025-09-01
Ámbito: Sitio estático (index/inclusion) – Preview y Producción

## Resumen
Se implementó un conjunto de mejoras de accesibilidad orientadas a soporte visual, auditivo, motriz y cognitivo, alineadas con WCAG 2.1 AA, con un panel de ajustes activables por el usuario y mejoras técnicas globales.

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
