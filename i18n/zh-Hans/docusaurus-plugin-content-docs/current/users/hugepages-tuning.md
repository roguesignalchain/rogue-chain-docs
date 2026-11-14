---
sidebar_position: 5
title: Huge Pages 与 CPU 调优
description: "通过硬件优化、双通道内存、L3 缓存匹配及 Linux Huge Pages 调优获取最高 RandomX 算力。"
---

# Huge Pages 与 CPU 调优

RandomX 在快速模式下会分配 **2080 MiB** 数据集（轻量模式下为 **256 MiB** 缓存），并为每个哈希线程分配 **2 MiB** scratchpad 内存。在操作系统标准的 4 KiB 内存页下，频繁的转译后备缓冲器（TLB）未命中会降低 CPU 哈希效率。启用 **Huge Pages（2 MiB 大页内存）** 可显著减少 TLB 压力并提升算力。

:::tip 零配置自动尝试与平滑回退
`core-rogue` 默认自动尝试使用操作系统 HugePages（`RANDOMX_FLAG_LARGE_PAGES`）分配 `FastDataset`、`LightCache` 与 VM scratchpads，无需额外 CLI 参数。如果操作系统没有足够的空闲 HugePages，`core-rogue` 会记录一条提示信息并无缝回退到标准内存页。你可以通过 `randomx_getConsensusStatus`（`vmPool.largePages: true/false`）验证 HugePages 是否生效。
:::

---

## 🚀 在 Linux 上启用 Huge Pages

每个 2 MiB HugePage 提供 2 MiB 连续内存。分配 `1280` 个 HugePages 将预留 `2560 MiB`（约 2.5 GB），足以覆盖 2080 MiB 快速模式数据集以及多线程 VM scratchpads。

### 临时分配（重启后失效）
```bash
sudo sysctl -w vm.nr_hugepages=1280
```

### 永久分配
将配置添加到 `/etc/sysctl.conf`（或独立配置文件 `/etc/sysctl.d/99-rogue-hugepages.conf`）：
```ini
vm.nr_hugepages=1280
```
立即应用更改：
```bash
sudo sysctl -p
```

验证 Huge Pages 是否已分配：
```bash
grep -i huge /proc/meminfo
```

*（注意：如果你运行多路 NUMA 服务器，或希望在 2048 区块纪元切换期间（两个数据集短暂共存）留出更多余量，在拥有 16 GB+ 内存的系统上可考虑设置 `vm.nr_hugepages=2560`。）*

---

## ⚡ 硬件与内存最佳实践

1. **双通道内存（Dual-Channel RAM）至关重要：**
   * RandomX 严重受限于内存带宽。在单通道模式下运行内存（仅安装一根内存条，或两根内存条未插在配对插槽）会导致算力下降 **40% 以上**。
   * 请按照主板说明书将匹配的内存条安装在双通道插槽中（通常为 A2 与 B2 插槽）。

2. **L3 缓存容量法则：**
   * 每个活跃的 RandomX 挖矿线程需要 **2 MiB 的 CPU L3 缓存**用于其 scratchpad。
   * 计算最佳线程数：
     `最佳线程数 = L3 总缓存 (MiB) / 2`
   * *示例：* 拥有 32 MiB L3 缓存的 AMD Ryzen 7 5800X 可高效运行 `32 / 2 = 16` 个线程。超过 L3 缓存容量会迫使线程溢出到较慢的系统内存中，通常反而降低总算力并增加功耗。

3. **MSR（Model Specific Registers）优化（Linux）：**
   * 在运行 AMD Zen 架构 CPU 的 Linux 系统上，具备相应内核权限时通过 MSR 调整硬件预取器可额外带来 10–15% 的 RandomX 算力提升。

