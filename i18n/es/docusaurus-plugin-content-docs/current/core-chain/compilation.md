---
title: Compilación desde el Código Fuente
description: Cómo compilar rogue-core-chain de forma nativa en Linux, macOS y Windows.
---

# Compilación desde el Código Fuente

Compilar `rogue-core-chain` directamente en tu máquina garantiza el máximo rendimiento posible al aprovechar las instrucciones vectoriales nativas de tu procesador (como AVX2 o NEON).

---

## 🛠️ Requisitos Previos

Antes de compilar, instala las herramientas de desarrollo necesarias:

### Ubuntu / Debian
```bash
sudo apt update
sudo apt install -y build-essential cmake git golang libssl-dev
```

### Fedora / RHEL
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install -y cmake git golang openssl-devel
```

### macOS (Homebrew)
```bash
brew install go cmake git
```

* **Versión de Go:** 1.22 o superior
* **CMake:** 3.16 o superior
* **Compilador C++:** Clang 12+ o GCC 11+ con soporte completo para C++17

---

## 📥 Clonado del Repositorio y Submódulos

La implementación de referencia de RandomX está integrada como un submódulo de Git en `consensus/randomx/randomx-src`.

```bash
git clone https://github.com/roguesignalchain/rogue-core-chain.git
cd rogue-core-chain

# Obligatorio: Inicializar y descargar el submódulo de RandomX
git submodule update --init --recursive
```

---

## 🏗️ Proceso de Compilación Nativa

Rogue Signal incluye scripts para compilar estáticamente `librandomx.a` y enlazar el binario principal:

```bash
# Compilar el binario core-rogue
make core-rogue
```

También puedes invocar el script automatizado disponible en `scripts/`:

```bash
./scripts/build-native.sh
```

El binario resultante se encontrará en:
```bash
./build/bin/core-rogue
```

Para verificar que funciona correctamente:
```bash
./build/bin/core-rogue version
```
