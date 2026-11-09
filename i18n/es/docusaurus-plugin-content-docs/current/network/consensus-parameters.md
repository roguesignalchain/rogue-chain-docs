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
* `N = 60` (Cantidad de bloques previos evaluados)
* `T = 10s` (Tiempo objetivo de confirmación por bloque)
* `delta_t_i = clamp(t_i - t_{i-1}, -5*T, 6*T)` (Diferencias de tiempo filtradas contra valores anómalos)

### Ventajas de LWMA-1
* **Respuesta ágil:** Se equilibra en cuestión de minutos ante incrementos o caídas repentinas de mineros.
* **Inmunidad ante ataques de alquiler:** La potencia alquilada temporalmente no puede hundir artificialmente la dificultad antes de desconectarse.

---

## ⏱️ Reglas Estrictas de Marcas de Tiempo

Para proteger la red frente a desincronizaciones intencionadas:

1. **MTP-11 (Past Median Time):**
   * El tiempo del bloque $H$ debe ser estrictamente mayor que la mediana de los 11 bloques anteriores ($H-11$ a $H-1$).
2. **Límite de Deriva Futura:**
   * La marca de tiempo de un bloque candidato no puede superar en más de **15 segundos** el reloj local del nodo receptor. Si el desfase es mayor, el bloque es descartado.

---

## 💰 Modelo de Emisión y Halving

* **Recompensa Inicial:** 8 ROGUE por bloque
* **Frecuencia de Halving:** Cada 6,300,000 bloques (~2 años)
* **Porción del Minero (95%):** 7.6 ROGUE al inicio
* **Porción de Tesorería (5%):** 0.4 ROGUE al inicio
* **Límite Total de Emisión:** Exactamente 100,000,000 ROGUE (Hard Cap, emisión finita)
