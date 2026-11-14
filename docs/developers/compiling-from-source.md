---
sidebar_position: 1
title: Compiling from Source (Core & Desktop)
description: Developer guide to building core-rogue (with static RandomX C++ bindings) and rogue-desktop-client natively on Linux, macOS, and Windows.
---

# Compiling from Source

Building **`rogue-core-chain`** and **`rogue-desktop-client`** natively from source lets you target your host CPU architecture (`AVX2`, `AES-NI`, or `NEON`), modify consensus/EVM modules, or bundle custom Tauri desktop builds without Docker containers.

---

## 🧠 Static RandomX Architecture & `ARCH` Selection

The RandomX C++ reference engine is integrated as a Git submodule at `consensus/randomx/randomx-src` and compiled into a static archive (`consensus/randomx/lib/librandomx.a`) linked into `core-rogue` via CGO. This guarantees zero runtime shared-library dependencies.

When building `librandomx.a`, you can choose between two CPU instruction targets:

| Build Mode | Command | Target Flag | When to Use |
| :--- | :--- | :--- | :--- |
| **Portable (Default)** | `make core-rogue` | `-DARCH=default` | **Recommended for distribution** and multi-machine binaries. Prevents `SIGILL` crashes on older CPUs lacking AVX2. |
| **Host-Optimized** | `NATIVE=1 make core-rogue` | `-DARCH=native` | **Recommended for local solo mining.** Enables all instruction extensions supported by your local CPU (AVX2, FMA, etc.) for peak RandomX performance. |

---

## 🛠️ Building `rogue-core-chain` (`core-rogue`)

### 1. Install Native Build Prerequisites

* **Go:** `1.22` or higher
* **CMake:** `3.16` or higher
* **C++ Compiler:** GCC 11+ or Clang 12+ with full C++17 support

#### Linux (Ubuntu / Debian)
```bash
sudo apt update
sudo apt install -y build-essential cmake git golang libssl-dev
```

#### Linux (Fedora / RHEL)
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install -y cmake git golang openssl-devel
```

#### macOS (Homebrew)
```bash
xcode-select --install
brew install go cmake git
```

#### Windows (MSYS2 MinGW-w64)
Install **MSYS2**, **Go**, **Rust** (`rustup`), and **Node.js**, then install the MinGW-w64 toolchain inside the MSYS2 MinGW64 shell and add `C:\msys64\mingw64\bin` to your system `PATH`:
```bash
pacman -S --needed mingw-w64-x86_64-gcc mingw-w64-x86_64-cmake mingw-w64-x86_64-make
```

---

### 2. Clone & Initialize the RandomX Submodule

```bash
git clone https://github.com/roguesignalchain/rogue-core-chain.git
cd rogue-core-chain

# Mandatory: initialize consensus/randomx/randomx-src
git submodule update --init --recursive
```

---

### 3. Compile `core-rogue`

#### Linux & macOS

**Option A — Using `Makefile`:**
```bash
# Portable build
make core-rogue

# OR host-optimized build for maximum local RandomX performance
NATIVE=1 make core-rogue
```

**Option B — Using `./scripts/build-core.sh` (Recommended for Workspace Development):**
```bash
./scripts/build-core.sh
```
`build-core.sh` builds `librandomx.a`, compiles `./cmd/geth` with CGO, outputs `./build/bin/core-rogue`, verifies `./build/bin/core-rogue version`, and—if `../rogue-desktop-client` exists alongside it—automatically copies the binary as a Tauri sidecar (`core-rogue-<rust-target-triple>`) into `rogue-desktop-client/src-tauri/bin/`.

#### Windows (PowerShell)
Run the unified Windows build script from `rogue-core-chain`:
```powershell
# Compile librandomx.a, core-rogue.exe, and Desktop Tauri installers
.\scripts\build-windows.ps1

# OR skip Tauri packaging and build only core-rogue.exe
.\scripts\build-windows.ps1 -SkipTauri
```
*(Set `$env:NATIVE = "1"` before running `build-windows.ps1` to compile RandomX with `-DARCH=native`.)*

Verify the resulting binary:
```bash
./build/bin/core-rogue version
```

---

## 🖥️ Building `rogue-desktop-client` from Source

`rogue-desktop-client` is a **Tauri v2** application combining a React/TypeScript/Vite frontend with a Rust backend.

### 1. Desktop Prerequisites
* **Rust & Cargo:** Install via [rustup.rs](https://rustup.rs/)
* **Node.js:** `20+` and `npm`
* **OS WebView Dependencies:**
  * **Linux (Ubuntu/Debian):** `sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  * **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  * **Windows:** Microsoft Edge WebView2 Runtime (preinstalled on Windows 11) + Visual Studio C++ Build Tools

### 2. Clone, Sidecar Placement & Run

```bash
git clone https://github.com/roguesignalchain/rogue-desktop-client.git
cd rogue-desktop-client
npm install
```

Ensure `core-rogue` is available for Tauri's sidecar resolver:
* If `rogue-core-chain` is cloned in the same parent directory and built with `./scripts/build-core.sh` (or `build-windows.ps1`), the sidecar is already copied to `src-tauri/bin/core-rogue-<target-triple>`.
* During `npm run tauri` development mode, `process_manager.rs` also automatically searches `../rogue-core-chain/build/bin/core-rogue`.

#### Development Mode (Hot Reload)
```bash
npm run tauri
```

#### Production Bundle (`.deb`, `.AppImage`, `.dmg`, `.msi`, `.exe`)
```bash
npm run build
npx tauri build
```
Generated platform installers are written to `src-tauri/target/release/bundle/`.

