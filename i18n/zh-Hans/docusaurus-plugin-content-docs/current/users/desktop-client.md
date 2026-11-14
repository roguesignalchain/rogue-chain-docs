---
sidebar_position: 2
title: 使用桌面客户端
description: "安装与使用 Rogue Desktop Client 的完整用户指南——涵盖钱包、集成节点管理器、RandomX CPU 矿工、本地浏览器与控制台。"
---

# 使用 Rogue 桌面客户端

**`rogue-desktop-client`** 是 Rogue Signal 区块链的官方图形化钱包、本地节点管理器与 RandomX CPU 矿工。它基于 **Tauri v2**（Rust）与 **React** 构建，在保持极低内存占用的原生性能的同时，将 `core-rogue` 节点二进制直接集成为受管边车（sidecar）进程。

---

## 🖥️ 平台安装包

预编译安装程序与便携包发布在 [Rogue Desktop Client Releases](https://github.com/roguesignalchain/rogue-desktop-client/releases) 页面：

| 操作系统 | 可用格式 | 说明 |
| :--- | :--- | :--- |
| **Linux** | `.deb`（Debian/Ubuntu）及便携 `.AppImage` | 使用 `chmod +x Rogue-Desktop*.AppImage` 赋予 `.AppImage` 可执行权限 |
| **Windows** | `.msi` 安装程序及 `.exe`（NSIS） | 需要 Windows 10/11（64 位）及 WebView2 Runtime |
| **macOS** | 通用 `.dmg`（Apple Silicon 与 Intel） | 拖入“应用程序”；若从非 App Store 来源下载，请在“系统设置 → 隐私与安全性”中允许运行 |

---

## 🚀 首次启动与内置节点生命周期

打开 **Rogue Desktop Client** 后，你无需手动配置独立节点：

1. **自动定位二进制文件：** Rust 后端（`process_manager.rs`）会自动查找应用可执行文件旁打包的 `core-rogue` 边车（或回退到系统 `PATH` 中的安装路径）。
2. **自动初始化创世区块：** 如果配置的数据目录中尚未包含 `geth/chaindata`，客户端会在后台自动执行 `core-rogue --rogue --datadir <path> init` 以初始化第 0 区块（`Chain ID 800055`）。
3. **复用已运行的本地节点：** 如果本地已有 `core-rogue` 节点在配置的 HTTP RPC 端口（默认 `38845`）上响应，桌面客户端会自动检测并连接该活跃实例，而不会启动冲突的重复进程。
4. **安全退出：** 关闭应用时，客户端会优雅终止其启动的所有边车节点进程，保护 LevelDB 链数据库免受损坏。

---

## 🧭 界面功能导览

左侧边栏提供六个核心工作区：

### 1. Dashboard（仪表盘）
**Dashboard** 集中展示节点、钱包与挖矿的实时状态：
* **节点与同步遥测：** 实时显示本地 `core-rogue` 进程是否正在运行、其 PID、已连接的 P2P 节点数以及当前区块高度 / 同步百分比。
* **活跃钱包余额：** 实时显示当前选中账户的 `ROGUE` 余额。
* **链上矿工声誉：** 通过 `eth_call` 直接查询 `RogueMinerReputation` 系统合约（`0x0000000000000000000000000000000000000020`），展示你当前的赛博朋克等级（例如 *Unranked Runner* 至 *Rogue Singularity*）、累计挖出区块数以及距离下一等级的进度。
* **最新区块：** 实时呈现你的节点刚验证通过的最新区块列表。

---

### 2. Wallet（钱包）
**Wallet** 视图是一个完全自托管的 HD 钱包，由本地加密保险库（`.rogue-wallet.vault`）提供保护：

* **创建新钱包：** 使用密码学安全伪随机数生成器（CSPRNG）生成全新的 **12 词或 24 词 BIP-39 助记词**，并使用主密码进行加密存储。
* **导入已有钱包：** 恢复任意已有的 BIP-39 助记词（12 词或 24 词），并为其指定易记标签。
* **多钱包与 HD 账户派生：**
  * 在同一个加密保险库中保存并切换多个独立钱包。
  * 使用标准 EVM BIP-44 派生路径 `m/44'/60'/0'/0/index` 从同一助记词派生更多地址。
* **发送 `ROGUE` 交易：**
  * 输入目标 `0x...` 地址、转账 `ROGUE` 数量并确认 Gas 费用（最低 Gas 价格下限为 `1 Gwei`）。
  * 交易在 Rust 后端使用 `secp256k1` 本地签名，并通过 `eth_sendRawTransaction` 以 **Legacy（`Type 0`）** 原始交易形式广播——私钥永不离开你的设备。
* **自动锁定安全：** 在可配置的无操作时间（默认 **15 分钟**）后，保险库会在内存中自动锁定，再次签名交易或查看敏感助记词时需重新输入主密码。

---

### 3. Mining（挖矿）
**Mining** 标签页可将你的桌面设备变为无需外部矿池的全节点独立 RandomX 矿工：

* **硬件诊断（`Check System Resources`）：** 扫描 CPU 逻辑核心数与可用系统内存，自动计算安全且最优的线程数和内存配置。
* **内存模式切换（Light vs. Fast）：**
  * **轻量模式（~256 MiB RAM，默认）：** 适合后台挖矿或 4–8 GB 内存的机器，不会影响日常桌面流畅度。
  * **快速模式（~2080 MiB RAM）：** 在内存中分配完整的 2.08 GB RandomX 数据集，以获得最高 CPU 算力。建议在 16 GB+ 内存的设备上开启。
* **CPU 线程滑块：** 调整分配给 RandomX 哈希计算的线程数。为达到最佳效率，建议匹配 CPU 的 L3 缓存（`L3 缓存 MiB / 2`）。
* **收益地址（`Coinbase`）：** 自动使用你当前已解锁的钱包地址（或任意配置的 `etherbase` 地址），使每个挖出区块的 **23.75 ROGUE** 奖励 + 100% 区块交易手续费直接进入你的账户。
* **同步门控保护：** 启动挖矿前会校验节点是否正在运行、已连接至少 1 个对等节点且已完成链尖同步，避免在过时区块上浪费算力。
* **实时遥测：** 实时展示算力（`H/s`）、运行状态以及近期挖出的区块。

---

### 4. Explorer（本地浏览器）
**Explorer** 标签页提供由本地节点 JSON-RPC API 直接驱动的内置、去信任区块与交易浏览器：
* 无需依赖第三方网页浏览器，即可直接检索和查看最新区块号、区块哈希、时间戳、矿工（`coinbase`）地址、Gas 消耗及单笔交易回执。

---

### 5. Node Console（节点控制台）
**Node Console** 直接在界面中实时流式输出受管 `core-rogue` 进程的 `stdout` 与 `stderr` 日志：
* 实时监控节点握手、区块导入、RandomX 数据集初始化、HugePages 回退提示以及新区块发现记录。
* 无需打开终端即可排查防火墙问题、引导节点连通性或自定义参数行为。

---

### 6. Settings（设置）
**Settings** 标签页提供了对桌面客户端 RPC 连接、自动锁定计时器、本地 `core-rogue` 节点参数以及数据库维护的完整控制。

有关所有设置项、默认值及安全最佳实践的完整说明，请继续阅读 [桌面客户端配置与保险库安全](./desktop-configuration.md)。

