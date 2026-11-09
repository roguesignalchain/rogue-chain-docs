---
title: Compiling from Source
description: How to build rogue-core-chain natively on Linux, macOS, and Windows.
---

# Compiling from Source

Building `rogue-core-chain` from source ensures peak performance by tailoring compiler vector extensions (such as AVX2 or NEON) to your specific hardware.

---

## 🛠️ Build Prerequisites

Before compiling, install the necessary development dependencies:

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

* **Go Version:** 1.22 or higher
* **CMake:** 3.16 or higher
* **C++ Compiler:** Clang 12+ or GCC 11+ with full C++17 support

---

## 📥 Cloning and Submodules

The RandomX reference implementation is integrated as a native Git submodule under `consensus/randomx/randomx-src`.

```bash
git clone https://github.com/roguesignalchain/rogue-core-chain.git
cd rogue-core-chain

# Mandatory: Initialize and fetch the RandomX submodule
git submodule update --init --recursive
```

---

## 🏗️ Native Compilation Steps

Rogue Signal provides unified scripts for building the core binary and statically compiling `librandomx.a`:

```bash
# Build the core-rogue binary natively
make core-rogue
```

Alternatively, invoke the helper script in `scripts/`:

```bash
./scripts/build-native.sh
```

The resulting compiled binary will be located in:
```bash
./build/bin/core-rogue
```

Verify that the binary runs properly:
```bash
./build/bin/core-rogue version
```
