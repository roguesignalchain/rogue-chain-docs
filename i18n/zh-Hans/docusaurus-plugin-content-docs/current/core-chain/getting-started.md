---
title: 核心节点快速入门
description: 运行与管理 rogue-core-chain 节点守护进程的快速入门指南。
---

# 核心节点快速入门

**`rogue-core-chain`** 守护进程（`core-rogue`）是 Rogue Signal 网络的核心全节点软件。它基于高性能 Core-Geth 架构衍生，并深度集成了 C++ 原生 RandomX 静态库，负责处理点对点（P2P）消息广播、共识验证、状态转换执行以及 JSON-RPC 接口服务。

---

## 💻 系统运行环境需求

### 推荐硬件配置
* **CPU：** 现代 64 位多核处理器（支持 AVX2 和 AES-NI 指令集的 Intel 第 10 代以上或 AMD Ryzen 3000 系列以上）
* **内存（RAM）：** 8 GB DDR4/DDR5（若开启本地 RandomX 挖矿数据集，推荐 16 GB）
* **存储空间：** 200 GB+ NVMe 固态硬盘（SSD）
* **网络带宽：** 稳定的宽带连接（下行/上行 10+ Mbps）
* **操作系统：** Linux（Ubuntu 22.04+ / Debian 12+）、macOS（Apple Silicon 或 Intel）或 Windows 10/11（64-bit）

---

## 🚀 启动并运行节点

编译完成或从官方 GitHub Releases 页面下载预编译二进制包后，使用标准命令行启动节点：

```bash
# 1. 初始化创世状态（面向 Rogue Signal 的零摩擦无头初始化）
./build/bin/core-rogue --rogue --datadir ~/.ethereum/rogue init

# 2. 使用标准化端口启动并连接至 Rogue Signal 网络
./build/bin/core-rogue --rogue \
  --datadir ~/.ethereum/rogue \
  --port 38888 \
  --http --http.port 38845 --http.api "eth,net,web3,rogue"
```

### 核心命令行参数

| 参数项 | 用途说明 | Rogue Signal 标准 / 默认值 |
| :--- | :--- | :--- |
| `--rogue` | 接入 Rogue Signal 网络共识规则与创世区块 | 必须指定 |
| `--datadir <path>` | 自定义区块链账本存储目录路径 | `~/.ethereum/rogue` |
| `--port <port>` | 网络底层 P2P 监听通信端口 | `38888`（通用默认值：`30303`） |
| `--bootnodes <enodes>` | 逗号分隔的 `enode://` URL 列表（覆盖 `ROGUE_BOOTNODES` 环境变量） | `ROGUE_BOOTNODES` / `params.RogueBootnodes` |
| `--http` | 启用 HTTP-RPC 服务接口 | `false` |
| `--http.addr <ip>` | HTTP-RPC 监听绑定的网络接口 IP | `127.0.0.1` |
| `--http.port <port>` | HTTP-RPC 监听端口 | `38845`（通用默认值：`8545`） |
| `--http.api <apis>` | 启用的 RPC API 命名空间列表（逗号分隔：`eth,net,web3,rogue`） | `eth,net,web3,rogue` |
| `--ws` | 启用 WebSocket RPC 服务 | `false` |
| `--ws.port <port>` | WebSocket 监听端口 | `38846`（通用默认值：`8546`） |
| `--mine` | 启用内置 RandomX CPU 挖矿 | `false` |
| `--randomx.fast` | 启用 `--mine` 时开启全模式 Fast Mode（约 2.08 GB 数据集） | `false`（轻模式 Light Mode 约 256 MB） |

:::tip 动态引导节点与安全性
* **动态引导节点：** 当 `RogueBootnodes` 在开发阶段为空时，您可以通过 `ROGUE_BOOTNODES` 环境变量或 `--bootnodes` 注入引导节点。详情请参阅 [节点服务配置与引导节点](./configuration.md)。
* **RPC 安全加固：** `randomx` 管理命名空间（例如 `randomx_setFastMode`）默认已从 HTTP/WS 开放模块中排除，以防止未授权的内存分配 DoS 攻击。请使用本地 IPC（`geth.ipc`）执行管理调用，或通过 HTTP 查询 `rogue_getConsensusStatus`。
:::

---

## 🔍 验证节点同步状态

您可以通过 `curl` 执行简单的 JSON-RPC 调用来检查节点当前的区块同步进度：

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:38845
```

* 若节点已完全完成同步，返回结果为 `false`。
* 若节点当前正在追赶区块，将返回包含 `startingBlock`、`currentBlock` 和 `highestBlock` 的同步对象。

