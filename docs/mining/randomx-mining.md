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
* `--mine`: Enables the internal miner thread engine.
* `--miner.threads <N>`: Sets the number of CPU threads allocated to hashing.
* `--miner.etherbase <0x...>`: Destination address where all block rewards (7.6 ROGUE per block) are deposited.

---

## 💻 GUI Mining with Rogue Desktop Client

For users who prefer a graphical interface:

1. Open **Rogue Desktop Client**.
2. Navigate to the **Miner** tab.
3. Select the number of CPU mining threads using the slider.
4. Click **Start Mining**.
5. Live hash rate, accepted hashes, and discovered blocks will update in real time.

---

## 🏊 Stratum Pool Mining

Mining pools allow miners with smaller hash rates to combine computing power and earn steady, proportional rewards.

Standard stratum mining protocols connect to pool endpoints via TCP using dedicated RandomX mining clients (such as modified XMRig or native Rogue miner tools).
