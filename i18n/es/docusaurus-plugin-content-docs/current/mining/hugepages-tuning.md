---
title: Huge Pages y Ajuste de CPU
description: Configuración de Huge Pages en Linux y optimización de hardware para maximizar hashrate.
---

# Huge Pages y Ajuste de CPU

RandomX crea un conjunto de datos (dataset) de **2080 MiB** en memoria RAM para calcular hashes a máxima velocidad. Si el sistema no tiene activadas las páginas grandes (**Huge Pages**), las pérdidas en la memoria intermedia de traducción (TLB) de la CPU pueden mermar el rendimiento entre un 30% y un 50%.

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
