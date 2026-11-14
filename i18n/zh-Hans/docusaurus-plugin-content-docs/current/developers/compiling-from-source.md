---
sidebar_position: 1
title: 从源码编译（核心节点与桌面客户端）
description: "在 Linux、macOS 和 Windows 上原生编译 core-rogue（含静态 RandomX C++ 绑定）与 rogue-desktop-client 的开发者指南。"
---

# 从源码编译

在本地原生编译 **`rogue-core-chain`** 和 **`rogue-desktop-client`** 可以让你针对宿主机 CPU 架构（`AVX2`、`AES-NI` 或 `NEON`）进行优化、修改共识/EVM 模块，或在不依赖 Docker 容器的情况下打包自定义 Tauri 桌面安装程序。

---

## 🧠 静态 RandomX 架构与 `ARCH` 选择

RandomX C++ 参考实现以 Git 子模块形式集成在 `consensus/randomx/randomx-src`，并编译为静态库（`consensus/randomx/lib/librandomx.a`）通过 CGO 静态链接进 `core-rogue`，确保运行时零动态库依赖。

编译 `librandomx.a` 时，你可以选择两种 CPU 指令集目标：

| 编译模式 | 命令 | 目标参数 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **可移植模式（默认）** | `make core-rogue` | `-DARCH=default` | **推荐用于分发**与跨机器二进制文件。避免在不支持 AVX2 的旧 CPU 上触发 `SIGILL` 崩溃。 |
| **宿主机优化模式** | `NATIVE=1 make core-rogue` | `-DARCH=native` | **推荐用于本地独立挖矿。** 启用本地 CPU 支持的全部指令扩展（AVX2、FMA 等），发挥 RandomX 极限性能。 |

---

## 🛠️ 编译 `rogue-core-chain` (`core-rogue`)

### 1. 安装原生编译前置依赖

* **Go:** `1.22` 或更高版本
* **CMake:** `3.16` 或更高版本
* **C++ 编译器:** GCC 11+ 或 Clang 12+（完整支持 C++17）

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
安装 **MSYS2**、**Go**、**Rust**（`rustup`）与 **Node.js**，随后在 MSYS2 MinGW64 终端中安装 MinGW-w64 工具链，并将 `C:\msys64\mingw64\bin` 添加到系统 `PATH`：
```bash
pacman -S --needed mingw-w64-x86_64-gcc mingw-w64-x86_64-cmake mingw-w64-x86_64-make
```

---

### 2. 克隆仓库并初始化 RandomX 子模块

```bash
git clone https://github.com/roguesignalchain/rogue-core-chain.git
cd rogue-core-chain

# 必选：初始化 consensus/randomx/randomx-src
git submodule update --init --recursive
```

---

### 3. 编译 `core-rogue`

#### Linux 与 macOS

**方式 A — 使用 `Makefile`：**
```bash
# 可移植编译
make core-rogue

# 或针对宿主机优化编译以获取最佳本地 RandomX 性能
NATIVE=1 make core-rogue
```

**方式 B — 使用 `./scripts/build-core.sh`（推荐用于工作区联合开发）：**
```bash
./scripts/build-core.sh
```
`build-core.sh` 会编译 `librandomx.a`、使用 CGO 编译 `./cmd/geth`、生成 `./build/bin/core-rogue`、运行 `./build/bin/core-rogue version` 进行校验，并且——如果同级目录下存在 `../rogue-desktop-client`——自动将该二进制复制为 Tauri 边车（`core-rogue-<rust-target-triple>`）到 `rogue-desktop-client/src-tauri/bin/`。

#### Windows (PowerShell)
在 `rogue-core-chain` 目录中运行统一的 Windows 构建脚本：
```powershell
# 编译 librandomx.a、core-rogue.exe 以及桌面端 Tauri 安装包
.\scripts\build-windows.ps1

# 或跳过 Tauri 打包，仅编译 core-rogue.exe
.\scripts\build-windows.ps1 -SkipTauri
```
*（在运行 `build-windows.ps1` 前设置 `$env:NATIVE = "1"` 可使用 `-DARCH=native` 编译 RandomX。）*

验证生成的二进制文件：
```bash
./build/bin/core-rogue version
```

---

## 🖥️ 从源码编译 `rogue-desktop-client`

`rogue-desktop-client` 是一个结合 React/TypeScript/Vite 前端与 Rust 后端的 **Tauri v2** 应用。

### 1. 桌面端前置依赖
* **Rust 与 Cargo:** 通过 [rustup.rs](https://rustup.rs/) 安装
* **Node.js:** `20+` 与 `npm`
* **操作系统 WebView 依赖：**
  * **Linux (Ubuntu/Debian):** `sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev`
  * **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  * **Windows:** Microsoft Edge WebView2 Runtime（Windows 11 已预装）+ Visual Studio C++ Build Tools

### 2. 克隆仓库、放置边车并运行

```bash
git clone https://github.com/roguesignalchain/rogue-desktop-client.git
cd rogue-desktop-client
npm install
```

确保 `core-rogue` 对 Tauri 边车解析器可见：
* 如果 `rogue-core-chain` 克隆在同一父目录下并使用 `./scripts/build-core.sh`（或 `build-windows.ps1`）编译，边车文件已自动复制到 `src-tauri/bin/core-rogue-<target-triple>`。
* 在 `npm run tauri` 开发模式下，`process_manager.rs` 也会自动搜索 `../rogue-core-chain/build/bin/core-rogue`。

#### 开发模式（热重载）
```bash
npm run tauri
```

#### 生产打包（`.deb`、`.AppImage`、`.dmg`、`.msi`、`.exe`）
```bash
npm run build
npx tauri build
```
生成的各平台安装程序将输出至 `src-tauri/target/release/bundle/`。

