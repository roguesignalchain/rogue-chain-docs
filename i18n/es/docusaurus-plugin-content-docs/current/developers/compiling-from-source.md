---
sidebar_position: 1
title: Compilar desde el Código Fuente (Core y Desktop)
description: Guía de desarrolladores para compilar core-rogue (con bindings estáticos C++ de RandomX) y rogue-desktop-client de forma nativa en Linux, macOS y Windows.
---

# Compilar desde el Código Fuente

Compilar **`rogue-core-chain`** y **`rogue-desktop-client`** de forma nativa desde el código fuente te permite apuntar a la arquitectura exacta de tu CPU (`AVX2`, `AES-NI` o `NEON`), modificar módulos de consenso/EVM o empaquetar compilaciones personalizadas de escritorio Tauri sin contenedores Docker.

---

## 🧠 Arquitectura Estática de RandomX y Selección de `ARCH`

El motor de referencia en C++ de RandomX está integrado como submódulo Git en `consensus/randomx/randomx-src` y se compila en una librería estática (`consensus/randomx/lib/librandomx.a`) enlazada dentro de `core-rogue` mediante CGO. Esto garantiza cero dependencias de librerías compartidas en tiempo de ejecución.

Al compilar `librandomx.a`, puedes elegir entre dos objetivos de instrucciones de CPU:

| Modo de Compilación | Comando | Flag Objetivo | Cuándo Usarlo |
| :--- | :--- | :--- | :--- |
| **Portable (Por Defecto)** | `make core-rogue` | `-DARCH=default` | **Recomendado para distribución** y binarios multi-máquina. Evita fallos `SIGILL` en CPUs antiguas sin AVX2. |
| **Optimizado para Host** | `NATIVE=1 make core-rogue` | `-DARCH=native` | **Recomendado para minería local en solitario.** Habilita todas las extensiones de instrucciones soportadas por tu CPU local (AVX2, FMA, etc.) para máximo rendimiento RandomX. |

---

## 🛠️ Compilar `rogue-core-chain` (`core-rogue`)

### 1. Instalar Prerrequisitos Nativos de Compilación

* **Go:** `1.22` o superior
* **CMake:** `3.16` o superior
* **Compilador C++:** GCC 11+ o Clang 12+ con soporte completo de C++17

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
Instala **MSYS2**, **Go**, **Rust** (`rustup`) y **Node.js**, luego instala el toolchain MinGW-w64 dentro de la terminal MSYS2 MinGW64 y añade `C:\msys64\mingw64\bin` al `PATH` del sistema:
```bash
pacman -S --needed mingw-w64-x86_64-gcc mingw-w64-x86_64-cmake mingw-w64-x86_64-make
```

---

### 2. Clonar e Inicializar el Submódulo RandomX

```bash
git clone https://github.com/roguesignalchain/rogue-core-chain.git
cd rogue-core-chain

# Obligatorio: inicializar consensus/randomx/randomx-src
git submodule update --init --recursive
```

---

### 3. Compilar `core-rogue`

#### Linux y macOS

**Opción A — Usando `Makefile`:**
```bash
# Compilación portable
make core-rogue

# O compilación optimizada para el host para máximo rendimiento local RandomX
NATIVE=1 make core-rogue
```

**Opción B — Usando `./scripts/build-core.sh` (Recomendado para Desarrollo en Workspace):**
```bash
./scripts/build-core.sh
```
`build-core.sh` compila `librandomx.a`, compila `./cmd/geth` con CGO, genera `./build/bin/core-rogue`, verifica `./build/bin/core-rogue version` y —si `../rogue-desktop-client` existe junto al repositorio— copia automáticamente el binario como sidecar Tauri (`core-rogue-<rust-target-triple>`) en `rogue-desktop-client/src-tauri/bin/`.

#### Windows (PowerShell)
Ejecuta el script unificado de compilación para Windows desde `rogue-core-chain`:
```powershell
# Compilar librandomx.a, core-rogue.exe y los instaladores Tauri del Desktop
.\scripts\build-windows.ps1

# O omitir el empaquetado Tauri y compilar solo core-rogue.exe
.\scripts\build-windows.ps1 -SkipTauri
```
*(Establece `$env:NATIVE = "1"` antes de ejecutar `build-windows.ps1` para compilar RandomX con `-DARCH=native`.)*

Verifica el binario resultante:
```bash
./build/bin/core-rogue version
```

---

## 🖥️ Compilar `rogue-desktop-client` desde el Código Fuente

`rogue-desktop-client` es una aplicación **Tauri v2** que combina un frontend React/TypeScript/Vite con un backend en Rust.

### 1. Prerrequisitos de Desktop
* **Rust y Cargo:** Instalar vía [rustup.rs](https://rustup.rs/)
* **Node.js:** `20+` y `npm`
* **Dependencias WebView del Sistema Operativo:**
  * **Linux (Ubuntu/Debian):** `sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  * **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  * **Windows:** Microsoft Edge WebView2 Runtime (preinstalado en Windows 11) + Visual Studio C++ Build Tools

### 2. Clonar, Colocar el Sidecar y Ejecutar

```bash
git clone https://github.com/roguesignalchain/rogue-desktop-client.git
cd rogue-desktop-client
npm install
```

Asegúrate de que `core-rogue` esté disponible para el resolvedor de sidecar de Tauri:
* Si `rogue-core-chain` está clonado en el mismo directorio padre y compilado con `./scripts/build-core.sh` (o `build-windows.ps1`), el sidecar ya se habrá copiado en `src-tauri/bin/core-rogue-<target-triple>`.
* Durante el modo desarrollo `npm run tauri`, `process_manager.rs` también busca automáticamente `../rogue-core-chain/build/bin/core-rogue`.

#### Modo Desarrollo (Hot Reload)
```bash
npm run tauri
```

#### Empaquetado de Producción (`.deb`, `.AppImage`, `.dmg`, `.msi`, `.exe`)
```bash
npm run build
npx tauri build
```
Los instaladores generados por plataforma se guardan en `src-tauri/target/release/bundle/`.

