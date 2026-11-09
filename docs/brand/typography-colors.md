---
id: typography-colors
title: Typography & Color Architecture
sidebar_label: Typography & Colors
sidebar_position: 3
---

# Typography & Color Architecture

The Rogue Signal design system uses high-contrast monochrome values to guarantee peak legibility and tactical aesthetic coherence.

---

## 🎨 Color Spectrum

### Canvas & Surface Tokens
* **Void (`#000000`):** Base canvas layer for all full-screen viewports.
* **Obsidian (`#050505`):** Secondary app body and layout wrapping.
* **Surface Card (`#0A0A0C`):** Component containers, cards, tables, and sidebars.
* **Surface Elevated (`#121217`):** Modals, dropdown menus, and popovers.

### Text Tokens
* **Text Primary (`#FFFFFF`):** 100% white for titles, vital numbers, and high-priority metrics.
* **Text Secondary (`#D4D4D8` / `zinc-300`):** Body paragraphs, descriptions, and active breadcrumbs.
* **Text Muted (`#A1A1AA` / `zinc-400`):** Form labels, table headers, and secondary telemetry.
* **Text Faint (`#71717A` / `zinc-500`):** Disabled states, bracket delimiters, and timestamp footers.

### Borders & Dividing Lines
* **Hairline (`rgba(255, 255, 255, 0.08)`):** Subtle internal card dividers and grid meshes.
* **Subtle (`rgba(255, 255, 255, 0.15)`):** Default card outlines and input strokes.
* **Medium (`rgba(255, 255, 255, 0.30)`):** Hover borders and active input focus rings.
* **Solid (`#FFFFFF`):** High-priority focus and tactical reticle crosshairs.

---

## 🔤 Typography

### Primary Font: Space Grotesk
Used for all display typography, headers, section titles, and marketing statements.

```css
font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

* **Weights:** `700` (Bold), `600` (SemiBold), `500` (Medium).
* **Tracking:** Tight letter-spacing on large headlines (`tracking-tight` or `-0.03em`).

### Monospace Font: JetBrains Mono
Used for all blockchain metrics, cryptographic hashes, CLI commands, smart contract code, and telemetry badges.

```css
font-family: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

* **Weights:** `400` (Regular), `500` (Medium), `700` (Bold).
* **Alignment:** Tabular figures enabled by default for seamless alignment in tables and financial ledgers.

---

## Scale Hierarchy Matrix

| Token | Size | Line Height | Application |
| :--- | :--- | :--- | :--- |
| `text-display` | `4.5rem` / `72px` | `1.05` | Landing Page Hero Headline |
| `text-h1` | `2.25rem` / `36px` | `1.15` | Page & Documentation H1 |
| `text-h2` | `1.75rem` / `28px` | `1.20` | Section Header & Modal Titles |
| `text-h3` | `1.25rem` / `20px` | `1.30` | Card Headers & Feature Titles |
| `text-body` | `1.00rem` / `16px` | `1.50` | Documentation Body Copy |
| `text-mono` | `0.875rem` / `14px`| `1.45` | Hash Values & CLI Parameters |
| `text-hud` | `0.750rem` / `12px`| `1.40` | Uppercase Bracketed Badges `[SYNCED]` |
