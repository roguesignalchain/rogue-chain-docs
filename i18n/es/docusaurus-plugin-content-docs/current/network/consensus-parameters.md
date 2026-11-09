---
title: Parámetros de Consenso y LWMA-1
description: Reglas matemáticas, ajuste de dificultad y modelo de emisión de ROGUE.
---

# Parámetros de Consenso y LWMA-1

Rogue Signal incorpora un motor de consenso diseñado para evitar manipulaciones de marcas temporales, ataques de retención de bloques y oscilaciones extremas de dificultad.

---

## 📐 Ajuste de Dificultad: LWMA-1

A diferencia de las ventanas estáticas de 2016 bloques de Bitcoin o las bombas de dificultad históricas de Ethereum, Rogue Signal ajusta su objetivo de dificultad en **cada bloque individual** mediante el algoritmo **LWMA-1** (Linearly Weighted Moving Average) con una ventana de `N = 60`:

```text
Nuevo Objetivo = (Objetivo Promedio * sum(i * delta_t_i)) / (0.5 * N * (N + 1) * T)
```

Donde:
* `N = 60` (Cantidad de bloques previos evaluados, ventana de ~30 minutos)
* `T = 30s` (Tiempo objetivo de confirmación por bloque)
* `delta_t_i = clamp(t_i - t_{i-1}, 1s, 6*T)` (Diferencias de tiempo acotadas entre `1s` y `180s`)
* El ajuste de dificultad por bloque se restringe entre el `67%` (`MaxClampDownFactor`) y el `133%` (`MaxClampUpFactor`) respecto a `parent.Difficulty`.

### Ventajas de LWMA-1
* **Independencia del Timestamp Candidato:** La dificultad del bloque `N` se calcula exclusivamente a partir de los bloques cerrados (`N-k .. N-1`). Un minero no puede manipular el `header.Time` de su propio bloque candidato para reducir su dificultad.
* **Respuesta ágil:** Se equilibra suavemente ante incrementos o caídas repentinas de mineros.
* **Inmunidad ante ataques de alquiler y flash-mining:** La potencia alquilada temporalmente no puede hundir artificialmente la dificultad antes de desconectarse.

---

## ⏱️ Reglas Estrictas de Marcas de Tiempo y Cabeceras

Para proteger la red frente a ataques time-warp, manipulación de dificultad y cabeceras infladas:

1. **MTP-11 (Past Median Time):**
   * El tiempo del bloque `H` debe ser estrictamente mayor que la mediana de los 11 bloques anteriores (`H-11` a `H-1`). Al ensamblar un bloque local (`Prepare`), si marcas de tiempo desordenadas hacen que `parent.Time + 1 <= MTP-11`, el nodo adelanta automáticamente `header.Time = MTP-11 + 1`.
2. **Límite de Deriva Futura:**
   * La marca de tiempo de un bloque candidato no puede superar en más de **15 segundos** el reloj local del nodo receptor. Si el desfase es mayor, el bloque es descartado.
3. **Límite `ExtraData` (`64 bytes`) y Verificación Paralela en Dos Fases:**
   * `header.Extra` está limitado estrictamente a `64 bytes` (`MaxExtraDataSize`). `VerifyHeaders` valida las reglas ligeras en microsegundos antes de distribuir `VerifySeal` entre `runtime.NumCPU()` workers en paralelo.

---

## 🛡️ Finalidad Anti-51% de Tres Capas

1. **Finalidad Rodante Dura (`MaxReorgDepth = 90` bloques):**
   * Cualquier reorganización con profundidad mayor a `90 bloques` (~45 minutos) es rechazada incondicionalmente en `ForkChoice.ReorgNeeded`.
2. **ECBP-1100 (MESS) desde el Bloque 0:**
   * Las bifurcaciones secretas de profundidad `1..90` enfrentan una curva de gravedad polinómica cúbica que exige hasta **`31x` la dificultad de la subcadena local**.
3. **Desempate Anti-Selfish Mining:**
   * En empates de dificultad total, el nodo preserva su bloque minado localmente o desempata entre bloques externos mediante selección aleatoria criptográfica 50/50 (`crypto/rand`).

---

## 💰 Modelo de Emisión y Halving

* **Recompensa Inicial:** 24 ROGUE por bloque
* **Frecuencia de Halving:** Cada 2,100,000 bloques (~2 años / ~729.16 días a 30s por bloque)
* **Porción del Minero (95%):** 22.8 ROGUE al inicio (+ 100% de las comisiones de gas del bloque)
* **Porción de Tesorería (5%):** 1.2 ROGUE al inicio
* **Límite Total de Emisión:** 100,000,000 ROGUE (100.8M exacto en 32 eras de halving, cero tail emission)
