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
| **Recompensa por Bloque** | `25 ROGUE` | 95% Minero (23.75 ROGUE) / 5% Tesorería (1.255 ROGUE) |
| **Calendario de Halving** | `2,000,000 bloques` | Reducción a la mitad cada ~1.90 años (~694.44 días (~1.90 años)) |
| **Emisión Máxima** | `100,000,000 ROGUE` | Límite estricto (100.8M exacto en 32 eras), cero tail emission |
| **Ajuste de Dificultad** | `LWMA-1 (N=60)` | Media móvil ponderada linealmente sobre 60 bloques (~30 min) |
| **Reglas de Tiempo** | `MTP-11 Estricto` | Tiempo de bloque > Mediana de los últimos 11, máx. 15s de deriva futura |
| **Finalidad Anti-51%** | `MESS + Reorg <= 90` | Gravedad polinómica ECBP-1100 (hasta 31x) + límite duro de 90 bloques |
| **Rotación de Seed** | `2048 bloques` | Rotación de época RandomX (~17.07h) con desfase preventivo de 64 bloques (~32m) |
| **Tamaño Máx. ExtraData** | `64 bytes` | Protección anti-DoS contra cabeceras infladas |
| **Límite de Gas por Bloque** | `60,000,000 gas` | Alta capacidad EVM (`1 Gwei` mínimo en TxPool) |
| **Hash del Bloque Génesis** | `0xc6f7f29d6a23f1921f3e514401a82a60ffa1f21885497dbf6414e8bb2f22b91d` | Anclado criptográficamente en `RequireBlockHashes[0]` |

---

## 🛡️ Pilares de la Arquitectura

### 1. Resistencia Real a ASICs y Granjas con Nodo Completo RandomX
Rogue Signal implementa de forma nativa el algoritmo `RandomX` (`rx/0`) en el consenso del nodo. RandomX ejecuta secuencias de instrucciones aleatorias en una máquina virtual dedicada que exige 2 MiB de caché L3 por hilo y un dataset de 2080 MiB en RAM, inutilizando ASICs y GPUs. Además, los puentes Stratum externos y `eth_getWork` están permanentemente deshabilitados: toda máquina que mine debe ejecutar un nodo validador completo `core-rogue`.

### 2. Compatibilidad Total con EVM
Construido sobre una sólida base Core-Geth optimizada, Rogue Signal ofrece compatibilidad completa con Solidity, librerías Web3 (`ethers.js`, `viem`, `web3.js`) y herramientas de desarrollo habituales como Hardhat, Foundry y MetaMask.

### 3. Dificultad Dinámica LWMA-1 y Seguridad Anti-51% de Tres Capas
Las fluctuaciones imprevistas en la tasa de hash se amortiguan mediante **LWMA-1** (`N=60`) con acotamiento `+-33%` por bloque e independencia del timestamp candidato. Los ataques de reorganización profunda quedan neutralizados desde el Bloque 0 mediante **ECBP-1100 (MESS)** y una **finalidad rodante dura de 90 bloques (`MaxReorgDepth = 90`)**.

### 4. Tesorería de Protocolo Sostenible
Cada bloque divide su recompensa entre el minero (95% / 23.75 ROGUE) y la tesorería del protocolo (5% / 1.255 ROGUE), garantizando financiamiento continuo para desarrollo, auditorías, seguridad e incentivos del ecosistema, sin preventas ni asignaciones previas a inversores.
