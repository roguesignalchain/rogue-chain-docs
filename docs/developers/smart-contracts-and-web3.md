---
sidebar_position: 3
title: Smart Contracts & Web3 Integration
description: Connecting Hardhat, Foundry, viem, ethers.js, and MetaMask to Rogue Signal (Chain ID 800055) and integrating with RogueMinerReputation.
---

# Smart Contracts & Web3 Integration

Rogue Signal provides a modern EVM execution environment from **Block 0**, enabling seamless deployment of Solidity smart contracts and standard Web3 dApps using familiar Ethereum tooling.

---

## 🔌 Network Connection Details

| Parameter | Value |
| :--- | :--- |
| **Network Name** | `Rogue Signal` |
| **Chain ID** | `800055` (`0xc3537` hex) |
| **Currency Symbol** | `ROGUE` |
| **Decimals** | `18` |
| **Local HTTP RPC** | `http://127.0.0.1:38845` |
| **Local WebSocket RPC** | `ws://127.0.0.1:38846` (when `--ws` is enabled) |
| **Block Gas Limit** | `50,000,000` gas |
| **Min TxPool Gas Price** | `1 Gwei` (`1000000000` wei) |
| **Transaction Format** | **Legacy (`Type 0`) only** |

---

## ⚙️ EVM Profile & Transaction Rules

### Legacy (`Type 0`) Transactions Only
`RogueChainConfig` intentionally preserves predictable, legacy-only (`Type 0`) transaction processing without EIP-1559 base-fee burn complexity:
* **`eth_sendRawTransaction` only accepts Legacy (`Type 0`) transactions.**
* Typed transactions (EIP-1559 `Type 2`, EIP-2930 `Type 1`, EIP-4844 `Type 3`) are rejected at the TxPool / RPC boundary.
* Always configure your wallets, deployment scripts, and libraries to pass explicit `gasPrice` (≥ `1 Gwei`) and `type: 0` / `--legacy`.

### Modern EVM Opcodes Active from Block 0
Despite Legacy transaction framing, Rogue Signal activates modern Berlin, London, Shanghai, and Cancun EVM upgrades from Genesis:
* **Berlin & London:** `EIP-2565` (ModExp), `EIP-2929` (cold/warm state access repricing), `EIP-3529` (gas refund cap), `EIP-3541` (reject `0xEF` bytecode).
* **Shanghai & Cancun:** `EIP-3651` (Warm `COINBASE`), `EIP-3855` (`PUSH0`), `EIP-3860` (initcode size limit & metering), `EIP-5656` (`MCOPY`), `EIP-1153` (`TSTORE` / `TLOAD`), and `EIP-6049`.

---

## 🛠️ Tooling Configuration Examples

### Foundry (`forge` & `cast`)
Always pass `--legacy` when broadcasting transactions or deploying contracts with Foundry:

```bash
# Deploy a contract
forge create src/MyContract.sol:MyContract \
  --rpc-url http://127.0.0.1:38845 \
  --private-key $PRIVATE_KEY \
  --legacy

# Send a state-changing call
cast send 0xContractAddress "myFunction(uint256)" 42 \
  --rpc-url http://127.0.0.1:38845 \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Hardhat (`hardhat.config.ts`)
Specify `chainId: 800055` and a legacy `gasPrice` in your network configuration:

```ts
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    rogue: {
      url: "http://127.0.0.1:38845",
      chainId: 800055,
      gasPrice: 1_000_000_000, // 1 Gwei minimum floor
    },
  },
};

export default config;
```

### `viem` (TypeScript)
Define a custom chain and send Legacy (`type: "legacy"`) transactions:

```ts
import { createPublicClient, createWalletClient, defineChain, http, parseGwei } from "viem";

export const rogueSignal = defineChain({
  id: 800055,
  name: "Rogue Signal",
  nativeCurrency: { name: "Rogue", symbol: "ROGUE", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:38845"] },
  },
});

export const publicClient = createPublicClient({
  chain: rogueSignal,
  transport: http(),
});
```

---

## 🏆 Integrating with `RogueMinerReputation` (`0x...0020`)

Rogue Signal deploys a protocol-level system contract at **`0x0000000000000000000000000000000000000020`** in Block 0 (`Genesis.Alloc`). Every valid PoW block increments the winning miner's on-chain block counter directly in consensus.

Smart contracts and dApps can compose with Proof-of-Work reputation trustlessly via standard `eth_call` or Solidity `STATICCALL`:

* **`getMinerLevel(address miner) → uint32`**: Returns numeric tier (`0` to `6`).
* **`getMinerStats(address miner, string lang) → MinerStats`**: Returns blocks mined, level, localized rank title (`"en"`, `"es"`, `"zh"`), badge URI, current/next tier thresholds, and `progressBps`.
* **`meetsLevel(address miner, uint32 minLevel) → bool`**: Ideal for gating protocol features, faucets, governance weights, or allowlists to active CPU miners.
* **`blocksMined(address miner) → uint256`**: Raw PoW block count.

### Solidity `STATICCALL` Example
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRogueMinerReputation {
    function getMinerLevel(address miner) external view returns (uint32);
    function meetsLevel(address miner, uint32 minLevel) external view returns (bool);
    function blocksMined(address miner) external view returns (uint256);
}

contract MinerGatedAccess {
    IRogueMinerReputation public constant REPUTATION =
        IRogueMinerReputation(0x0000000000000000000000000000000000000020);

    function canClaimMinerPerk(address account) external view returns (bool) {
        // Requires Level 2 (Signal Scraper: 25+ blocks mined)
        return REPUTATION.meetsLevel(account, 2);
    }
}
```

For full rank thresholds, badge previews, and RPC query examples, see the [JSON-RPC API Reference](../rpc/endpoints.md).

