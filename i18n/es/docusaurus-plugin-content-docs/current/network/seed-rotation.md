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
| **Duración de la Época** | `2048 bloques` | Bloques entre cada cambio de semilla (~5.7 horas) |
| **Desfase (Lag)** | `64 bloques` | Margen de seguridad para calcular el nuevo dataset |
| **Tamaño del Dataset** | `2080 MiB` | Memoria RAM requerida para cálculo rápido |
| **Tamaño de Scratchpad**| `2 MiB` | Memoria de ejecución rápida en caché L3 por hilo |

---

## 🛡️ El Mecanismo de Desfase de 64 Bloques

Construir el conjunto de datos de RandomX requiere unos segundos de cómputo en la CPU. Si la semilla cambiase exactamente en el bloque inmediato anterior ($H-1$), los nodos perderían bloques intentando calcular el nuevo dataset antes de poder validar transacciones.

Para solucionar este inconveniente:
* La semilla de la época que comienza en el bloque `H` se toma del bloque:
  ```text
  Número de Bloque Semilla = H - 64
  ```
* De este modo, los mineros y validadores disponen de un margen garantizado de **640 segundos (64 bloques)** para calcular y almacenar el nuevo dataset en segundo plano antes de que se alcance el bloque de cambio de época.
