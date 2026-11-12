---
title: 共识参数与 LWMA-1 难度调整
description: 数学共识规则、动态难度调节机制与 ROGUE 货币发行模型。
---

# 共识参数与 LWMA-1 难度调整

Rogue Signal 构建了高规格的机构级共识安全架构，旨在杜绝时间戳操纵、区块预留自私攻击以及全网算力的剧烈震荡。

---

## 📐 LWMA-1 难度调整算法

不同于比特币长达 2016 个区块的静态难度窗口，亦不同于历史以太坊经典旧版的难度炸弹，Rogue Signal 基于 **LWMA-1**（线性加权移动平均）算法在**每一个独立区块**动态重新计算目标难度，评估窗口取值 `N = 60`：

```text
Next Target = (Average Target * sum(i * delta_t_i)) / (0.5 * N * (N + 1) * T)
```

参数定义：
* `N = 60`（历史采样区块数，约 30 分钟观察窗口）
* `T = 30s`（目标区块确认间隔时间）
* `delta_t_i = clamp(t_i - t_{i-1}, 1s, 6*T)`（出块耗时差值被严格限制在 `1s` 至 `180s` 之间）
* 单区块难度调整幅度相对于父区块 `parent.Difficulty` 限制在 `67%` (`MaxClampDownFactor`) 到 `133%` (`MaxClampUpFactor`) 之间。

### 为何采用 LWMA-1？
* **独立于候选区块自身时间戳：** 第 `N` 号区块的难度完全基于已闭合的历史区块（`N-k .. N-1`）计算。矿工绝不可能通过伪造自身候选区块的 `header.Time` 来恶意降低自身出块难度。
* **确定性祖先验证：** 若 LWMA-1 观察窗口内缺失任何中间祖先区块，引擎将确定性拒绝验证并返回 `consensus.ErrUnknownAncestor`，坚决不回退使用过期的陈旧难度值。
* **秒级敏捷响应：** 平稳平滑地自适应全网算力的突发性飙升或快速跌落。
* **免疫算力租借与闪电挖矿攻击：** 短期租借的大规模突发算力无法在撤离前恶意压低全网难度而让网络陷入瘫痪。

---

## ⏱️ 严格的时间戳与区块头规则

为有效防范时间扭曲（Timewarp）、自私难度操纵及区块头膨胀攻击：

1. **严格 MTP-11（过去中位数时间）：**
   * 第 `H` 号区块的时间戳必须严格大于其前 11 个区块（`H-11` 至 `H-1`）的时间戳中位数。在本地组装区块（`Prepare`）时，若历史时间乱序导致 `parent.Time + 1 <= MTP-11`，节点会自动平推校正为 `header.Time = MTP-11 + 1`。
2. **未来时间偏移限制：**
   * 候选区块的时间戳与本地节点当前真实物理墙上时间（Wall-clock time）的偏差绝对值不得超过 **30 秒**。超出此漂移区间的未来区块将被立即丢弃。
3. **区块头 `ExtraData` 限制（`64 字节`）与两阶段并行验证：**
   * `header.Extra` 严格限制在 `64 字节` 以内（`MaxExtraDataSize`）。`VerifyHeaders` 在微秒级先验证轻量级区块头规则，随后将密集的 RandomX `VerifySeal` 分派至 `runtime.NumCPU()` 个并行协程高效执行。
4. **彻底禁用叔块（Uncle Block）机制（`UncleHash == EmptyUncleHash`）：**
   * `header.UncleHash` 必须严格等于 `types.EmptyUncleHash`。Rogue Signal 采用纯正比特币单链树模型（`ErrUnclesNotAllowed`），彻底根除叔块延展性攻击与叔块套利漏洞。

---

## 🛡️ 防 51% 攻击终局性保护

1. **第 0 号区块原生激活 ECBP-1100 (MESS)：**
   * 延迟的秘密私有分叉将面临三次多项式重力惩罚，要求其累计难度必须高达本地子链的 **`31 倍`**。
   * 校准了 **15 分钟安全间隔**（`artificialFinalitySafetyInterval = 900s`，即 30 个区块 $\times$ 30 秒），以防止在正常 PoW 出块波动期间误判陈旧链。
2. **防自私挖矿平局裁决机制：**
   * 当遇到等累计难度的区块分叉时，优先保护本地已开采的区块；对于外部对等竞争区块，采用密码学安全的随机数发生器（`crypto/rand`）进行 50/50 独立裁决。

---

## 💰 货币发行模型与减半周期

* **初始区块奖励：** 25 ROGUE
* **减半周期节奏：** 每 2,000,000 个区块（按照 30 秒出块，约 1.90 年 / ~694.44 天）
* **矿工分成比例 (95%)：** 初始阶段为 23.75 ROGUE（+ 100% 的区块交易手续费）
* **协议国库分成 (5%)：** 初始阶段为 1.25 ROGUE
* **最大总供应量上限：** 100,000,000 ROGUE（经过 32 个减半纪元后达到的严谨数学极限：25 * 2,000,000 * 2 = 100,000,000 ROGUE，零尾部增发）

---

import BadgeGallery from '@site/src/components/BadgeGallery';

## 🏆 协议级游戏化与矿工荣誉等级系统

为了在不改变网络货币硬顶和共识难度的情况下激励可持续、去中心化的家庭独立挖矿，Rogue Signal 在规范状态树（Canonical State Trie）中原生记录矿工的有效出块总数：

* **状态持久化：** 在 `core/state_processor.go` 中完成区块终结时，于系统合约地址 `0x0000000000000000000000000000000000000020` 的存储槽 `keccak256(miner.Bytes())` 处自动递增。
* **激活窗口：** 从第 1 号区块起激活，保持创世区块 0 的状态根完整不受修改。
* **确定性重组回滚安全：** 发生深度在 90 区块以内的合法重组时，矿工的出块计数会随孤儿链区块自动平退回滚。

### 矿工等级徽章展厅

<BadgeGallery />

### 荣誉段位与升级技术规范

| 勋章 | 等级 | 称号 | 累计出块要求 | 升级目标 XP |
|:---:|---|---|---|---|
| <img src="/img/badges/lvl0.png" width="64" height="64" className="badge-img zoomable" alt="Level 0 - Unranked Runner" title="点击放大查看" /> | **Level 0** | *Unranked Runner* (无阶信标手) | 0 | 1 |
| <img src="/img/badges/lvl1.png" width="64" height="64" className="badge-img zoomable" alt="Level 1 - Recon Runner" title="点击放大查看" /> | **Level 1** | *Recon Runner* (侦察信标手) | 1 – 24 | 25 |
| <img src="/img/badges/lvl2.png" width="64" height="64" className="badge-img zoomable" alt="Level 2 - Signal Scraper" title="点击放大查看" /> | **Level 2** | *Signal Scraper* (信号拾荒者) | 25 – 99 | 100 |
| <img src="/img/badges/lvl3.png" width="64" height="64" className="badge-img zoomable" alt="Level 3 - Hash Warden" title="点击放大查看" /> | **Level 3** | *Hash Warden* (哈希守卫者) | 100 – 499 | 500 |
| <img src="/img/badges/lvl4.png" width="64" height="64" className="badge-img zoomable" alt="Level 4 - Cipher Architect" title="点击放大查看" /> | **Level 4** | *Cipher Architect* (密码架构师) | 500 – 2,499 | 2,500 |
| <img src="/img/badges/lvl5.png" width="64" height="64" className="badge-img zoomable" alt="Level 5 - Apex Operator" title="点击放大查看" /> | **Level 5** | *Apex Operator* (顶级操盘手) | 2,500 – 9,999 | 10,000 |
| <img src="/img/badges/lvl6.png" width="64" height="64" className="badge-img zoomable" alt="Level 6 - Rogue Singularity" title="点击放大查看" /> | **Level 6** | *Rogue Singularity* (奇点主宰) | 10,000+ | 10,000 (满级) |

:::tip 交互式勋章画廊缩放
点击画廊或表格中的任意勋章，即可唤起全屏灯箱，查看超高分辨率赛博朋克艺术原画、段位晋升条件及世界观背景设定。
:::

