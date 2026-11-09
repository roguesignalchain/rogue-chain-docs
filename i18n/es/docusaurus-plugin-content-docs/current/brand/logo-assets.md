---
id: logo-assets
title: Arquitectura de Logotipos e Isotipos Oficiales
sidebar_label: Logotipos y Recursos
sidebar_position: 2
---

# Arquitectura de Logotipos e Isotipos Oficiales

La identidad visual del protocolo Rogue Signal opera bajo una taxonomía formal de dos niveles:
1. **Insignia de Marketing y Comunidad:** Emblema táctico de alto impacto sobre fondo negro para redes sociales, notas de lanzamiento y difusión pública.
2. **Sistema de Isotipos Técnicos de Desarrollo:** Glifos vectoriales transparentes de máxima precisión concebidos para aplicaciones de escritorio, cabeceras web, utilidades CLI y favicons.

---

## 1. Insignia de Marketing y Comunidad

* **Archivo Canónico:** `/recursos/imagenes/rogue-signal.logo-rrss.png` (900×900px, RGB)
* **Alcance de Aplicación:** Avatares oficiales en redes sociales (X/Twitter, Telegram, Discord), notas de prensa, avatar de la organización en GitHub y afiches promocionales.

![Insignia de Marketing Rogue Signal](/img/logo.png)

---

## 2. Sistema de Isotipos Técnicos de Desarrollo

Para interfaces de software, cabeceras de navegación, barras de títulos en aplicaciones de escritorio y accesos directos, se utilizan los isotipos independientes sobre fondo transparente:

### Isotipo Técnico Blanco (Superficies Oscuras y UI)
* **Ubicación:** `/recursos/imagenes/roguechain-icon.png` (1254×1254px, RGBA transparente)
* **Pack de Tamaños Optimizados:** `/recursos/iconos/roguechain-icon-white-[16|22|32|64|128|256|512].png`
* **Casos de Uso:**
  * Cabeceras y barras de navegación en modo oscuro (`#000000` / `#050505`).
  * Cabecera del cliente de escritorio (`rogue-desktop-client`).
  * Favicon oficial en navegadores web.
  * Icono de bandeja del sistema / barra de estado del sistema operativo (22×22px).

![Isotipo Técnico Blanco](/img/icon.png)

---

### Isotipo Técnico Negro (Superficies Claras e Impresión)
* **Ubicación:** `/recursos/imagenes/roguechain-icon-black.png` (1254×1254px, RGBA transparente)
* **Pack de Tamaños Optimizados:** `/recursos/iconos/roguechain-icon-black-[tamaño].png`
* **Casos de Uso:**
  * Documentación técnica impresa y billeteras físicas de papel.
  * Botones con inversión de video blanca (`bg-white text-black`) y etiquetas tácticas en blanco sólido.
  * Entornos de escritorio o barras de tareas en modo claro.

---

## 3. Matriz de Estándares de Dimensiones

| Activo | Archivo | Uso Destino | Tamaño Recomendado |
| :--- | :--- | :--- | :--- |
| **Favicon de Navegador** | `roguechain-icon.png` | Pestañas de la web y documentación | `32×32px` / `16×16px` |
| **Barra de Navegación** | `roguechain-icon.png` | Cabeceras web y apps (con Space Grotesk) | Altura `32px` |
| **Ventana de Cliente** | `roguechain-icon.png` | Barra superior del cliente Tauri | `28px – 32px` |
| **Bundle de App Tauri** | `src-tauri/icons/` | Lanzador del sistema operativo (.exe, .deb) | Multi-resolución |
| **Bandeja de Sistema** | `roguechain-icon-white-22x22.png` | Demonio en segundo plano (System Tray) | `22×22px` |
| **Marketing y Comunidad**| `rogue-signal.logo-rrss.png` | Twitter, Discord, afiches de release | `900×900px` |

---

## 4. Zona de Seguridad y Márgenes

Se debe mantener un área libre alrededor del isotipo técnico equivalente a al menos la mitad de su dimensión ($0.5X$):

```
       [+]───────────────────────────────────────[+]
       │                 0.5X                     │
       │         ┌───────────────────┐            │
       │         │                   │            │
       │  0.5X   │  ISOTIPO TÉCNICO  │    0.5X    │
       │         │                   │            │
       │         └───────────────────┘            │
       │                 0.5X                     │
       [+]───────────────────────────────────────[+]
```

---

## 5. Reglas de Uso Indebido

* ❌ **Nunca aplicar colores ni degradados:** Ambos isotipos deben mantenerse en blanco puro (`#FFFFFF`) o negro puro (`#000000`).
* ❌ **Nunca invertir indebidamente:** No utilizar `roguechain-icon.png` (blanco) sobre fondos claros; utilizar siempre `roguechain-icon-black.png`.
* ❌ **Nunca deformar las proporciones:** Mantener rigurosamente la relación de aspecto 1:1 cuadrada.
