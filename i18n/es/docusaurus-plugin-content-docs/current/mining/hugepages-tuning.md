---
title: Huge Pages y Ajuste de CPU
description: Configuración de Huge Pages en Linux y optimización de hardware para maximizar hashrate.
---

# Huge Pages y Ajuste de CPU

RandomX asigna un dataset de **2080 MiB** en Fast Mode (o una caché de **256 MiB** en Light Mode) para el cálculo de hashes. Sin Huge Pages habilitadas, los fallos en el búfer de traducción de direcciones (TLB) de la CPU reducen la eficiencia del hashing.

:::tip Try-with-Fallback Automático sin Configuración
`core-rogue` intenta automáticamente asignar `FastDataset`, `LightCache` y los *scratchpads* de la VM usando HugePages del sistema operativo (`RANDOMX_FLAG_LARGE_PAGES`) por defecto—no se requieren flags CLI adicionales. Si el sistema operativo no dispone de suficientes HugePages libres, `core-rogue` registra un aviso informativo y recurre de forma transparente a páginas de memoria estándar. Puedes verificar el uso activo de HugePages mediante `rogue_getConsensusStatus` (`vmPool.largePages: true/false`).
:::

---

## 🚀 Habilitar Huge Pages en Linux

### Asignación Temporal (Hasta el siguiente reinicio)
```bash
sudo sysctl -w vm.nr_hugepages=1280
```

### Configuración Permanente
Añade la siguiente línea en `/etc/sysctl.conf`:
```ini
vm.nr_hugepages=1280
```
Y aplica los cambios inmediatamente:
```bash
sudo sysctl -p
```

Para verificar que las páginas están activas:
```bash
grep -i huge /proc/meminfo
```

---

## ⚡ Consejos de Rendimiento de Hardware

1. **Memoria RAM en Dual-Channel:**
   * RandomX depende fuertemente del ancho de banda de memoria. Un sistema con memoria en canal simple (single-channel) pierde más de un 40% de hashrate.
   * Asegúrate de colocar los módulos en las ranuras correctas de la placa base (habitualmente ranuras 2 y 4).

2. **Regla de la Caché L3:**
   * Cada hilo activo de RandomX requiere **2 MiB de memoria caché L3**.
   * Cálculo de hilos óptimos: `Hilos Óptimos = Caché L3 Total (MiB) / 2`.
   * *Ejemplo:* Un AMD Ryzen 7 5800X con 32 MiB de caché L3 funcionará a máxima eficiencia con `32 / 2 = 16` hilos.

3. **Modificación de MSR (Model Specific Registers):**
   * En Linux, habilitar los ajustes de registros MSR en procesadores AMD Zen proporciona un incremento adicional del 10% al 15% en el hashrate.
