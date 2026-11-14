---
sidebar_position: 3
title: 智能合约与 Web3 集成
description: "将 Hardhat、Foundry、viem、ethers.js 和 MetaMask 连接到 Rogue Signal (Chain ID 800055)，并与 RogueMinerReputation 合约集成。"
---

# 智能合约与 Web3 集成

Rogue Signal 从 **第 0 区块**起即提供现代化的 EVM 执行环境，支持使用熟悉的以太坊工具链无缝部署 Solidity 智能合约与标准 Web3 dApp。

---

## 🔌 网络连接参数

| 参数 | 值 |
| :--- | :--- |
| **网络名称** | `Rogue Signal` |
| **Chain ID** | `800055`（十六进制 `0xc3537`） |
| **货币符号** | `ROGUE` |
| **小数位数** | `18` |
| **本地 HTTP RPC** | `http://127.0.0.1:38845` |
| **本地 WebSocket RPC** | `ws://127.0.0.1:38846`（启用 `--ws` 时） |
| **区块 Gas 上限** | `50,000,000` gas |
| **TxPool 最低 Gas 价格** | `1 Gwei`（`1000000000` wei） |
| **交易格式** | **仅限 Legacy（`Type 0`）** |

---

## ⚙️ EVM 规范与交易规则

### 仅限 Legacy（`Type 0`）交易
`RogueChainConfig` 刻意保留了可预测的纯 Legacy（`Type 0`）交易处理机制，不引入 EIP-1559 基础费销毁复杂度：
* **`eth_sendRawTransaction` 仅接受 Legacy（`Type 0`）交易。**
* 类型化交易（EIP-1559 `Type 2`、EIP-2930 `Type 1`、EIP-4844 `Type 3`）会在 TxPool / RPC 边界被拒绝。
* 请始终配置你的钱包、部署脚本和开发库显式传入 `gasPrice`（≥ `1 Gwei`）以及 `type: 0` / `--legacy`。

### 从第 0 区块起激活的现代 EVM 操作码
尽管采用 Legacy 交易封装格式，Rogue Signal 从创世区块起即激活了 Berlin、London、Shanghai 与 Cancun 现代 EVM 升级：
* **Berlin 与 London：** `EIP-2565`（ModExp）、`EIP-2929`（冷/热状态访问 Gas 重定价）、`EIP-3529`（Gas 退款上限）、`EIP-3541`（拒绝 `0xEF` 合约字节码）。
* **Shanghai 与 Cancun：** `EIP-3651`（Warm `COINBASE`）、`EIP-3855`（`PUSH0`）、`EIP-3860`（initcode 大小限制与计量）、`EIP-5656`（`MCOPY`）、`EIP-1153`（`TSTORE` / `TLOAD`）以及 `EIP-6049`。

---

## 🛠️ 工具配置示例

### Foundry（`forge` 与 `cast`）
使用 Foundry 广播交易或部署合约时，请始终加上 `--legacy`：

```bash
# 部署合约
forge create src/MyContract.sol:MyContract \
  --rpc-url http://127.0.0.1:38845 \
  --private-key $PRIVATE_KEY \
  --legacy

# 发送状态变更交易
cast send 0xContractAddress "myFunction(uint256)" 42 \
  --rpc-url http://127.0.0.1:38845 \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Hardhat (`hardhat.config.ts`)
在网络配置中指定 `chainId: 800055` 与 legacy `gasPrice`：

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
      gasPrice: 1_000_000_000, // 1 Gwei 最低下限
    },
  },
};

export default config;
```

### `viem` (TypeScript)
定义自定义链并发送 Legacy（`type: "legacy"`）交易：

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

## 🏆 集成 `RogueMinerReputation`（`0x...0020`）

Rogue Signal 在第 0 区块（`Genesis.Alloc`）于地址 **`0x0000000000000000000000000000000000000020`** 部署了协议级系统合约。每个有效的 PoW 区块都会在共识层直接递增获胜矿工的链上区块计数器。

智能合约与 dApp 可以通过标准 `eth_call` 或 Solidity `STATICCALL` 去信任地组合 PoW 声誉数据：

* **`getMinerLevel(address miner) → uint32`**：返回数字等级（`0` 到 `6`）。
* **`getMinerStats(address miner, string lang) → MinerStats`**：返回已挖区块数、等级、本地化头衔（`"en"`、`"es"`、`"zh"`）、徽章 URI、当前/下一等级阈值及 `progressBps`。
* **`meetsLevel(address miner, uint32 minLevel) → bool`**：适用于为活跃 CPU 矿工限制协议功能、水龙头、治理权重或白名单准入。
* **`blocksMined(address miner) → uint256`**：原始 PoW 出块数。

### Solidity `STATICCALL` 示例
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
        // 需要等级 2（Signal Scraper：已挖出 25+ 个区块）
        return REPUTATION.meetsLevel(account, 2);
    }
}
```

有关完整等级阈值、徽章预览及 RPC 查询示例，请参阅 [JSON-RPC API 参考](../rpc/endpoints.md)。

