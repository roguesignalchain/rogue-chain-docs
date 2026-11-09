---
id: logo-assets
title: Official Logo & Insignia Architecture
sidebar_label: Logo & Assets
sidebar_position: 2
---

# Official Logo & Insignia Architecture

The Rogue Signal protocol visual identity operates under a dual-tier taxonomy:
1. **Marketing & Community Insignia:** High-impact tactical sigil for public branding, social media, releases, and promotion.
2. **Technical Development Isotypes:** Transparent, precision glyphs engineered for desktop applications, dark/light UI headers, CLI utilities, and favicons.

---

## 1. Marketing & Community Insignia

* **Canonical File:** `/recursos/imagenes/rogue-signal.logo-rrss.png` (900×900px, RGB)
* **Application:** Social media avatars (X/Twitter, Telegram, Discord), press kits, GitHub organization avatar, and community release notes.

![Rogue Signal Marketing Insignia](/img/logo.png)

---

## 2. Technical Development Isotypes

For software interfaces, navigation headers, desktop window chrome, and application shortcuts, use the transparent vector-quality isotypes:

### White Technical Isotype (Dark Surfaces & UI)
* **File Location:** `/recursos/imagenes/roguechain-icon.png` (1254×1254px, RGBA)
* **Optimized Sizes:** `/recursos/iconos/roguechain-icon-white-[16|22|32|64|128|256|512].png`
* **Use Cases:**
  * Dark-mode headers and navigation bars (`#000000` / `#050505`).
  * Desktop Client UI header (`rogue-desktop-client`).
  * Official browser favicon.
  * System tray / status bar icon (22×22px).

![Rogue Signal White Isotype](/img/icon.png)

---

### Black Technical Isotype (Light Surfaces & Print)
* **File Location:** `/recursos/imagenes/roguechain-icon-black.png` (1254×1254px, RGBA)
* **Optimized Sizes:** `/recursos/iconos/roguechain-icon-black-[size].png`
* **Use Cases:**
  * Printed white technical documentation and paper wallets.
  * Inverted white buttons and solid white UI callout boxes (`bg-white text-black`).
  * Light desktop environments or light system taskbars.

---

## 3. Implementation Standards & Resolution Matrix

| Asset | File | Target Usage | Recommended Size |
| :--- | :--- | :--- | :--- |
| **Browser Favicon** | `roguechain-icon.png` | Web & Documentation Hub tabs | `32×32px` / `16×16px` |
| **Navbar Header** | `roguechain-icon.png` | App & Web headers (with Space Grotesk) | `32px` height |
| **Desktop App Chrome** | `roguechain-icon.png` | Tauri client main window bar | `28px – 32px` |
| **Tauri App Icon** | `src-tauri/icons/` | Executable launcher & OS taskbar | Multi-size (`.ico`, `.png`) |
| **System Tray Icon** | `roguechain-icon-white-22x22.png` | Background node daemon in system tray | `22×22px` |
| **Community Marketing**| `rogue-signal.logo-rrss.png` | Twitter, Discord, Release assets | `900×900px` |

---

## 4. Clear Space & Safe Margin

Preserve a clear boundary around the technical isotype equal to at least half its dimension ($0.5X$):

```
       [+]───────────────────────────────────────[+]
       │                 0.5X                     │
       │         ┌───────────────────┐            │
       │         │                   │            │
       │  0.5X   │  TECHNICAL ISOTYPE│    0.5X    │
       │         │                   │            │
       │         └───────────────────┘            │
       │                 0.5X                     │
       [+]───────────────────────────────────────[+]
```

---

## 5. Misuse Restrictions

* ❌ **Never apply colors or gradients:** Both isotypes must remain strictly pure white (`#FFFFFF`) or pure black (`#000000`).
* ❌ **Never invert inappropriately:** Do not place `roguechain-icon.png` (white) on light backgrounds; always use `roguechain-icon-black.png`.
* ❌ **Never deform the aspect ratio:** Maintain strict 1:1 square aspect ratio.
