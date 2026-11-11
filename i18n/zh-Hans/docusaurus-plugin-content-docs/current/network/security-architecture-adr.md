---
title: 共识安全架构与架构决策记录 (ADR)
description: Rogue Signal 全面共识安全架构、防 51% 攻击技术屏障及架构决策记录 (ADR-001 至 ADR-006)。
---

# 共识安全架构与架构决策记录 (ADR)

本文档是 **Rogue Signal (Chain ID `800055`)** 的官方工程规范与密码经济学架构决策记录（Architecture Decision Record, ADR）。全面记录了协议各项安全分层、在 `rogue-core-chain` 与 `rogue-desktop-client` 中落地的底层共识防护、抵御的攻击向量、经过论证的备选技术路线，以及每条共识规则背后的数学与热力学物理依据。

---

## 1. 核心网络与共识安全总控矩阵

| 参数项 | 官方规范值 | 源码模块归属 | 安全与经济设计目的 |
| :--- | :--- | :--- | :--- |
| **网络名称** | `Rogue Signal` | `params/config_rogue.go` | 生产级 EVM 智能合约 Layer 1 工作量证明公链 |
| **代币符号** | `ROGUE` | 全生态通用 | 原生底层资产（`18` 位小数，`10^18 wei`） |
| **链 ID / 网络 ID** | `800055` (`0xc3537`) | `params/config_rogue.go` | 严格防重放攻击保护（`EIP-155` 从第 0 号区块起强制生效） |
| **PoW 算法** | `RandomX (rx/0)` | `consensus/randomx/` | 通过动态指令集与 CPU L3 缓存依赖实现真正的抗 ASIC 和抗 GPU |
| **目标出块时间 (`T`)** | `30 秒` | `DefaultTargetBlockTime` (`difficulty.go`) | 在严格禁用叔块的规则下，将全球 P2P 孤块率压低至 `< 0.5%` |
| **初始基础区块奖励** | `25 ROGUE` | `InitialBaseReward` (`rewards.go`) | 按 30 秒节奏等比放大 `3 倍`，保持既定的 2 年减半与发行曲线 |
| **奖励分成比例** | `95% 矿工 / 5% 国库` | `SplitReward` (`rewards.go`) | `23.75 ROGUE` 矿工分配 / `1.25 ROGUE` 归属协议持续研发国库 |
| **减半周期跨度** | `2,000,000 个区块` (~1.90 年) | `HalvingInterval` (`rewards.go`) | 奖励每隔 `2,000,000 * 30s` 减半（~694.44 天 / ~1.90 年） |
| **最大供应量上限** | `100,000,000 ROGUE` | `MaxSupplyCap` (`rewards.go`) | 经历 32 个减半纪元后达到的严谨数学硬顶（`MaxHalvingEras = 32`），零尾部增发 |
| **难度调整算法 (DAA)** | `LWMA-1 (N = 60)` | `CalculateDifficulty` (`difficulty.go`) | 60 个历史区块（~30 分钟）线性加权移动平均，单块 `+-33%` 幅度限制 |
| **最低 / 创世初始难度** | `0x10000` (`65,536`) | `MinDifficulty` (`difficulty.go`) | 消费级 CPU 顺畅启动创世开采的初始阈值（~2.1 KH/s） |
| **历史时间戳约束** | `严格 MTP-11` | `CalculateMTP11` (`difficulty.go`) | 强制约束 `header.Time > Median(最近 11 个历史区块)` |
| **未来时钟最大漂移** | `15 秒` | `MaxFutureDrift` (`difficulty.go`) | 强制约束 `header.Time <= 本地真实时间 + 15s` |
| **防 51% 屏障（第 1 层）** | `MaxReorgDepth = 90 区块` | `MaxRogueReorgDepth` (`forkchoice.go`) | 硬性滚动终局性（~45 分钟）；坚决拒绝任何深度恶意重组分叉 |
| **防 51% 屏障（第 2 层）** | 第 0 号区块起激活 `ECBP-1100 (MESS)` | `ECBP1100FBlock = 0` (`blockchain_af.go`) | 多项式重力惩罚曲线，滞后秘密分叉需要高达 `31 倍` 难度才能竞争 |
| **防自私挖矿（第 3 层）** | `Eyal-Sirer 平局决胜规则` | `ReorgNeeded` (`forkchoice.go`) | 累计难度相同时优先保留本地开采区块；对外部区块采用 `crypto/rand` 随机决胜 (50/50) |
| **叔块/孤块策略** | `永久禁用 (ErrUnclesNotAllowed)` | `VerifyUncles` / `verifyHeader` | 纯粹比特币单链树形模型（`header.UncleHash == EmptyUncleHash`） |
| **RandomX 种子轮换** | `2048 个区块` (~17.07 小时) | `EpochLength` (`epoch.go`) | 标准 `rx/0` 种子纪元，带 `SeedLag = 64` 区块（~32 分钟）预计算窗口 |
| **`ExtraData` 最大长度** | `64 字节` | `MaxExtraDataSize` (`randomx.go`) | 允许节点包含标识信息的同时防范区块头膨胀 DoS 拒绝服务攻击 |
| **区块 Gas 上限** | `60,000,000 gas` (`0x3938700`) | `genesis_rogue.go` / `miner.go` | 支撑 30 秒出块周期的高吞吐量 EVM 状态处理能力 |
| **EVM 手续费模型** | `经典 PoW (100% 归矿工)` | `config_rogue.go` / `ethconfig` | 不设 EIP-1559 销毁机制；区块交易手续费在多轮减半后持续激励矿工 |
| **最低交易 Gas 单价** | `1 Gwei` (`10^9 wei`) | `eth/ethconfig/config.go` | 内存池（TxPool）垃圾交易防范底线，杜绝零手续费交易泛滥攻击 |
| **创世区块哈希 (Block 0)** | `0xc6f7f29d6a23f1921f3e514401a82a60ffa1f21885497dbf6414e8bb2f22b91d` | `RogueGenesisHash` (`genesis_rogue.go`) | 硬编码至 `RequireBlockHashes[0]`，实现密码学层级的 P2P 隔离防护 |
| **创世区块密码朋克铭文** | `ROGUE::800055 // THE_SILICON_BELONGS_TO_THE_MANY // 09.11.26` | `genesis.json` / `genesis_rogue.go` | 永久嵌入在第 0 号区块中的 60 字节赛博朋克创世宣言 |

---

## 2. 架构决策记录 (ADRs)

### ADR-001：将目标出块时间从 10 秒延长至 30 秒及货币等比缩放

#### 背景与待解决问题
在一个严格执行纯比特币式单链树形模型（**绝对禁止叔块奖励**，`ErrUnclesNotAllowed`）的全球去中心化 PoW 网络中，区块的发现遵循无记忆性的泊松过程，在 `tau` 秒内发现新区块的理论概率为：

```text
P(delta_t < tau) = 1 - exp(-tau / T)
```

* 当目标出块时间设为 `T = 10 秒` 时，全球有 **18.1%** 的区块会在 `< 2 秒` 内被密集挖出，有 **9.5%** 的区块会在 `< 1 秒` 内被挖出。
* 由于跨洲际 P2P 广播传播延迟加上 RandomX CGo 验证开销（轻模式下每跳约 15-25 ms）以及 EVM 状态执行时间需要 `300 ms` 至 `1.5 秒`，在没有叔块补贴机制的情况下，10 秒的过快节奏会导致极为频繁的区块冲突碰撞（*孤儿块/无效块*）。这会导致使用普通家庭宽带的独立矿工相比低延迟数据中心机房遭受不成比例的孤块惩罚。

#### 决策方案
1. **在 `consensus/randomx/difficulty.go` 中将 `DefaultTargetBlockTime` 从 `10` 秒调整为 `30` 秒**：
   * 在 `T = 30s` 下，小于 1 秒的瞬发出块碰撞概率从 `9.5%` 急剧断崖式降低至 **`3.2%`**，成功将全球网络孤块率压制在 **`< 0.5%`** 以下。
2. **在 `consensus/randomx/rewards.go` 中实施等比例 `3 倍` 货币缩放**：
   * **初始基础奖励 (`InitialBaseReward`)**：从 `8 ROGUE` 调整放大至 **`25 ROGUE`**（其中 `23.75 ROGUE` 分配给矿工 [95%]，`1.25 ROGUE` 划拨至协议国库 [5%]）。
   * **减半周期跨度 (`HalvingInterval`)**：从 `6,300,000` 个区块缩减为 **`2,000,000` 个区块**（在 30 秒出块节奏下：`2,000,000 * 30s = 60,000,000 秒`，约为 `694.44 天`，即 ~1.90 年）。
   * **总供应量绝对守恒不变**：
     ```text
     总发行量 = sum_{k=0..31} (25 / 2^k) * 2,000,000 = 100,000,000 ROGUE (精确 1 亿枚硬顶上限)
     ```
     约 2 年的减半周期节奏与 1 亿 ROGUE 严谨数学硬顶总量保持 100% 绝对守恒。

---

### ADR-002：抗垄断与抗女巫挖矿架构——为何选择经过验证的纯 PoW 标准而非人为冷却限制

#### 背景与评估过的备选方案
我们深度评估了协议是否应在底层强制执行单机算力上限，或对收款地址施加出块冷却限制（`Coinbase Cooldown`）并搭配账户资历成熟度要求（`Anti-Sybil Bond / Historical Lookback`），以防止高算力设备垄断出块。

在做出最终架构决断前，团队严谨论证了以下三种备选技术路线：

1. **备选方案 A — 硬性滑动窗口 `Coinbase Cooldown`（出块冷却）**：
   * *设计构想*：在 `VerifyHeader` 中拒绝任何其 `header.Coinbase` 在最近 10 个区块内已开采 `>= 2` 个区块的提案（带 90 秒的活性安全逃逸阀），并在冷却期间自动暂停本地 CPU 挖矿线程。
   * *否定理由*：因为 PoW 是一个无记忆性的泊松随机过程，即使在一个只有 10 台相同配置家庭电脑的完全对等网络中，诚实矿工出于纯粹的统计方差，也必然会自然连续开采出 3 个区块。强制休眠其 CPU 或拒绝其有效 PoW 提案，实际上白白浪费了全网热力学算力安全，扣押或推迟了诚实矿工的正当收益，并引入了复杂的活性边缘故障隐患。
2. **备选方案 B — 零余额历史回溯成熟度配额与自动质押锁仓**：
   * *探讨课题*：如果新矿工初始持币为 `0 ROGUE`，抗女巫资历或质押规则该如何运作？
   * *评估机制*：
     * **历史区块头回溯资历 (`[N-100, N-11]`)**：无需在 `StateDB` 中拥有代币余额（这会打破无状态的快速区块头同步 *Header Sync*，并为新用户设立“先有鸡还是先有蛋”的进入门槛），矿工地址只需开采出 1 个经过 10 个区块确认的历史区块，便自动获取“老手资历”。在 50 个创世区块后，新地址（`0 ROGUE`）在任何 10 个区块窗口内最多允许挖出 50% 的区块（`MaxFreshMinerBlocksInWindow = 5`），而资历地址则竞争剩余配额并受限于单地址冷却。
     * **协议内自动扣除质押金**：在 `FinalizeAndAssemble` 中自动扣留首个出块奖励的一部分作为临时锁定金库。
   * *否定理由*：虽然历史区块头回溯方案巧妙规避了 `0 ROGUE` 冷启动问题且没有破坏 *Header Sync*，但任何针对新矿工地址的人工硬性配额限制，在面对大量新家庭矿工集中加入网络的涌入浪潮时，依然会人为压制正常的网络出块吞吐量。
3. **备选方案 C — 针对高频矿工的软性难度递增惩罚**：
   * *设计构想*：若同一 `Coinbase` 地址在短窗口内高频出块，则将其目标难度临时上调 `+10%`。
   * *否定理由*：高级矿工可以通过 HD 钱包动态轮换生成无限个收款地址轻松绕过此限制，最终只会误伤那些仅使用单一静态地址的普通小白用户。

#### 最终决策：经过实战检验的纯 PoW 标准（4 层物理与协议级去中心化屏障）
遵循 **Monero、Bitcoin 与 Ethereum Classic** 经过十余年残酷实战验证的行业标准，**彻底废除所有人工挖矿冷却与收益截流限制**（每一个合法的 PoW 区块在打包后立即获得 100% 的奖励释放，用户可自由调配 100% 的 CPU 线程）。转而通过 **4 重不可逾越的结构性物理与协议屏障** 彻底瓦解数据中心矿场与专用硬件的垄断优势：

1. **RandomX (`rx/0`) CPU L3 缓存物理瓶颈**：每个挖矿哈希线程必须独占 **2 MiB 的物理 CPU 三级缓存**，并对 **2080 MiB 的 RAM 数据集** 进行高频随机寻址。ASIC 无法低成本定制随机动态虚拟机，GPU 遭遇严重的分支发散延迟惩罚，而多路服务器 CPU 则受制于内存总线争抢带宽瓶颈。
2. **彻底剔除 Stratum 协议与远程挖矿 RPC 接口（永久禁用 `eth_getWork`）**：在 `consensus/randomx/api.go` 中，永久禁用了 Stratum 桥接及 `eth_getWork` / `eth_submitWork` / `eth_submitHashrate`。大型矿场无法将 500 台轻量级 `XMRig` 无状态矿机指向同一节点：**每一台参与算力竞争的机器都必须本地运行并同步完整的 `core-rogue` EVM 全节点**，拥有独立的账本数据库和专属的 2080 MiB 内存上下文。
3. **30 秒出块节奏**：消除了数据中心专用光纤网络面对家庭宽带连接时的微秒级 P2P 广播优势。
4. **LWMA-1 (`N=60`) + ECBP-1100 (MESS) + `MaxReorgDepth = 90`**：彻底阻断了租借云服务器 CPU 实施的 51% 突发攻击与“算力跳跃（Coin-hopping）”套利行为。

---

### ADR-003：三层防 51% 攻击终局性防护 (`MaxReorgDepth = 90` + `ECBP-1100 MESS` + 防自私挖矿)

#### 背景与待解决问题
在采用 CPU 挖矿的早期公链中，攻击者往往可能短期租用大量云服务器，在离线状态下秘密开采一条私自分叉链（*影子链 Secret Shadow Chain*），随后一次性广播上线，实施深度回滚重组攻击（*长程 51% 双花攻击*）。

#### 决策方案
我们在 `core/forkchoice.go`、`core/blockchain.go` 与 `params/config_rogue.go` 中落地了**从第 0 号区块起全局生效的三层分叉选择防御体系**：

1. **第 1 层 — 硬性滚动终局性 (`core/forkchoice.go` 中的 `MaxRogueReorgDepth = 90` 个区块)**：
   * 在 RandomX 共识下接受任何链分叉重组之前，`ForkChoice.ReorgNeeded` 会精确计算从当前规范头节点（`current`）回滚至最近公共祖先节点（`commonHeader`）的回滚深度：
     ```text
     reorgDepth = current.Number - commonHeader.Number
     ```
   * 若 `reorgDepth > 90` 个区块（在 30 秒出块节奏下约为 45 分钟），无论攻击链声称的累计总难度（Total Difficulty）有多高，**一律无条件直接拒绝重组**。
   * 新节点从创世区块开始正常的向前追赶同步，由于其 `commonHeader == current`（`reorgDepth == 0`），完全不受此规则限制。
2. **第 2 层 — 改进型指数级主观评分 (`core/blockchain_af.go` 中的 `ECBP-1100 MESS`)**：
   * 从第 0 号区块强制生效（`RogueChainConfig` 中设定 `ECBP1100FBlock = 0`，并在 `NewBlockChain` 中默认开启）。
   * 对于深度在 `1..90` 个区块之间的分叉，MESS 根据公共祖先的滞后时间差（`delta_t = current.Time - commonAncestor.Time`）施加三次多项式重力惩罚系数，要求恶意隐秘分叉链必须开采出高达本地主链 **`31 倍`** 的累计绝对难度才会被网络接纳。
3. **第 3 层 — 防自私挖矿平局决胜机制 (`core/forkchoice.go` 中的 Eyal-Sirer 规则)**：
   * 当出现外部链难度与本地链完全相同（`externTd == localTD`）时，节点坚决优先维护自身本地已挖出的区块（`currentPreserve`）；当竞争双方均为外部对等节点时，采用密码学伪随机数（`crypto/rand`）进行完全不可预测的 50/50 独立仲裁决胜。

---

### ADR-004：时间扭曲、自身难度操纵与闪电挖矿防御

1. **`LWMA-1` 中独立于候选区块自身时间戳**：
   * 在 `consensus/randomx/difficulty.go` 中，`CalculateDifficulty(chain, time, parent)` 计算第 `N` 号区块的难度时，完全只采纳已闭合的历史区块 `[N-k .. N-1]`。矿工绝对无法通过恶意篡改自身候选区块的 `header.Time` 来人为拉低出块难度。
2. **确定性祖先验证**：
   * 若 LWMA-1 观察窗口内缺失任何中间历史祖先区块，`CalculateDifficulty` 会确定性抛出 `consensus.ErrUnknownAncestor` 错误，坚决不回退使用陈旧无效的过期难度。
3. **单块出块耗时上下限与调整幅度钳制 (`+-33%`)**：
   * 60 个历史区块窗口中的单个出块耗时差值被严格限制在 `[1s, 6 * T = 180s]` 之间，且每个独立区块的难度调整幅度相对于父区块 `parent.Difficulty` 强制限定在 **`67%`** (`MaxClampDownFactor`) 至 **`133%`** (`MaxClampUpFactor`) 之间。
4. **严格 `MTP-11` + `15s` 未来时间漂移限制 + `Prepare()` 时间戳自适应对齐**：
   * `VerifyHeaderTime` 强制校验 `header.Time > CalculateMTP11(chain, parent)` 且 `header.Time <= 当前真实时间 + 15s`。
   * 在 `RandomX.Prepare`（`consensus/randomx/randomx.go`）中，若前 11 个区块中乱序的时间戳导致计算出的 `header.Time <= CalculateMTP11(chain, parent)`，`Prepare` 会自动平推调整为 `header.Time = mtp + 1`，确保本地独立矿工永远不会因本地时钟微小偏差而密封出违反 `ErrOlderBlockTime` 规则的非法区块。

---

### ADR-005：CGo 内存安全、并发上下文生命周期管控与两阶段并行 `VerifyHeaders`

1. **CGo 内存释放后使用 (Use-After-Free) 修复与空 VM 防御 (`consensus/randomx/rx_cgo.go`)**：
   * 在整个 VM 实例池检出及 `C.randomx_calculate_hash` 调用全流程中，通过 `defer ctx.mu.RUnlock()` 持有读锁 `ctx.mu.RLock()`，彻底避免外部 `ctx.Close()` 在任何计算线程正在执行哈希运算时释放 C++ 数据集和缓存内存。
   * `CalculateHash` 增加了接口类型断言与非空 C 语言 VM 指针的防御性校验（`!ok || vm == nil || vm.raw == nil`），在极端内存压力下返回结构化错误，杜绝底层触发段错误（Segmentation fault）或进程 Panic 崩溃。
2. **种子纪元并发节流与上下文数量封顶 (`consensus/randomx/epoch.go`)**：
   * `EpochManager` 内部通过信号量通道（`allocSem`，容量限制为 2）对 CGo 数据集的并发分配进行硬性节流，防范对等节点恶意广播冲突区块头导致的内存耗尽 DoS 攻击。
   * 内存缓存上下文数量严格限制为 `MaxCachedContexts = 3`，采用 LRU（最近最少使用）机制自动淘汰旧纪元。
   * 杜绝在 `GetSeed` 中因处理侧链分叉种子而误删当前规范主链上下文，确保本地独立挖矿线程绝不会被后台侧链同步中断打扰。
3. **对 CPU 友好的后台数据集预计算 (`NewFastDataset`)**：
   * 数据集初始化过程严格将并行工作协程数限制为 `max(1, runtime.NumCPU() / 2)`，确保在 64 区块（~32 分钟）的 `SeedLag` 预计算延迟窗口内，保留至少 50% 的 CPU 硬件资源供 P2P 网络通信与正在进行的活跃挖矿平稳使用。
4. **两阶段快速失败并行 `VerifyHeaders`、ExtraData 长度限制与禁用叔块**：
   * **第 1 阶段（微秒级快速失败）**：在接触繁重的 CGo 逻辑前，优先在 Go 原生层高速验证轻量级规则（`len(header.Extra) <= 64`、`header.UncleHash == EmptyUncleHash`、`MTP-11 + 15s 漂移`、`LWMA-1 难度`、`GasUsed <= GasLimit` 以及拒绝非空硬分叉保留字段）。
   * **第 2 阶段（并行工作协程池）**：将计算密集的 `VerifySeal` 任务分派至 `runtime.NumCPU()` 个工作协程并发执行，极大加速了区块头批量同步速度，化解了针对共识验证的 CPU 耗竭型攻击。

---

### ADR-006：P2P 创世密码学硬编码锚定、内存池防垃圾机制与桌面 RPC 访问盲化

1. **创世区块哈希硬编码锚定 (`RequireBlockHashes[0]`)**：
   * 第 0 号创世区块（时间戳 `1762711936` / `0x6910d980`，嵌入赛博朋克铭文 `"ROGUE::800055 // THE_SILICON_BELONGS_TO_THE_MANY // 09.11.26"`）产生权威确定的创世哈希：
     ```text
     0xc6f7f29d6a23f1921f3e514401a82a60ffa1f21885497dbf6414e8bb2f22b91d
     ```
   * 该哈希在 `params/config_rogue.go` 的 `RogueChainConfig.RequireBlockHashes[0]` 中进行静态强制校验，并与 `genesis.json` 保持 100% 密码学一致。
2. **交易内存池 (`TxPool`) 最低 Gas 单价防线**：
   * 默认 `TxPool.PriceLimit` 与矿工默认 `GasPrice` 强制设定为 **`1 Gwei` (`10^9 wei`)**，并将单区块 Gas 上限设为 `GasCeil = 60,000,000`（`eth/ethconfig/config.go`, `miner/miner.go`）。
3. **桌面客户端 RPC 接口与 CORS 跨域安全收敛**：
   * 在 `rogue-desktop-client/src-tauri/src/process_manager.rs` 中，`--http.corsdomain` 与 `--ws.origins` 严格收敛至本地受信源 `tauri://localhost,http://tauri.localhost,http://localhost:1420,http://127.0.0.1:1420`，并在默认开放列表中彻底移除了过时的 `personal` 命名空间。
4. **实时共识自检诊断与幂等状态控制**：
   * 在 `consensus/randomx/api.go` 中新增了 `randomx_getEpochInfo` 与 `randomx_getConsensusStatus` 诊断接口，全面暴露实时共识、种子纪元、区块奖励分配以及防 51% 终局性运行参数。
   * 像 `randomx_setFastMode` 这类核心节点控制指令，已在 `RandomX`、`EpochManager` 和 `API` 层面实现完备的幂等性保证。

