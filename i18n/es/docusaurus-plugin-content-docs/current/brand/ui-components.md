---
id: ui-components
title: Componentes UI y Especificaciones HUD
sidebar_label: Componentes UI
sidebar_position: 4
---

# Componentes UI y Especificaciones HUD

La filosofía de interfaz de Rogue Signal utiliza componentes tácticos brutalistas que transmiten solidez, máxima respuesta y cero artificios decorativos.

---

## 🔘 Botones y Disparadores de Acción

### Botón Primario (Inversión de Video en Blanco Sólido)
Elemento de contraste máximo que comanda la atención.

```html
<button class="bg-white text-black font-semibold px-6 py-2.5 rounded-[2px] hover:bg-zinc-200 transition-colors duration-150 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
  INICIAR MINERÍA [RX-0]
</button>
```

### Botón Secundario (Línea Fina Táctica)
Botón con contorno fino para acciones complementarias y navegación.

```html
<button class="bg-transparent text-white border border-white/20 font-medium px-6 py-2.5 rounded-[2px] hover:border-white hover:bg-white/5 transition-all duration-150">
  VER EXPLORADOR DE BLOQUES
</button>
```

### Enlace Fantasma Táctico (Enlace en Corchetes)
Hipervínculo con estilo de terminal.

```html
<a href="/docs/intro" class="text-zinc-400 hover:text-white font-mono text-sm tracking-wider transition-colors">
  [ LEER ESPECIFICACIONES → ]
</a>
```

---

## 🗃️ Tarjetas y Paneles Contenedores

* **Superficie:** Fondo `#0A0A0C`.
* **Borde:** `1px solid rgba(255, 255, 255, 0.08)`.
* **Radio:** `2px` (evitar estrictamente radios redondeados grandes).
* **Hover:** Eleva el borde a `rgba(255, 255, 255, 0.30)`.

```html
<div class="bg-[#0A0A0C] border border-white/10 rounded-[2px] p-6 hover:border-white/30 transition-all">
  <div class="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">[ESTADO DEL NODO]</div>
  <h3 class="text-xl font-bold text-white mb-2">Sincronizador de Bloques</h3>
  <p class="text-zinc-400 text-sm">Procesando bloques RandomX mediante el daemon P2P local.</p>
</div>
```

---

## 💡 Indicadores de Estado (Telemetría Monocromática)

La salud del sistema se comunica a través de luminancia y pulsos de luz en lugar de colores saturados:

| Estado | Presentación de Punto | Marcado de Badge | Significado |
| :--- | :--- | :--- | :--- |
| **Activo / Minando** | Punto blanco pulsante (`animate-pulse`) | `[MINING]` en texto blanco / `border-white/30` | Sistema operando a plena capacidad |
| **En Espera / Idle** | Punto zinc-600 fijo | `[STANDBY]` en zinc-400 / `border-white/10` | Daemon en espera o a la escucha |
| **Sincronizando** | Punto zinc-300 con pulso rápido | `[SYNCING 99%]` en zinc-200 | Sincronizando estado de la cadena |

---

## 📈 Gráficos de Rendimiento y Hashrate

* **Líneas de Cuadrícula:** `1px` discontinuo `rgba(255, 255, 255, 0.06)`.
* **Trazo:** `1.5px` blanco sólido `#FFFFFF`.
* **Área de Relleno:** Gradiente vertical desvaneciéndose desde `rgba(255, 255, 255, 0.12)` hasta `transparent`.
* **Tooltip:** Caja invertida (`bg-white text-black font-mono font-bold text-xs px-2 py-1`).

