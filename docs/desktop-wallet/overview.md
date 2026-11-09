---
title: Desktop Client Overview
description: Overview of the official Rogue Signal desktop wallet and node controller.
---

# Desktop Client Overview

The **`rogue-desktop-client`** is the official graphical wallet, local node manager, and CPU miner for the Rogue Signal blockchain. Built with **Tauri v2** and **React**, it combines lightweight native performance with military-grade local cryptography.

---

## 🌟 Key Features

* **Lightweight Native Core:** Powered by Rust and Tauri v2, consuming a fraction of the memory footprint of conventional Electron-based wallets.
* **Integrated Node Manager:** Start, stop, monitor sync status, and inspect blockchain logs directly within the UI.
* **Built-in RandomX CPU Miner:** Mine ROGUE directly to your address with single-click operation, adjustable thread allocations, and live hash rate telemetry.
* **Encrypted Vault Storage:** All private keys and BIP-39 mnemonic phrases are encrypted on-disk using AES-256-GCM authenticated encryption.
* **Multi-Account Support:** Create and manage multiple addresses derived from a single HD wallet seed.

---

## 🖥️ Platform Availability

Precompiled installers and portable packages are provided on the official repository release page:

* **Linux:** `.deb` package and portable `.AppImage`
* **Windows:** `.msi` Windows installer and standalone `.exe`
* **macOS:** Universal `.dmg` (Apple Silicon & Intel)
