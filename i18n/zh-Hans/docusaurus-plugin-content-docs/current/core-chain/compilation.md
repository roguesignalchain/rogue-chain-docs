---
title: 源码编译指南
description: 如何在 Linux、macOS 和 Windows 上原生编译构建 rogue-core-chain。
---

# 源码编译指南

通过源代码编译构建 `rogue-core-chain` 可以使编译器针对您的特定硬件架构启用向量指令集扩展（如 AVX2 或 NEON），从而获得极致的执行性能。

---

## 🛠️ 构建环境准备

在开始编译前，请确保安装了必需的开发依赖包：

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

* **Go 语言版本：** 1.22 或更高版本
* **CMake 版本：** 3.16 或更高版本
* **C++ 编译器：** Clang 12+ 或 GCC 11+（需完整支持 C++17 标准）

---

## 📥 源码克隆与子模块初始化

RandomX 官方参考实现已作为原生 Git 子模块集成在 `consensus/randomx/randomx-src` 目录下。

```bash
git clone https://github.com/roguesignalchain/rogue-core-chain.git
cd rogue-core-chain

# 必须执行：初始化并检出 RandomX 子模块
git submodule update --init --recursive
```

---

## 🏗️ 原生构建步骤

Rogue Signal 提供了统一的构建脚本，用于静态编译 `librandomx.a` 并打包核心节点二进制程序：

```bash
# 原生编译 core-rogue 二进制文件
make core-rogue
```

或者使用 `scripts/` 目录中的自动化辅助脚本：

```bash
./scripts/build-native.sh
```

编译生成的二进制文件将输出至：
```bash
./build/bin/core-rogue
```

运行版本指令验证二进制文件是否构建成功：
```bash
./build/bin/core-rogue version
```

