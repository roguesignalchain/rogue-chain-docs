---
title: 节点服务配置与 Systemd
description: 如何将 core-rogue 配置为高可用 24/7 后台系统服务。
---

# 节点服务配置与 Systemd

在 Linux 服务器上维护稳定运行的区块链持久节点，最佳实践是使用 `systemd` 单元服务进行管理。这可以确保进程异常崩溃时自动重启、系统重启时平滑停机，并通过 `journalctl` 实现结构化的日志追踪。

---

## ⚙️ `systemd` 服务配置文件示例

创建配置文件 `/etc/systemd/system/rogue-node.service`：

```ini
[Unit]
Description=Rogue Signal Core Blockchain Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=rogue
Group=rogue
WorkingDirectory=/var/lib/rogue
ExecStart=/usr/local/bin/core-rogue \
  --rogue \
  --datadir /var/lib/rogue/data \
  --http \
  --http.addr 127.0.0.1 \
  --http.port 38845 \
  --http.api eth,net,web3,rogue \
  --port 38888 \
  --maxpeers 50 \
  --metrics

# 可选：通过环境变量动态注入引导节点（以逗号分隔的 enode 列表）
# Environment="ROGUE_BOOTNODES=enode://<pubkey1>@<ip1>:38888,enode://<pubkey2>@<ip2>:38888,enode://<pubkey3>@<ip3>:38888"

Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

---

## 🚀 启用与启动服务

重新加载 `systemd` 守护进程配置，设置开机自动启动并立即启动节点服务：

```bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 设置开机自启
sudo systemctl enable rogue-node

# 启动节点服务
sudo systemctl start rogue-node

# 查看实时运行日志
sudo journalctl -u rogue-node -f
```

---

## 🌐 P2P 引导节点与动态节点发现

Rogue Signal (`core-rogue`) 支持动态注入引导节点（Bootnodes），从而在主网引导节点硬编码至 `params.RogueBootnodes` 之前，便于在开发阶段以及多 VPS 预发布环境中干净地启动网络。

### 解析优先级

当启用 `--rogue` 时，`core-rogue` 按以下优先级顺序解析引导节点：

1. **`--bootnodes` 命令行参数**（最高优先级；覆盖所有其他来源）。
2. **`ROGUE_BOOTNODES` 环境变量**（逗号分隔的 `enode://` URL 列表；当省略 `--bootnodes` 时动态评估）。
3. **`params.RogueBootnodes`**（编译内置的主网引导节点；在主网上线前的开发阶段为空）。
4. **手动 / 静态节点**（`<datadir>/geth/static-nodes.json` 或通过 IPC 调用 `admin.addPeer(...)`）。

### 开发与多验证节点引导 (`ROGUE_BOOTNODES`)

在主网发布前的开发阶段，`params.RogueBootnodes` 刻意保持为空。为确保防日蚀攻击保护（`defaultMinSyncPeers = 3`）以及持续的 **ECBP-1100 (MESS)** 人工终局性（`minArtificialFinalityPeers = 3`），生产环境拓扑应在独立的 VPS 实例上部署**至少 3 个初始验证/种子节点**。

1. **通过 IPC 获取每个验证节点的 enode URL**：
   ```bash
   ./build/bin/core-rogue attach /var/lib/rogue/data/geth.ipc --exec "admin.nodeInfo.enode"
   ```
2. **通过 `ROGUE_BOOTNODES` 动态注入引导节点列表**：
   ```bash
   ROGUE_BOOTNODES="enode://<pubkey1>@<vps1-ip>:38888,enode://<pubkey2>@<vps2-ip>:38888,enode://<pubkey3>@<vps3-ip>:38888" \
     ./build/bin/core-rogue --rogue --datadir /var/lib/rogue/data --port 38888 --http --http.port 38845
   ```

:::note 小型测试网拓扑（< 3 个节点）
如果您运行孤立的单节点或双节点本地测试网，初始同步仍会通过 10 秒周期的 `forceSyncCycle` 定时器正常推进，而 `minArtificialFinalityPeers = 3` 可确保在连接 3 个及以上节点后重新激活完整的 MESS 阈值保护。
:::

---

## 🛡️ 协议加固与 EVM 配置基线（第 0 号区块）

`RogueChainConfig` 从第 0 号区块起即激活经过加固的现代化 EVM 基线，同时保留传统（`Type 0`）交易的简洁性与可预测的 Gas 费用：

* **Berlin 与 London 安全 EIP：** `EIP-2565`（ModExp）、`EIP-2929`（针对 50M Gas 区块防 I/O DoS 的冷/热状态访问 Gas 重定价）、`EIP-3529`（Gas 退款上限）以及 `EIP-3541`（拒绝 `0xEF` 合约字节码）。
* **Shanghai 与 Cancun 操作码：** `EIP-3651`（预热 `COINBASE`）、`EIP-3855`（`PUSH0`）、`EIP-3860`（initcode 大小限制与计量）、`EIP-6049`、`EIP-5656`（`MCOPY`）以及 `EIP-1153`（`TSTORE`/`TLOAD`）。
* **TxPool 与 RPC 防 DoS：** `TxPool` 限制为 `3072` 个全局槽位 / `1024` 个排队槽位（约 128 MB 最大内存上限），`PriceLimit = 1 GWei`，并支持按 IP 限制 HTTP/WebSocket 并发连接数（`--http.maxconnsperip`，默认 `100`，超出返回 `HTTP 429` 及 `Retry-After: 1`）。
* **反向代理加固 (`--http.trustedproxies`)：** 默认采用 fail-closed 策略（直接使用直连对端 IP）。当部署在 Nginx、Caddy、Traefik 或 Cloudflare 后方时，配置 `--http.trustedproxies "127.0.0.1/32"`（或您的代理 CIDR 网段），通过 **Rightmost Untrusted IP** 算法从 `X-Forwarded-For`（回退至 `X-Real-IP`）中提取真实客户端 IP，防止请求头伪造绕过。
* **批量区块头验证缓存：** `MaxResolvedSeedCache = 2048`（约 80 KB 内存）可防止并行 `VerifyHeaders` 同步批次期间发生 LRU 缓存抖动。

