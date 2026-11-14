---
sidebar_position: 2
title: 本地开发网、多节点集群与 CLI
description: "core-rogue CLI 参数、引导节点解析优先级、本地多节点集群搭建、IPC 管理以及协议安全加固的开发者参考。"
---

# 本地开发网、多节点集群与 CLI

本指南涵盖 `core-rogue` 高级 CLI 操作、动态引导节点（bootnode）解析、搭建用于测试共识/最终性的本地多节点集群，以及通过本地 IPC 管理节点。

---

## 📋 完整 CLI 参数参考

| 参数 | 默认值 / 标准 | 说明 |
| :--- | :--- | :--- |
| `--rogue` | 必选 | 激活 Rogue Signal 网络创世配置（`Chain ID 800055`）、RandomX 共识、LWMA-1 与 ECBP-1100 MESS。 |
| `--datadir <path>` | `~/.ethereum/rogue` | 区块链数据目录（`geth/chaindata` 与 `geth.ipc`）。 |
| `--port <port>` | `38888` | P2P TCP/UDP 监听端口。 |
| `--bootnodes <enodes>` | `ROGUE_BOOTNODES` / `params.RogueBootnodes` | 逗号分隔的 `enode://` URL 列表（最高优先级）。 |
| `--syncmode <mode>` | `full` | 同步模式。请始终使用 `full` 以进行完整的 RandomX PoW 校验。 |
| `--cache <MB>` | `256`（或 `1024`+） | 分配给 LevelDB 与状态树缓存的内存（MiB）。 |
| `--http` | `false` | 启用 HTTP JSON-RPC 2.0 服务器。 |
| `--http.addr <ip>` | `127.0.0.1` | HTTP-RPC 监听网卡地址。 |
| `--http.port <port>` | `38845` | HTTP-RPC 监听端口。 |
| `--http.api <apis>` | `eth,net,web3,rogue` | 通过 HTTP 暴露的逗号分隔 RPC 模块列表。 |
| `--http.maxconnsperip <N>` | `100` | 单 IP 并发 HTTP/WS 请求上限（超出返回 `HTTP 429` 与 `Retry-After: 1`）。 |
| `--http.trustedproxies <cidrs>` | *（默认 fail-closed）* | 逗号分隔的可信代理 CIDR（例如 `127.0.0.1/32`），用于在 Nginx/Caddy/Cloudflare 之后通过 Rightmost Untrusted IP 算法提取真实客户端 IP。 |
| `--ws` | `false` | 启用 WebSocket JSON-RPC 服务器。 |
| `--ws.port <port>` | `38846` | WebSocket RPC 监听端口。 |
| `--authrpc.port <port>` | `8551` | 内部 AuthRPC 端口（在同一主机运行多个节点时需为每个实例分配不同端口）。 |
| `--verbosity <0..5>` | `3` | 日志级别（`0`=静默、`1`=Error、`2`=Warn、`3`=Info、`4`=Debug、`5`=Trace）。 |
| `--mine` | `false` | 启用内置 RandomX CPU 矿工。 |
| `--miner.threads <N>` | 取决于 CPU | RandomX 哈希计算线程数。 |
| `--miner.etherbase <0x...>` | *（默认回退至金库）* | 接收 95% 区块奖励（`23.75 ROGUE`）+ 交易手续费的地址。 |
| `--miner.extradata "<tag>"` | `""` | 自定义矿工标签（最长 `64` 字节），用于区分 `sealhash` 目标。 |
| `--randomx.fast` | `false` | 分配约 2.08 GB 的快速模式 RandomX 数据集（省略时为轻量模式约 256 MB）。 |

---

## 🌐 引导节点（Bootnode）解析优先级

当启用 `--rogue` 时，`core-rogue` 按严格顺序解析引导节点：

1. **`--bootnodes` CLI 参数** — 最高优先级，覆盖所有其他来源。
2. **`ROGUE_BOOTNODES` 环境变量** — 当省略 `--bootnodes` 时动态读取逗号分隔的 `enode://` URL 列表。
3. **`params.RogueBootnodes`** — 编译内置的主网引导节点（主网发布前开发阶段刻意置空）。
4. **静态 / 手动节点** — `<datadir>/geth/static-nodes.json` 或通过 IPC 调用 `admin.addPeer(...)`。

---

## 🧪 运行本地多节点测试集群

为了启用防日蚀攻击保护（`defaultMinSyncPeers = 3`）和完整的 **ECBP-1100 (MESS)** 人工最终性（`minArtificialFinalityPeers = 3`），预发布与测试拓扑应运行**至少 3 个互联节点**。

*（注：孤立的 1 节点或 2 节点本地开发网仍可通过 10 秒 `forceSyncCycle` 定时器正常同步和出块；一旦连接 3 个以上节点，MESS 会自动重新激活。）*

### 示例：3 节点本地测试集群

在同一台机器上运行多个节点时，请分配互不冲突的 `--datadir`、`--port`、`--http.port` 和 `--authrpc.port`：

#### 1. 初始化全部 3 个数据目录
```bash
./build/bin/core-rogue --rogue --datadir ./nodes-local/node1 init
./build/bin/core-rogue --rogue --datadir ./nodes-local/node2 init
./build/bin/core-rogue --rogue --datadir ./nodes-local/node3 init
```

#### 2. 启动节点 1（种子节点 / 矿工）
```bash
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node1 \
  --port 38888 \
  --http --http.port 38845 --http.api eth,net,web3,randomx \
  --authrpc.port 8551 \
  --mine --miner.threads 2 --miner.etherbase 0xYourTestAddress --miner.extradata "node-1"
```

#### 3. 通过 IPC 获取节点 1 的 `enode://` 地址
```bash
./build/bin/core-rogue attach ./nodes-local/node1/geth.ipc --exec "admin.nodeInfo.enode"
```

#### 4. 启动节点 2 和节点 3 并指向节点 1
```bash
export ROGUE_BOOTNODES="enode://<node1-pubkey>@127.0.0.1:38888"

# 节点 2
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node2 \
  --port 38889 \
  --http --http.port 38847 --http.api eth,net,web3,randomx \
  --authrpc.port 8552

# 节点 3
./build/bin/core-rogue --rogue \
  --datadir ./nodes-local/node3 \
  --port 38890 \
  --http --http.port 38849 --http.api eth,net,web3,randomx \
  --authrpc.port 8553
```

---

## 🔒 管理级 IPC 控制台（`geth.ipc`）

`randomx` 管理命名空间（包含 `randomx_setFastMode`）以及 `admin` / `miner` 控制接口默认从公开的 HTTP/WS 模块中排除，以防止未经认证的内存分配 DoS 攻击。

请使用本地 IPC（`<datadir>/geth.ipc`）进行受信任的本地管理操作：

```bash
# 连接交互式 JavaScript 控制台
./build/bin/core-rogue attach ~/.local/share/rogue-signal/chaindata/geth.ipc
```

常用 IPC 命令：
```js
// 查看节点身份与已连接对等节点
admin.nodeInfo.enode
admin.peers.length

// 动态设置或更新矿工收益地址
miner.setEtherbase("0xYourRogueAddressHere")

// 查询实时 RandomX 共识与 VM 池遥测
randomx.getConsensusStatus()

// 为下一个纪元上下文切换快速模式（约 2.08 GB 数据集）
randomx.setFastMode(true)
```

---

## 🌐 生产环境反向代理加固

如果你将节点的 HTTP-RPC 暴露在 **Nginx**、**Caddy**、**Traefik** 或 **Cloudflare** 之后，请保持 `--http.addr 127.0.0.1` 并配置 `--http.trustedproxies`：

```bash
./build/bin/core-rogue --rogue \
  --http --http.addr 127.0.0.1 --http.port 38845 \
  --http.trustedproxies "127.0.0.1/32" \
  --http.maxconnsperip 100
```

`core-rogue` 默认采用 fail-closed 策略（直接使用直连 Socket IP），仅对显式配置的受信任代理 CIDR 解析 `X-Forwarded-For`（采用 **Rightmost Untrusted IP** 算法，并支持 `X-Real-IP` 回退），从而防止通过伪造请求头绕过限流。

