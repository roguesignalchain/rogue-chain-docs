---
sidebar_position: 1
title: Visión General y Especificaciones
description: Introducción al protocolo blockchain de Prueba de Trabajo (PoW) Rogue Signal (ROGUE).
---

# Rogue Signal (ROGUE)

**Rogue Signal** es una red blockchain descentralizada de Capa 1 con Prueba de Trabajo (Proof-of-Work, PoW) y compatibilidad total con EVM, diseñada para garantizar una descentralización resistente a ASICs. Al combinar el algoritmo **RandomX** con el entorno de ejecución de la Máquina Virtual de Ethereum (EVM), Rogue Signal democratiza la validación de bloques y la minería en procesadores (CPUs) domésticos, preservando la capacidad total de desplegar contratos inteligentes.

---

## ⚡ Parámetros Principales de la Red

| Parámetro | Especificación | Descripción |
| :--- | :--- | :--- |
| **Nombre de la Red** | `Rogue Signal` | Denominación oficial del protocolo |
| **Ticker** | `ROGUE` | Símbolo oficial de la moneda nativa |
| **Chain ID** | `800055` | Identificador de cadena EIP-155 anti-replay |
| **Algoritmo de Consenso** | `RandomX (rx/0)` | Algoritmo intensivo en CPU resistente a ASICs y GPUs |
| **Tiempo Objetivo por Bloque**| `30 segundos` | Confirmación global con tasa de huérfanos `< 0.5%` |
| **Recompensa por Bloque** | `25 ROGUE` | 95% Minero (23.75 ROGUE) / 5% Tesorería (1.25 ROGUE) |
| **Calendario de Halving** | `2,000,000 bloques` | Reducción a la mitad cada ~1.90 años (~694.44 días) a 30s por bloque |
| **Emisión Máxima** | `100,000,000 ROGUE` | Límite matemático estricto en 32 eras, cero tail emission |
| **Ajuste de Dificultad** | `LWMA-1 (N=60)` | Media móvil ponderada linealmente sobre 60 bloques (~30 min) |
| **Reglas de Tiempo** | `MTP-11 Estricto` | Tiempo de bloque > Mediana de los últimos 11, máx. 30s de deriva futura |
| **Finalidad Anti-51%** | `ECBP-1100 (MESS)` | Gravedad polinómica ECBP-1100 pura (hasta 31x TD, intervalo de seguridad 15m) desde el Bloque 0 |
| **Rotación de Seed** | `2048 bloques` | Rotación de época RandomX (~17.07h) con desfase preventivo de 64 bloques (~32m) |
| **Tamaño Máx. ExtraData** | `64 bytes` | Protección anti-DoS contra cabeceras infladas |
| **Límite de Gas por Bloque** | `50,000,000 gas` | Alta capacidad EVM (`1 Gwei` mínimo en TxPool, límite RAM de 128 MB) |
| **Hash del Bloque Génesis** | `0xde4c5e747fbb072d39db2ece5a245e46b6164045e166301dfdba78f86cfbe4dd` | Anclado criptográficamente en `RequireBlockHashes[0]` |

---

## 🛡️ Pilares de la Arquitectura

### 1. Resistencia Real a ASICs y Granjas con Nodo Completo RandomX
Rogue Signal implementa de forma nativa el algoritmo `RandomX` (`rx/0`) en el consenso del nodo. RandomX ejecuta secuencias de instrucciones aleatorias en una máquina virtual dedicada que exige 2 MiB de caché L3 por hilo y un dataset de 2080 MiB en RAM, inutilizando ASICs y GPUs. Además, los puentes Stratum externos y `eth_getWork` están permanentemente deshabilitados: toda máquina que mine debe ejecutar un nodo validador completo `core-rogue`.

### 2. Compatibilidad Total con EVM
Construido sobre una sólida base Core-Geth optimizada, Rogue Signal ofrece compatibilidad completa con Solidity, librerías Web3 (`ethers.js`, `viem`, `web3.js`) y herramientas de desarrollo habituales como Hardhat, Foundry y MetaMask.

### 3. Dificultad Dinámica LWMA-1 y Seguridad Anti-51% de Tres Capas
Las fluctuaciones imprevistas en la tasa de hash se amortiguan mediante **LWMA-1** (`N=60`) con acotamiento `+-33%` por bloque e independencia del timestamp candidato. Los ataques de reorganización profunda quedan neutralizados desde el Bloque 0 mediante la puntuación exponencial **ECBP-1100 (MESS)**.

### 4. Tesorería de Protocolo Sostenible
Cada bloque divide su recompensa entre el minero (95% / 23.75 ROGUE) y la tesorería del protocolo (5% / 1.25 ROGUE), garantizando financiamiento continuo para desarrollo, auditorías, seguridad e incentivos del ecosistema, sin preventas ni asignaciones previas a inversores.
