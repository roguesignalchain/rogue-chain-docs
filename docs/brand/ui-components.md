---
id: ui-components
title: UI Components & HUD Specifications
sidebar_label: UI Components
sidebar_position: 4
---

# UI Components & HUD Specifications

The Rogue Signal interface philosophy uses tactical brutalist components that express solidity, high responsiveness, and zero decorative fluff.

---

## 🔘 Buttons & Action Triggers

### Primary Button (Solid Video-Inversion)
High-contrast solid white element that commands user focus.

```html
<button class="bg-white text-black font-semibold px-6 py-2.5 rounded-[2px] hover:bg-zinc-200 transition-colors duration-150 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
  START MINING [RX-0]
</button>
```

### Secondary Button (Tactical Hairline)
Hairline outlined button for auxiliary actions and navigation.

```html
<button class="bg-transparent text-white border border-white/20 font-medium px-6 py-2.5 rounded-[2px] hover:border-white hover:bg-white/5 transition-all duration-150">
  VIEW BLOCK EXPLORER
</button>
```

### Ghost Action (Bracket Link)
Terminal-styled hyperlink with brackets.

```html
<a href="/docs/intro" class="text-zinc-400 hover:text-white font-mono text-sm tracking-wider transition-colors">
  [ READ SPECIFICATIONS → ]
</a>
```

---

## 🗃️ Cards & Container Panels

* **Surface:** `#0A0A0C` background.
* **Border:** `1px solid rgba(255, 255, 255, 0.08)`.
* **Radius:** `2px` (strictly avoid large pill radii).
* **Hover Interaction:** Elevates border to `rgba(255, 255, 255, 0.30)`.

```html
<div class="bg-[#0A0A0C] border border-white/10 rounded-[2px] p-6 hover:border-white/30 transition-all">
  <div class="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">[NODE STATUS]</div>
  <h3 class="text-xl font-bold text-white mb-2">Block Synchronizer</h3>
  <p class="text-zinc-400 text-sm">Processing RandomX cryptographic blocks via local P2P daemon.</p>
</div>
```

---

## 💡 Status Indicators (Monochrome Telemetry)

System health is conveyed through luminance and pulsing animation rather than saturated color:

| Status | Dot Presentation | Badge Markup | Meaning |
| :--- | :--- | :--- | :--- |
| **Active / Mining** | White pulsing dot (`animate-pulse`) | `[MINING]` in white text / `border-white/30` | System operating at full capacity |
| **Idle / Standby** | Fixed muted zinc-600 dot | `[STANDBY]` in zinc-400 / `border-white/10` | Daemon idle or listening |
| **Syncing** | Rapid pulsing zinc-300 dot | `[SYNCING 99%]` in zinc-200 | Catching up chain state |

---

## 📈 Hashrate & Performance Graphing

* **Grid Lines:** `1px` dashed `rgba(255, 255, 255, 0.06)`.
* **Stroke:** `1.5px` solid white `#FFFFFF`.
* **Fill Area:** Vertical gradient fading from `rgba(255, 255, 255, 0.12)` down to `transparent`.
* **Tooltip:** Inverted box (`bg-white text-black font-mono font-bold text-xs px-2 py-1`).
