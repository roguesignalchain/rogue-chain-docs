---
sidebar_position: 3
title: Smart Contracts e Integración Web3
description: Conectar Hardhat, Foundry, viem, ethers.js y MetaMask a Rogue Signal (Chain ID 800055) e integrarse con RogueMinerReputation.
---

# Smart Contracts e Integración Web3

Rogue Signal ofrece un entorno de ejecución EVM moderno desde el **Bloque 0**, permitiendo desplegar contratos inteligentes en Solidity y dApps Web3 estándar con las herramientas habituales de Ethereum.

---

## 🔌 Datos de Conexión a la Red

| Parámetro | Valor |
| :--- | :--- |
| **Nombre de Red** | `Rogue Signal` |
| **Chain ID** | `800055` (`0xc3537` en hex) |
| **Símbolo de Moneda** | `ROGUE` |
| **Decimales** | `18` |
| **HTTP RPC Local** | `http://127.0.0.1:38845` |
| **WebSocket RPC Local** | `ws://127.0.0.1:38846` (cuando `--ws` está habilitado) |
| **Límite de Gas por Bloque** | `50,000,000` gas |
| **Precio Mínimo de Gas en TxPool** | `1 Gwei` (`1000000000` wei) |
| **Formato de Transacción** | **Solo Legacy (`Type 0`)** |

---

## ⚙️ Perfil EVM y Reglas de Transacciones

### Solo Transacciones Legacy (`Type 0`)
`RogueChainConfig` mantiene intencionalmente un procesamiento de transacciones predecible solo Legacy (`Type 0`) sin la complejidad de quema de tarifa base EIP-1559:
* **`eth_sendRawTransaction` solo acepta transacciones Legacy (`Type 0`).**
* Las transacciones tipadas (EIP-1559 `Type 2`, EIP-2930 `Type 1`, EIP-4844 `Type 3`) se rechazan en la frontera de TxPool / RPC.
* Configura siempre tus billeteras, scripts de despliegue y librerías para pasar `gasPrice` explícito (≥ `1 Gwei`) y `type: 0` / `--legacy`.

### Opcodes Modernos de EVM Activos desde el Bloque 0
A pesar del formato de transacción Legacy, Rogue Signal activa las actualizaciones modernas de EVM Berlin, London, Shanghai y Cancun desde el Génesis:
* **Berlin y London:** `EIP-2565` (ModExp), `EIP-2929` (reprecio de acceso a estado frío/caliente), `EIP-3529` (tope de reembolso de gas), `EIP-3541` (rechazo de bytecode `0xEF`).
* **Shanghai y Cancun:** `EIP-3651` (Warm `COINBASE`), `EIP-3855` (`PUSH0`), `EIP-3860` (límite y medición de initcode), `EIP-5656` (`MCOPY`), `EIP-1153` (`TSTORE` / `TLOAD`) y `EIP-6049`.

---

## 🛠️ Ejemplos de Configuración de Herramientas

### Foundry (`forge` y `cast`)
Pasa siempre `--legacy` al emitir transacciones o desplegar contratos con Foundry:

```bash
# Desplegar un contrato
forge create src/MyContract.sol:MyContract \
  --rpc-url http://127.0.0.1:38845 \
  --private-key $PRIVATE_KEY \
  --legacy

# Enviar una llamada que modifica estado
cast send 0xContractAddress "myFunction(uint256)" 42 \
  --rpc-url http://127.0.0.1:38845 \
  --private-key $PRIVATE_KEY \
  --legacy
```

### Hardhat (`hardhat.config.ts`)
Especifica `chainId: 800055` y un `gasPrice` legacy en tu configuración de red:

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
      gasPrice: 1_000_000_000, // Suelo mínimo de 1 Gwei
    },
  },
};

export default config;
```

### `viem` (TypeScript)
Define una cadena personalizada y envía transacciones Legacy (`type: "legacy"`):

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

## 🏆 Integración con `RogueMinerReputation` (`0x...0020`)

Rogue Signal despliega un contrato del sistema a nivel de protocolo en **`0x0000000000000000000000000000000000000020`** en el Bloque 0 (`Genesis.Alloc`). Cada bloque PoW válido incrementa el contador de bloques on-chain del minero ganador directamente en consenso.

Los contratos inteligentes y dApps pueden componerse con la reputación Proof-of-Work sin confianza mediante `eth_call` estándar o `STATICCALL` en Solidity:

* **`getMinerLevel(address miner) → uint32`**: Devuelve el nivel numérico (`0` a `6`).
* **`getMinerStats(address miner, string lang) → MinerStats`**: Devuelve bloques minados, nivel, título de rango localizado (`"en"`, `"es"`, `"zh"`), URI de insignia, umbrales actual/siguiente y `progressBps`.
* **`meetsLevel(address miner, uint32 minLevel) → bool`**: Ideal para restringir funciones de protocolo, faucets, pesos de gobernanza o listas blancas a mineros CPU activos.
* **`blocksMined(address miner) → uint256`**: Conteo bruto de bloques PoW.

### Ejemplo `STATICCALL` en Solidity
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
        // Requiere Nivel 2 (Signal Scraper: 25+ bloques minados)
        return REPUTATION.meetsLevel(account, 2);
    }
}
```

Para consultar todos los umbrales de rango, vistas previas de medallas y ejemplos de consultas RPC, consulta la [Referencia de API JSON-RPC](../rpc/endpoints.md).

