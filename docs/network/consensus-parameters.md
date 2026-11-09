---
title: Consensus Parameters & LWMA-1
description: Mathematical rules, difficulty adjustment, and supply emission model.
---

# Consensus Parameters & LWMA-1

Rogue Signal implements an institutional-grade consensus architecture designed to prevent timestamp manipulation, block withholding attacks, and violent hashrate oscillations.

---

## 📐 LWMA-1 Difficulty Adjustment Algorithm

Unlike Bitcoin's 2016-block difficulty window or Ethereum Classic's older difficulty bombs, Rogue Signal recalculates target difficulty on **every single block** using the **LWMA-1** (Linearly Weighted Moving Average) algorithm with window `N = 60`:

```text
Next Target = (Average Target * sum(i * delta_t_i)) / (0.5 * N * (N + 1) * T)
```

Where:
* `N = 60` (The number of sample past blocks)
* `T = 10s` (Target block confirmation interval)
* `delta_t_i = clamp(t_i - t_{i-1}, -5*T, 6*T)` (Clamped solve time differences)

### Why LWMA-1?
* **Instant response:** Adjusts within minutes to sudden hashing spikes or drops.
* **Resistance to rental attacks:** Hashpower rented for short intervals cannot game the difficulty downward before leaving the network stranded.

---

## ⏱️ Strict Timestamp Rules

To protect against "timewarp" and difficulty downward manipulation attacks:

1. **MTP-11 (Past Median Time):**
   * The timestamp of block $H$ must be strictly greater than the median timestamp of the preceding 11 blocks ($H-11$ through $H-1$).
2. **Future Drift Limit:**
   * A candidate block's timestamp cannot exceed the local node's current wall-clock time by more than **15 seconds**. Blocks drifting further into the future are rejected.

---

## 💰 Emission Schedule & Halving

* **Initial Block Reward:** 8 ROGUE
* **Halving Cadence:** Every 6,300,000 blocks (~2 years)
* **Miner Share (95%):** 7.6 ROGUE initially
* **Treasury Share (5%):** 0.4 ROGUE initially
* **Total Supply Cap:** Exactly 100,000,000 ROGUE (Hard cap, zero tail emission)
