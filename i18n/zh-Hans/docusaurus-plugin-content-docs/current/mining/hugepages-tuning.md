---
title: 大页内存与 CPU 优化调优
description: 调优 Linux 大页内存（Huge Pages）与硬件配置以榨取 RandomX 极限算力。
---

# 大页内存与 CPU 优化调优

RandomX 算法在全模式（Fast Mode）下分配 **2080 MiB** 的数据集（或在轻模式 Light Mode 下分配 **256 MiB** 的缓存）用于哈希计算。若未开启大页内存（Huge Pages），CPU 的页表转换旁路缓冲（TLB）缺失将降低哈希计算效率。

:::tip 自动零配置 Try-with-Fallback 回退机制
`core-rogue` 默认自动尝试使用操作系统大页内存（`RANDOMX_FLAG_LARGE_PAGES`）分配 `FastDataset`、`LightCache` 和虚拟机便笺内存（scratchpads）——无需额外命令行参数。如果操作系统没有足够的可用大页内存，`core-rogue` 会记录一条提示信息并无缝回退至标准内存页。您可以通过 `rogue_getConsensusStatus`（`vmPool.largePages: true/false`）验证大页内存的当前启用状态。
:::

---

## 🚀 在 Linux 系统上启用大页内存

### 临时生效（重启后失效）
```bash
sudo sysctl -w vm.nr_hugepages=1280
```

### 永久生效配置
在系统配置文件 `/etc/sysctl.conf` 中追加以下配置项：
```ini
vm.nr_hugepages=1280
```
保存后立即重新加载内核参数生效：
```bash
sudo sysctl -p
```

检查大页内存是否已成功分配：
```bash
grep -i huge /proc/meminfo
```

---

## ⚡ 硬件选型与内存优化最佳实践

1. **必须组建双通道内存（Dual-Channel RAM）：**
   * RandomX 算力对系统内存读写带宽具有极高的依赖度。仅运行单通道内存可能导致综合挖矿性能腰斩 40% 以上。
   * 确保内存条插在主板对应的双通道插槽中（如标准的第 2 和第 4 槽位）。

2. **L3 缓存与线程分配计算法则：**
   * 每个独立的 RandomX 挖矿计算线程需要独占 **2 MiB 的 CPU 三级缓存（L3 Cache）**。
   * 最佳线程数计算公式：`最佳线程数 = CPU 总 L3 缓存容量 (MiB) / 2`。
   * *实际示例：* 一颗拥有 32 MiB L3 缓存的 AMD Ryzen 7 5800X 处理器，可完美跑满 `32 / 2 = 16` 个挖矿线程。

3. **MSR（模型特定寄存器）调优补丁：**
   * 在 Linux 操作系统上，为 AMD Zen 系列微架构启用 MSR 寄存器写入优化，可带来额外 10% 到 15% 的显著算力提升。

