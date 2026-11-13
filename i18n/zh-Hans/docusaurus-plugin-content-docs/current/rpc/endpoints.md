---
title: JSON-RPC API 接口参考
description: 标准以太坊与 RandomX 独有 RPC 接口的完整开发调用手册。
---

# JSON-RPC API 接口参考

`core-rogue` 核心节点通过 HTTP（`http://127.0.0.1:8545`）与 WebSocket（`ws://127.0.0.1:8546`）暴露完全符合 **以太坊 JSON-RPC 2.0** 规范的接口服务。

---

## 🔌 标准网络核心接口

### `eth_chainId`
以十六进制格式返回当前区块链网络的链 ID（Chain ID：`0xc3537` = `800055`）。

#### 请求示例
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### 响应示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xc3537"
}
```

---

### `eth_blockNumber`
以十六进制格式返回当前本地节点已同步的最新区块高度。

#### 请求示例
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### 响应示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x4b20"
}
```

---

### `eth_getBalance`
返回指定账户地址的 ROGUE 资产余额（单位：Wei）。

#### 请求示例
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x4290352A98018e61294F9c2794D0A50F59530590", "latest"],"id":1}' \
  http://127.0.0.1:8545
```

#### 响应示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x6f05b59d3b20000"
}
```

---

### `net_peerCount`
返回当前与本节点保持活跃连接的 P2P 对等节点数量。

#### 请求示例
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### 响应示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x12"
}
```

---

## ⚡ RandomX 共识与挖矿专属接口 (`randomx_*`)

RandomX 共识引擎在 `randomx` 与 `eth` 命名空间下暴露了专用的诊断与控制接口。请注意，外部矿池/算力代理接口（`eth_getWork`、`eth_submitWork`、`eth_submitHashrate`）在设计上已被永久禁用，以坚决推行全节点独立挖矿（Solo Mining）。

### `randomx_getConsensusStatus`
返回当前实时的共识参数、当前区块高度、实时难度、区块奖励拆分（`25 ROGUE`：`23.75` 矿工 / `1.25` 国库）、减半倒计时、虚拟机池遥测数据（`vmPool`）以及已激活的防 51% 安全防御参数（`ECBP-1100 (MESS)`）。

#### 请求示例
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"randomx_getConsensusStatus","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### 响应示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "algorithm": "RandomX (rx/0)",
    "targetBlockTime": 30,
    "lwmaWindow": 60,
    "mtpWindow": 11,
    "maxFutureDrift": 30,
    "maxExtraDataSize": 64,
    "finalityMode": "ECBP-1100 (MESS)",
    "messActive": true,
    "unclesAllowed": false,
    "remoteMiningAllowed": false,
    "currentBlock": 120,
    "currentEra": 0,
    "halvingInterval": 2000000,
    "blocksUntilHalving": 1999880,
    "blockRewardWei": "25000000000000000000",
    "minerRewardWei": "23750000000000000000",
    "treasuryRewardWei": "1250000000000000000",
    "treasuryAddress": "0xe9aae535b7971a9ac8c6af0e4b524d02260d3a03",
    "fastMode": false,
    "localHashrate": 1450,
    "vmPool": {
      "totalVMs": 2,
      "activeVMs": 0,
      "mode": "light",
      "allocatedMemoryMB": 256
    }
  }
}
```

---

### `randomx_getEpochInfo`
返回当前 RandomX 种子纪元元数据、种子区块高度（`E * 2048 - 64`）、当前活跃的 256 位种子哈希以及下一纪元预计算窗口状态（`SeedLag = 64` 个区块）。

#### 请求示例
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"randomx_getEpochInfo","params":[],"id":1}' \
  http://127.0.0.1:8545
```

#### 响应示例
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "blockNumber": 120,
    "epoch": 0,
    "epochLength": 2048,
    "seedLag": 64,
    "seedBlock": 0,
    "seedHash": "0xde4c5e747fbb072d39db2ece5a245e46b6164045e166301dfdba78f86cfbe4dd",
    "nextEpochBlock": 2048,
    "blocksRemaining": 1928,
    "nextSeedBlock": 1984,
    "nextSeedReady": false,
    "fastMode": false
  }
}
```

---

### `randomx_getHashrate` / `randomx_setFastMode` / `randomx_getFastMode`
* `randomx_getHashrate`: 返回节点内部 RandomX CPU 挖矿哈希速率（单位：每秒哈希数 H/s，`uint64`）。
* `randomx_setFastMode(bool)`: 为下一个初始化的 RandomX 上下文切换 **轻模式 Light Mode**（~256 MiB 缓存）与 **全模式 Fast Mode**（~2080 MiB RAM 数据集）。
* `randomx_getFastMode()`: 若已开启全模式 Fast Mode，返回 `true`。

---

## 🏆 链上矿工声誉合约 (`RogueMinerReputation` 地址 `0x...0020`)

矿工等级、经验值、进度 (`progressBps`)、多语言头衔 (`en`、`es`、`zh`) 与勋章 URI 均由创世区块（Block 0）部署的 `RogueMinerReputation` 系统合约 (`0x0000000000000000000000000000000000000020`) 直接在链上提供。旧版 `rogue_*` RPC 命名空间已下线，统一改用标准 EVM `eth_call` 与智能合约 `STATICCALL` 组合调用。

### 使用 Foundry `cast` 查询 (`eth_call`)

```bash
# 获取数字等级 (0..6)
cast call 0x0000000000000000000000000000000000000020 \
  "getMinerLevel(address)(uint32)" \
  0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7 \
  --rpc-url http://127.0.0.1:38845

# 获取本地化完整数据 ("en", "es", "zh")
cast call 0x0000000000000000000000000000000000000020 \
  "getMinerStats(address,string)((uint256,uint32,string,string,uint256,uint256,uint16))" \
  0x2fB9D05d39A1eE37Fce2F00964D3B00C0a8677c7 "zh" \
  --rpc-url http://127.0.0.1:38845
```

#### 荣誉晋升阶梯表

| 勋章 | 等级 | 称号 | 累计出块要求 | 升级目标 XP |
|:---:|---|---|---|---|
| <img src="/img/badges/lvl0.png" width="56" height="56" className="badge-img zoomable" alt="Level 0 - Unranked Runner" title="点击放大查看" /> | **0** | *Unranked Runner* (无阶信标手) | 0 | 1 |
| <img src="/img/badges/lvl1.png" width="56" height="56" className="badge-img zoomable" alt="Level 1 - Recon Runner" title="点击放大查看" /> | **1** | *Recon Runner* (侦察信标手) | 1 – 24 | 25 |
| <img src="/img/badges/lvl2.png" width="56" height="56" className="badge-img zoomable" alt="Level 2 - Signal Scraper" title="点击放大查看" /> | **2** | *Signal Scraper* (信号拾荒者) | 25 – 99 | 100 |
| <img src="/img/badges/lvl3.png" width="56" height="56" className="badge-img zoomable" alt="Level 3 - Hash Warden" title="点击放大查看" /> | **3** | *Hash Warden* (哈希守卫者) | 100 – 499 | 500 |
| <img src="/img/badges/lvl4.png" width="56" height="56" className="badge-img zoomable" alt="Level 4 - Cipher Architect" title="点击放大查看" /> | **4** | *Cipher Architect* (密码架构师) | 500 – 2,499 | 2,500 |
| <img src="/img/badges/lvl5.png" width="56" height="56" className="badge-img zoomable" alt="Level 5 - Apex Operator" title="点击放大查看" /> | **5** | *Apex Operator* (顶级操盘手) | 2,500 – 9,999 | 10,000 |
| <img src="/img/badges/lvl6.png" width="56" height="56" className="badge-img zoomable" alt="Level 6 - Rogue Singularity" title="点击放大查看" /> | **6** | *Rogue Singularity* (奇点主宰) | 10,000+ | 10,000 (满级) |

:::tip
点击任意勋章缩略图，即可唤起全屏高清灯箱查看。
:::

