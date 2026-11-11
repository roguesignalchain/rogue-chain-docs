---
title: RandomX CPU 挖矿指南
description: 使用消费级 CPU 与 RandomX 算法进行 ROGUE 挖矿的完整操作指南。
---

# RandomX CPU 挖矿指南

**Rogue Signal** 的挖矿体系基于 **RandomX** (`rx/0`) 构建，这是业界顶尖的抗 ASIC 工作量证明算法。通过设计深度镜像现代通用计算机 CPU 指令集的执行模型，专用矿机 ASIC 无法在通用处理器面前获得任何经济或效率层面的代差优势。

---

## ⛏️ 通过 `core-rogue` 核心节点进行独立挖矿（Solo Mining）

直接通过核心节点守护进程启动本地独立挖矿，将区块奖励铸造至您的收款地址：

```bash
./build/bin/core-rogue \
  --rogue \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xYourRogueAddressHere
```

### 独立挖矿参数说明
* `--mine`：激活节点内置的 RandomX CPU 挖矿多线程引擎。
* `--miner.threads <N>`：分配用于哈希运算的 CPU 线程数（用户 100% 自主配置；最佳算力效率为 `L3 缓存容量 (MiB) / 2`）。
* `--miner.etherbase <0x...>`：接收出块奖励的钱包地址（每个有效区块可获得 **23.75 ROGUE** 基础奖励 + 100% 的区块打包交易手续费）。

---

## 💻 使用 Rogue 桌面客户端进行图形化挖矿

对于偏好直观图形界面的矿工用户：

1. 打开 **Rogue 桌面客户端（Rogue Desktop Client）**。
2. 切换至 **矿工（Miner）** 标签页。
3. 拖动滑块选择分配的 CPU 挖矿线程数；若系统内存充裕，建议勾选开启 **全模式 Fast Mode (2080 MiB RAM)**。
4. 点击 **开始挖矿（Start Mining）**。
5. 界面将实时刷新动态算力仪表盘、已提交有效哈希数以及最新爆出的链上区块。

---

## 🛡️ 抗矿场与抗垄断架构：仅限全节点独立挖矿（禁用 Stratum / 禁用 `eth_getWork`）

为坚定捍卫全网算力去中心化，防止大型数据中心商业矿场或云服务器僵尸网络利用单一全节点下挂成百上千个轻量级无状态算力工作机（如 `XMRig`）：

* **永久禁用外部 Stratum 代理桥接与 `eth_getWork`：** `eth_getWork`、`eth_submitWork` 和 `eth_submitHashrate` 等 RPC 接口在共识层已被永久禁用（`consensus/randomx/api.go`）。
* **1 节点 = 1 独立矿工：** 任何参与 PoW 出块的机器都必须本地运行并同步完整的 `core-rogue` EVM 全节点，维护完整的链上账本状态，并在物理内存中独占 2080 MiB 的 RandomX 真实数据集。
* **零人工产量惩罚：** 每一个符合 PoW 共识规则的有效区块，在被打包入链后均能立即获得 100% 的 **25 ROGUE** 全额铸造释放（其中 `23.75 ROGUE` 直接发放给矿工，`1.25 ROGUE` 归入协议国库）。

