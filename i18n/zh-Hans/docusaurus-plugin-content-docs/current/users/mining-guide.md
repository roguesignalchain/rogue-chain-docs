---
sidebar_position: 4
title: RandomX CPU 挖矿指南
description: "通过 core-rogue CLI 或 Rogue Desktop Client 使用 RandomX (rx/0) 在消费级 CPU 上独立挖矿 ROGUE 的完整指南。"
---

# RandomX CPU 挖矿指南

**Rogue Signal** 的挖矿机制基于 **RandomX (`rx/0`)**——一种专为在通用 CPU 上执行随机指令序列而设计的抗 ASIC 工作量证明算法。由于 RandomX 高度依赖 CPU 分支预测、浮点运算单元、L3 缓存及高带宽系统内存，专用 ASIC 和 GPU 无法在能效上超越普通消费级处理器。

---

## 🛡️ 抗矿场架构：仅限全节点独立挖矿

为保护网络去中心化，并防止工业矿场或僵尸网络将成百上千个无状态轻量级矿工（`XMRig`）指向单一节点：

* **永久禁用外部 Stratum 矿池协议与 `eth_getWork`：** `eth_getWork`、`eth_submitWork` 和 `eth_submitHashrate` RPC 方法已在共识层被永久禁用（`consensus/randomx/api.go`）。
* **1 节点 = 1 独立矿工：** 每台参与工作量证明（PoW）的机器都必须运行一个完全同步的 `core-rogue` 节点，拥有独立的 EVM 状态与 RandomX 内存上下文。
* **区块奖励分配：** 每个有效挖出的区块铸造 **25 ROGUE**（`23.75 ROGUE` / 95% 归矿工 `etherbase` + `1.25 ROGUE` / 5% 归协议金库），外加 **100% 的区块交易手续费**归矿工所有。

---

## 💻 方式 1：使用 Rogue Desktop Client 进行图形化挖矿

适合偏好图形界面的用户：

1. 打开 **Rogue Desktop Client** 并确保已创建或解锁钱包。
2. 等待侧边栏节点状态显示已连接对等节点且同步达到 `100%`。
3. 进入 **Mining** 标签页。
4. 点击 **Check System Resources**（可选）以检测 CPU 逻辑核心数与可用内存。
5. 选择内存模式：
   * **轻量模式（~256 MiB RAM，默认）：** 适合后台挖矿或 4–8 GB 内存的机器。
   * **快速模式（~2080 MiB RAM）：** 分配完整的 2.08 GB RandomX 数据集以获得最高 CPU 算力。建议在专用矿机或 16 GB+ 内存的设备上使用。
6. 调整 **CPU Threads** 滑块（最佳效率通常为 `L3 缓存 (MiB) / 2`）。
7. 点击 **Start Mining**。实时算力（`H/s`）、运行状态及已发现的区块将实时更新。

---

## ⛏️ 方式 2：使用 `core-rogue` CLI 独立挖矿

直接从命令行启动挖矿：

```bash
./core-rogue \
  --rogue \
  --datadir ~/.local/share/rogue-signal/chaindata \
  --syncmode full \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xYourRogueAddressHere \
  --miner.extradata "my-rig-01" \
  --randomx.fast
```

### 挖矿 CLI 参数

| 参数 | 作用 | 说明 |
| :--- | :--- | :--- |
| `--mine` | 启用内置 RandomX CPU 矿工 | 挖矿必需参数 |
| `--miner.threads <N>` | 分配用于哈希计算的 CPU 线程数 | 最佳值：`L3 缓存 (MiB) / 2` |
| `--miner.etherbase <0x...>` | 接收 `23.75 ROGUE` 与手续费的收益地址 | 若省略，挖矿将不阻塞直接启动并记录简短警告，在通过 `--miner.etherbase` 或 `miner_setEtherbase` 设置地址前，95% 矿工奖励暂路由至协议金库 |
| `--miner.extradata "<tag>"` | 可选矿工标识（最长 `64` 字节） | 当使用同一 `etherbase` 运行多台独立节点时，确保各自具有不同的 `sealhash` 目标 |
| `--randomx.fast` | 启用快速模式（~2.08 GB 数据集） | 省略时使用轻量模式（~256 MB） |

:::tip 运行多台独立矿机
如果你在不同机器上运行两个独立全节点并向同一个 `--miner.etherbase` 领奖，请为每台节点设置不同的 `--miner.extradata` 字符串（例如 `"rig-alpha"`、`"rig-beta"`），避免重复计算相同的 `sealhash` 任务。
:::

---

## 🧠 内存与并发行为特性

* **快速模式零冗余内存：** 一旦当前纪元（epoch）的 ~2.08 GB `FastDataset` 初始化完成，临时的 256 MB `LightCache` 会立即释放，每个纪元上下文节省 256 MB 内存。
* **有界上下文缓存：** `EpochManager` 在轻量模式下最多保留 `3` 个上下文（最高约 768 MB），在 `FastMode` 下限制为 `2` 个上下文（`MaxCachedContextsFast = 2`，在 64 区块种子切换过渡期最高约 4.16 GB），防止内存溢出（OOM）尖峰。
* **非阻塞异步封装：** `Seal()` 在封装协程内部异步执行纪元上下文初始化与并行 `PrewarmVMs`，确保矿工工作线程在纪元切换或收到停止信号时永不卡顿。
* **W^X / 内核限制优雅降级：** 如果宿主机内核限制 JIT 内存执行（`RANDOMX_FLAG_JIT`），`core-rogue` 会输出清晰警告并平稳降级至 `RANDOMX_FLAG_SECURE` 或解释器模式。

---

## 🔗 下一步

* 开启操作系统大页内存（Huge Pages）以最大化 CPU 算力：[Huge Pages 与 CPU 调优](./hugepages-tuning.md)。
* 在桌面客户端 Dashboard 或通过 [JSON-RPC 与 `RogueMinerReputation`](../rpc/endpoints.md) 追踪你的链上矿工等级与经验进度（`Unranked Runner` → `Rogue Singularity`）。

