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
| **Algoritmo de Consenso** | `RandomX (rx/0)` | Algoritmo intensivo en CPU resistente a ASICs |
| **Tiempo Objetivo por Bloque**| `10 segundos` | Confirmación ágil y rápida |
| **Recompensa por Bloque** | `8 ROGUE` | 95% Minero (7.6 ROGUE) / 5% Tesorería (0.4 ROGUE) |
| **Calendario de Halving** | `6,300,000 bloques` | Reducción a la mitad cada ~2 años aprox. |
| **Emisión Máxima** | `100,000,000 ROGUE` | Límite estricto (Hard Cap), sin emisión infinita |
| **Ajuste de Dificultad** | `LWMA-1 (N=60)` | Media móvil ponderada linealmente sobre 60 bloques |
| **Reglas de Tiempo** | `MTP-11 Estricto` | Tiempo de bloque > Mediana de los últimos 11, máx. 15s de deriva futura |
| **Rotación de Seed** | `2048 bloques` | Rotación de época RandomX con desfase preventivo de 64 bloques |

---

## 🛡️ Pilares de la Arquitectura

### 1. Resistencia Real a ASICs con RandomX
Rogue Signal implementa de forma nativa el algoritmo `RandomX` (`rx/0`) en el consenso del nodo. RandomX ejecuta secuencias de instrucciones aleatorias en una máquina virtual dedicada, lo que inutiliza la ventaja económica y de diseño de los chips especializados (ASICs). Cualquier persona con una CPU moderna puede minar y validar la red.

### 2. Compatibilidad Total con EVM
Construido sobre una sólida base Core-Geth optimizada, Rogue Signal ofrece compatibilidad completa con Solidity, librerías Web3 (`ethers.js`, `viem`, `web3.js`) y herramientas de desarrollo habituales como Hardhat, Foundry y MetaMask.

### 3. Dificultad Dinámica: LWMA-1
Las fluctuaciones imprevistas en la tasa de hash (saltos bruscos o alquiler de potencia) se amortiguan mediante el algoritmo **LWMA-1**. Calculando una media ponderada lineal sobre los últimos 60 bloques, la red adapta su dificultad rápidamente sin las oscilaciones violentas de los algoritmos tradicionales.

### 4. Tesorería de Protocolo Sostenible
Cada bloque divide su recompensa entre el minero (95% / 7.6 ROGUE) y la tesorería multi-firma del protocolo (5% / 0.4 ROGUE), garantizando financiamiento continuo para desarrollo, auditorías, seguridad e incentivos del ecosistema, sin preventas ni asignaciones previas a inversores.
