---
id: typography-colors
title: Tipografía y Arquitectura de Color
sidebar_label: Tipografía y Color
sidebar_position: 3
---

# Tipografía y Arquitectura de Color

El sistema de diseño de Rogue Signal utiliza valores monocromáticos de alto contraste para garantizar la máxima legibilidad y coherencia estética táctica.

---

## 🎨 Espectro de Color

### Tokens de Lienzo y Superficie
* **Vacío (`#000000`):** Capa base de fondo para todos los viewports de pantalla completa.
* **Obsidiana (`#050505`):** Fondo secundario de aplicación y contenedor estructural.
* **Tarjeta de Superficie (`#0A0A0C`):** Contenedores de componentes, tarjetas, tablas y barra lateral.
* **Superficie Elevada (`#121217`):** Ventanas modales, menús desplegables y popovers.

### Tokens de Texto
* **Texto Primario (`#FFFFFF`):** Blanco 100% para títulos, cifras clave y métricas de alta prioridad.
* **Texto Secundario (`#D4D4D8` / `zinc-300`):** Párrafos de cuerpo, descripciones y migas de pan activas.
* **Texto Atenuado (`#A1A1AA` / `zinc-400`):** Etiquetas de formularios, cabeceras de tabla y telemetría secundaria.
* **Texto Tenue (`#71717A` / `zinc-500`):** Estados inactivos, corchetes delimitadores y marcas de tiempo.

### Líneas Divisoras y Bordes
* **Línea Fina (`rgba(255, 255, 255, 0.08)`):** Divisores internos sutiles y mallas de cuadrícula.
* **Sutil (`rgba(255, 255, 255, 0.15)`):** Contornos estándar de tarjetas y cajas de entrada.
* **Medio (`rgba(255, 255, 255, 0.30)`):** Bordes al pasar el cursor y enfoque de inputs.
* **Sólido (`#FFFFFF`):** Enfoque prioritario y cruces de retícula táctica.

---

## 🔤 Tipografía

### Fuente Primaria: Space Grotesk
Utilizada para toda la tipografía de encabezados, títulos y declaraciones de marca.

```css
font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

* **Pesos:** `700` (Bold), `600` (SemiBold), `500` (Medium).
* **Interletreado (Tracking):** Ajustado en titulares grandes (`tracking-tight` o `-0.03em`).

### Fuente Monoespaciada: JetBrains Mono
Utilizada para métricas de blockchain, hashes criptográficos, comandos CLI, smart contracts y badges.

```css
font-family: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

* **Pesos:** `400` (Regular), `500` (Medium), `700` (Bold).
* **Alineación:** Números tabulares para alineación perfecta en columnas de datos y balances.

---

## Matriz de Jerarquía de Escala

| Token | Tamaño | Altura de Línea | Aplicación |
| :--- | :--- | :--- | :--- |
| `text-display` | `4.5rem` / `72px` | `1.05` | Titular Principal de Landing Page |
| `text-h1` | `2.25rem` / `36px` | `1.15` | H1 de Páginas y Documentación |
| `text-h2` | `1.75rem` / `28px` | `1.20` | Encabezados de Sección y Títulos de Modales |
| `text-h3` | `1.25rem` / `20px` | `1.30` | Encabezados de Tarjetas y Títulos de Funcionalidades |
| `text-body` | `1.00rem` / `16px` | `1.50` | Texto Principal de Documentación |
| `text-mono` | `0.875rem` / `14px`| `1.45` | Valores de Hash y Parámetros CLI |
| `text-hud` | `0.750rem` / `12px`| `1.40` | Badges en Corchetes en Mayúsculas `[SYNCED]` |

