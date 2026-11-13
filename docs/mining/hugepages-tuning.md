---
title: Huge Pages & CPU Optimization
description: Tuning Linux Huge Pages and hardware settings for maximum RandomX hashrate.
---

# Huge Pages & CPU Optimization

RandomX allocates a **2080 MiB** dataset in Fast Mode (or **256 MiB** cache in Light Mode) for hashing. Without Huge Pages enabled, CPU translation lookaside buffer (TLB) misses reduce hashing efficiency.

:::tip Automatic Zero-Config Try-with-Fallback
`core-rogue` automatically attempts to allocate `FastDataset`, `LightCache`, and VM scratchpads using OS HugePages (`RANDOMX_FLAG_LARGE_PAGES`) by default—no extra CLI flags are required. If the OS does not have enough free HugePages, `core-rogue` logs an informational notice and seamlessly falls back to standard memory pages. You can verify active HugePages usage via `rogue_getConsensusStatus` (`vmPool.largePages: true/false`).
:::

---

## 🚀 Enabling Huge Pages on Linux

### Temporary Allocation (Until Next Reboot)
```bash
sudo sysctl -w vm.nr_hugepages=1280
```

### Permanent Allocation
Add the setting to `/etc/sysctl.conf`:
```ini
vm.nr_hugepages=1280
```
Then apply changes immediately:
```bash
sudo sysctl -p
```

Verify that Huge Pages are allocated:
```bash
grep -i huge /proc/meminfo
```

---

## ⚡ Hardware & Memory Best Practices

1. **Dual-Channel RAM is Mandatory:**
   * RandomX is heavily memory-bandwidth bound. Running RAM in single-channel mode can degrade performance by more than 40%.
   * Ensure memory sticks are placed in dual-channel configuration slots (e.g., Slots 2 & 4).

2. **L3 Cache Sizing Rule:**
   * Each active RandomX mining thread requires **2 MiB of L3 cache**.
   * Calculate your optimal thread count: `Optimal Threads = Total L3 Cache (MiB) / 2`.
   * *Example:* An AMD Ryzen 7 5800X with 32 MiB L3 cache can efficiently run `32 / 2 = 16` threads.

3. **MSR (Model Specific Registers) Mod:**
   * On Linux systems, enabling MSR mods on AMD Zen architecture grants up to 10-15% additional hashrate boost.
