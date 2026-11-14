---
sidebar_position: 5
title: Huge Pages & CPU Tuning
description: Hardware optimization, dual-channel RAM, L3 cache sizing, and Linux Huge Pages tuning for maximum RandomX hashrate.
---

# Huge Pages & CPU Tuning

RandomX allocates a **2080 MiB** dataset in Fast Mode (or a **256 MiB** cache in Light Mode) plus **2 MiB** of scratchpad memory per hashing thread. On standard 4 KiB OS memory pages, frequent Translation Lookaside Buffer (TLB) misses reduce CPU hashing efficiency. Enabling **Huge Pages (2 MiB pages)** significantly reduces TLB pressure and boosts hashrate.

:::tip Automatic Zero-Config Try-with-Fallback
`core-rogue` automatically attempts to allocate `FastDataset`, `LightCache`, and VM scratchpads using OS HugePages (`RANDOMX_FLAG_LARGE_PAGES`) by default—no extra CLI flags are required. If the OS does not have enough free HugePages, `core-rogue` logs an informational notice and seamlessly falls back to standard memory pages. You can verify active HugePages usage via `randomx_getConsensusStatus` (`vmPool.largePages: true/false`).
:::

---

## 🚀 Enabling Huge Pages on Linux

Each 2 MiB HugePage provides 2 MiB of contiguous memory. Allocating `1280` HugePages reserves `2560 MiB` (~2.5 GB), which comfortably covers a 2080 MiB Fast Mode dataset plus multi-threaded VM scratchpads.

### Temporary Allocation (Until Next Reboot)
```bash
sudo sysctl -w vm.nr_hugepages=1280
```

### Permanent Allocation
Add the setting to `/etc/sysctl.conf` (or a drop-in file `/etc/sysctl.d/99-rogue-hugepages.conf`):
```ini
vm.nr_hugepages=1280
```
Apply changes immediately:
```bash
sudo sysctl -p
```

Verify that Huge Pages are allocated:
```bash
grep -i huge /proc/meminfo
```

*(Note: If you run a multi-socket NUMA server or want extra headroom during 2048-block epoch transitions where two datasets briefly coexist, consider `vm.nr_hugepages=2560` if your system has 16 GB+ RAM.)*

---

## ⚡ Hardware & Memory Best Practices

1. **Dual-Channel RAM Is Essential:**
   * RandomX is heavily memory-bandwidth bound. Running RAM in single-channel mode (only one stick installed, or two sticks in non-paired slots) can degrade hashrate by **40% or more**.
   * Install matched memory modules in dual-channel slots according to your motherboard manual (typically Slots A2 & B2).

2. **L3 Cache Sizing Rule:**
   * Each active RandomX mining thread requires **2 MiB of CPU L3 cache** for its scratchpad.
   * Calculate your optimal thread count:
     `Optimal Threads = Total L3 Cache (MiB) / 2`
   * *Example:* An AMD Ryzen 7 5800X with 32 MiB of L3 cache can efficiently run `32 / 2 = 16` threads. Exceeding your L3 cache capacity forces threads to spill into slower system RAM, often lowering total hashrate while increasing power draw.

3. **MSR (Model Specific Registers) Optimization (Linux):**
   * On Linux systems running AMD Zen CPUs, hardware prefetcher tuning via MSR can yield an additional 10–15% RandomX hashrate boost when running with appropriate kernel permissions.

