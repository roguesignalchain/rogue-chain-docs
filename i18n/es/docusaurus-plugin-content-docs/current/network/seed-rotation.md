---
title: Épocas de Seed de RandomX y Lag
description: Mecanismo de rotación de semillas y prevención de carreras en Rogue Signal.
---

# Épocas de Seed de RandomX y Lag

RandomX utiliza una clave criptográfica pseudoaleatoria (denominada **seed hash** o semilla) obtenida del historial de la cadena para generar su dataset de 2080 MiB. Para asegurar que todos los nodos calculen exactamente la misma información, el protocolo realiza una rotación periódica de semillas.

---

## 🔄 Calendario de Épocas y Parámetros

| Parámetro | Valor | Descripción |
| :--- | :--- | :--- |
| **Duración de la Época** | `2048 bloques` | Bloques entre cada cambio de semilla (~17.07 horas a 30s/bloque) |
| **Desfase (Lag)** | `64 bloques` | Margen de seguridad (~32 minutos) para calcular el nuevo dataset |
| **Tamaño del Dataset** | `2080 MiB` | Memoria RAM requerida para cálculo rápido (inicializado con `runtime.NumCPU() / 2` hilos) |
| **Tamaño de Scratchpad**| `2 MiB` | Memoria de ejecución rápida en caché L3 por hilo |

---

## 🛡️ El Mecanismo de Desfase de 64 Bloques y Resiliencia ante Reorgs

Construir el conjunto de datos de RandomX requiere varios segundos de cómputo en la CPU. Si la semilla cambiase exactamente en el bloque inmediato anterior (`H-1`), los nodos perderían bloques intentando calcular el nuevo dataset antes de poder validar transacciones.

Para solucionar este inconveniente:
* La semilla de la época `E` que comienza en el bloque `H = E * 2048` se obtiene del hash canónico del bloque:
  ```text
  Número de Bloque Semilla = (E * 2048) - 64
  ```
* De este modo, los mineros y validadores disponen de un margen garantizado de **1,920 segundos (~32 minutos / 64 bloques)** para calcular y almacenar el nuevo dataset en segundo plano utilizando `max(1, runtime.NumCPU() / 2)` hilos antes de alcanzar el bloque de cambio de época.
* **Validación Cruzada Canónica de Semilla:** En cada llamada a `EpochManager.GetSeed` o `GetContext`, el nodo comprueba que el hash almacenado para la época `E` coincida con `chain.GetHeaderByNumber(seedBlock)`. Si una reorganización legítima altera el bloque semilla, el contexto antiguo se cierra de forma segura (protegido por `defer ctx.mu.RUnlock()` en CGo) y se reconstruye automáticamente.
