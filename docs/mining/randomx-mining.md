---
title: RandomX CPU Mining
description: Complete guide to mining ROGUE using consumer CPUs and RandomX.
---

# RandomX CPU Mining

Mining on **Rogue Signal** is built around **RandomX** (`rx/0`), the premier ASIC-resistant proof-of-work algorithm. By designing an instruction set that mirrors general-purpose computer CPUs, specialized mining ASICs cannot achieve meaningful efficiency gains over commodity processors.

---

## ⛏️ Solo Mining with `core-rogue`

To mine directly from the core node daemon into your recipient address:

```bash
./build/bin/core-rogue \
  --rogue \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xYourRogueAddressHere
```

### Solo Mining Parameters
* `--mine`: Enables the internal RandomX CPU miner thread engine.
* `--miner.threads <N>`: Sets the number of CPU threads allocated to hashing (100% user-configurable; optimal efficiency is `L3 Cache (MiB) / 2`).
* `--miner.etherbase <0x...>`: Destination address where all block rewards (**23.75 ROGUE** per block + 100% of block transaction fees) are deposited.

---

## 💻 GUI Mining with Rogue Desktop Client

For users who prefer a graphical interface:

1. Open **Rogue Desktop Client**.
2. Navigate to the **Miner** tab.
3. Select the number of CPU mining threads using the slider and toggle **Fast Mode (2080 MiB RAM)** if your system has sufficient memory.
4. Click **Start Mining**.
5. Live hash rate, accepted hashes, and discovered blocks will update in real time.

---

## 🛡️ Anti-Farm Architecture: Full-Node Solo Mining Only (No Stratum / No `eth_getWork`)

To protect network decentralization and prevent industrial mining farms or cloud botnets from pointing hundreds of lightweight stateless workers (`XMRig`) at a single node:

* **External Stratum Bridges & `eth_getWork` Are Disabled:** The `eth_getWork`, `eth_submitWork`, and `eth_submitHashrate` RPC methods are permanently disabled at the consensus layer (`consensus/randomx/api.go`).
* **1 Node = 1 Independent Miner:** Every machine participating in Proof-of-Work must run a fully synchronized `core-rogue` EVM node with its own chain state and its own 2080 MiB RandomX RAM dataset.
* **Zero Artificial Yield Penalties:** Every valid PoW block receives 100% of its **25 ROGUE** emission (`23.75 ROGUE` to the miner and `1.25 ROGUE` to the protocol treasury) immediately upon inclusion.
