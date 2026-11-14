---
sidebar_position: 5
title: Huge Pages y Optimización de CPU
description: Optimización de hardware, RAM dual-channel, dimensionamiento de caché L3 y ajuste de Huge Pages en Linux para máximo hashrate en RandomX.
---

# Huge Pages y Optimización de CPU

RandomX asigna un dataset de **2080 MiB** en Modo Rápido (o una caché de **256 MiB** en Modo Ligero) más **2 MiB** de memoria scratchpad por cada hilo de hashing. En páginas estándar de memoria de 4 KiB del sistema operativo, los fallos frecuentes del Translation Lookaside Buffer (TLB) reducen la eficiencia de hashing de la CPU. Habilitar **Huge Pages (páginas de 2 MiB)** reduce drásticamente la presión del TLB y aumenta el hashrate.

:::tip Intento Automático Cero-Configuración con Fallback
`core-rogue` intenta automáticamente asignar `FastDataset`, `LightCache` y los scratchpads de las VM usando HugePages del sistema operativo (`RANDOMX_FLAG_LARGE_PAGES`) por defecto; no se requieren flags CLI adicionales. Si el sistema operativo no dispone de suficientes HugePages libres, `core-rogue` registra un aviso informativo y recurre sin problemas a páginas de memoria estándar. Puedes verificar el uso activo de HugePages mediante `randomx_getConsensusStatus` (`vmPool.largePages: true/false`).
:::

---

## 🚀 Habilitar Huge Pages en Linux

Cada HugePage de 2 MiB proporciona 2 MiB de memoria contigua. Asignar `1280` HugePages reserva `2560 MiB` (~2.5 GB), lo que cubre cómodamente un dataset de Modo Rápido de 2080 MiB más los scratchpads multihilo de las VM.

### Asignación Temporal (Hasta el Próximo Reinicio)
```bash
sudo sysctl -w vm.nr_hugepages=1280
```

### Asignación Permanente
Añade el ajuste a `/etc/sysctl.conf` (o un archivo dedicado `/etc/sysctl.d/99-rogue-hugepages.conf`):
```ini
vm.nr_hugepages=1280
```
Aplica los cambios inmediatamente:
```bash
sudo sysctl -p
```

Verifica que las Huge Pages estén asignadas:
```bash
grep -i huge /proc/meminfo
```

*(Nota: Si ejecutas un servidor NUMA multisocket o deseas margen adicional durante transiciones de época de 2048 bloques donde coexisten brevemente dos datasets, considera `vm.nr_hugepages=2560` si tu sistema cuenta con 16 GB+ de RAM.)*

---

## ⚡ Buenas Prácticas de Hardware y Memoria

1. **La RAM Dual-Channel Es Esencial:**
   * RandomX está fuertemente limitado por el ancho de banda de memoria. Ejecutar la RAM en modo single-channel (un solo módulo instalado, o dos módulos en ranuras no emparejadas) puede degradar el hashrate en **un 40% o más**.
   * Instala módulos de memoria emparejados en las ranuras dual-channel según el manual de tu placa base (típicamente ranuras A2 y B2).

2. **Regla de Dimensionamiento de Caché L3:**
   * Cada hilo activo de minería RandomX requiere **2 MiB de caché L3 de CPU** para su scratchpad.
   * Calcula tu número óptimo de hilos:
     `Hilos Óptimos = Caché L3 Total (MiB) / 2`
   * *Ejemplo:* Un AMD Ryzen 7 5800X con 32 MiB de caché L3 puede ejecutar eficientemente `32 / 2 = 16` hilos. Superar la capacidad de tu caché L3 obliga a los hilos a desbordarse hacia la RAM del sistema más lenta, reduciendo a menudo el hashrate total mientras aumenta el consumo eléctrico.

3. **Optimización MSR (Model Specific Registers) en Linux:**
   * En sistemas Linux con CPUs AMD Zen, el ajuste del prefetcher de hardware mediante MSR puede aportar un aumento adicional del 10–15% en el hashrate de RandomX cuando se ejecuta con los permisos adecuados del kernel.

