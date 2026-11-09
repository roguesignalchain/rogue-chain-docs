---
title: Minería con RandomX en CPU
description: Guía completa para minar ROGUE utilizando procesadores comerciales y RandomX.
---

# Minería con RandomX en CPU

La minería en **Rogue Signal** se sustenta en **RandomX** (`rx/0`), el algoritmo de referencia contra la centralización por ASICs. Al utilizar instrucciones y operaciones similares a las que ejecutan los ordenadores convencionales, los fabricantes de hardware especializado no pueden obtener ventajas desproporcionadas frente a las CPUs de consumo.

---

## ⛏️ Minería en Solitario con `core-rogue`

Puedes minar directamente desde el propio nodo hacia tu dirección:

```bash
./build/bin/core-rogue \
  --rogue \
  --mine \
  --miner.threads 8 \
  --miner.etherbase 0xTuDireccionRogueAqui
```

### Parámetros de Minado
* `--mine`: Activa los hilos de cálculo de minería internos.
* `--miner.threads <N>`: Asigna la cantidad de hilos de CPU dedicados al cálculo.
* `--miner.etherbase <0x...>`: Dirección de destino donde se depositarán las recompensas de bloque (7.6 ROGUE por bloque).

---

## 💻 Minería Visual con Rogue Desktop Client

Si prefieres una experiencia gráfica:

1. Abre **Rogue Desktop Client**.
2. Ve a la pestaña **Miner**.
3. Selecciona la cantidad de núcleos con la barra deslizante.
4. Pulsa **Start Mining**.
5. Podrás ver en tiempo real tu velocidad de cálculo (H/s), hashes completados y bloques minados.

---

## 🏊 Minería en Pools (Stratum)

Los grupos de minería (mining pools) permiten a mineros con potencias modestas sumar esfuerzos y percibir pagos frecuentes y proporcionales.

Los clientes de minería dedicados se conectan mediante el protocolo Stratum sobre TCP a las direcciones de los pools autorizados.
