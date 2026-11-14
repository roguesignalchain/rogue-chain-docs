---
sidebar_position: 2
title: Usar el Cliente Desktop
description: "Guía completa de usuario para instalar y utilizar Rogue Desktop Client: billetera, gestor de nodo integrado, minero CPU RandomX, explorador local y consola."
---

# Usar el Cliente Desktop de Rogue

El **`rogue-desktop-client`** es la billetera gráfica oficial, gestor de nodo local y minero CPU RandomX para la blockchain Rogue Signal. Construido con **Tauri v2** (Rust) y **React**, ofrece rendimiento nativo con un consumo mínimo de memoria mientras integra el binario del nodo `core-rogue` directamente como un sidecar gestionado.

---

## 🖥️ Instaladores por Plataforma

Los instaladores precompilados y paquetes portátiles se publican en la página de [Lanzamientos de Rogue Desktop Client](https://github.com/roguesignalchain/rogue-desktop-client/releases):

| Sistema Operativo | Formatos Disponibles | Notas |
| :--- | :--- | :--- |
| **Linux** | `.deb` (Debian/Ubuntu) y `.AppImage` portátil | Haz ejecutable el `.AppImage` con `chmod +x Rogue-Desktop*.AppImage` |
| **Windows** | Instalador `.msi` y `.exe` (NSIS) | Requiere Windows 10/11 (64 bits) con WebView2 Runtime |
| **macOS** | `.dmg` Universal (Apple Silicon e Intel) | Arrastra a Aplicaciones; si se descargó fuera de la App Store, permítelo en Ajustes del Sistema → Privacidad y Seguridad |

---

## 🚀 Primer Inicio y Ciclo de Vida del Nodo Integrado

Al abrir **Rogue Desktop Client**, no necesitas configurar un nodo separado manualmente:

1. **Resolución Automática del Binario:** El backend en Rust (`process_manager.rs`) localiza el sidecar `core-rogue` empaquetado junto al ejecutable de la aplicación (o recurre a una instalación en el `PATH` del sistema).
2. **Inicialización Automática del Génesis:** Si el directorio de datos configurado aún no contiene `geth/chaindata`, el cliente ejecuta automáticamente `core-rogue --rogue --datadir <ruta> init` en segundo plano para inicializar el Bloque 0 (`Chain ID 800055`).
3. **Reutilización de Nodos Locales Activos:** Si ya hay un nodo `core-rogue` ejecutándose y respondiendo en tu puerto HTTP RPC configurado (por defecto `38845`), el Cliente Desktop lo detecta y se conecta a esa instancia activa en lugar de lanzar un proceso duplicado en conflicto.
4. **Apagado Limpio:** Al cerrar la aplicación se detiene ordenadamente cualquier proceso sidecar que haya iniciado, protegiendo la base de datos LevelDB frente a corrupciones.

---

## 🧭 Recorrido por la Interfaz

La barra lateral izquierda da acceso a seis espacios de trabajo principales:

### 1. Dashboard (Panel Principal)
El **Dashboard** ofrece una vista rápida del estado de tu nodo, billetera y minería:
* **Telemetría de Nodo y Sincronización:** Indicador en vivo que muestra si el proceso local `core-rogue` está activo, su PID, número de pares P2P conectados y altura de bloque actual / porcentaje de sincronización.
* **Saldo de la Billetera Activa:** Saldo en tiempo real de `ROGUE` para la cuenta seleccionada.
* **Reputación de Minero On-Chain:** Consulta el contrato del sistema `RogueMinerReputation` (`0x0000000000000000000000000000000000000020`) directamente mediante `eth_call` para mostrar tu rango cyberpunk actual (ej., *Unranked Runner* hasta *Rogue Singularity*), bloques totales minados y progreso hacia el siguiente nivel.
* **Bloques Recientes:** Flujo en vivo de los últimos bloques validados por tu nodo.

---

### 2. Wallet (Billetera)
La vista **Wallet** es una billetera HD totalmente autocustodial respaldada por una bóveda local cifrada (`.rogue-wallet.vault`):

* **Crear una Nueva Billetera:** Genera una frase mnemónica **BIP-39 de 12 o 24 palabras** usando un generador de números aleatorios criptográficamente seguro (CSPRNG) y la cifra con tu contraseña maestra.
* **Importar una Billetera Existente:** Restaura cualquier frase semilla BIP-39 existente (12 o 24 palabras) y asígnale una etiqueta identificativa.
* **Soporte Multi-Billetera y Derivación de Cuentas HD:**
  * Almacena y cambia entre múltiples billeteras independientes dentro de la misma bóveda cifrada.
  * Deriva direcciones adicionales a partir de la misma frase semilla usando la ruta de derivación estándar EVM BIP-44: `m/44'/60'/0'/0/índice`.
* **Envío de Transacciones `ROGUE`:**
  * Introduce la dirección `0x...` de destino, la cantidad en `ROGUE` y revisa la comisión de gas (suelo mínimo de `1 Gwei`).
  * Las transacciones se firman localmente en Rust usando `secp256k1` y se transmiten como transacciones sin formato **Legacy (`Type 0`)** mediante `eth_sendRawTransaction`: tus claves privadas nunca abandonan tu equipo.
* **Seguridad de Autobloqueo:** Tras un periodo configurable de inactividad (por defecto **15 minutos**), la bóveda se bloquea automáticamente en memoria, solicitando tu contraseña maestra para volver a firmar transacciones o visualizar material sensible.

---

### 3. Mining (Minería)
La pestaña **Mining** convierte tu escritorio en un minero en solitario RandomX de nodo completo sin dependencias de pools externos:

* **Diagnóstico de Hardware (`Check System Resources`):** Analiza los núcleos lógicos de tu CPU y la RAM disponible para calcular una cantidad óptima de hilos y perfil de memoria seguros.
* **Selector de Modo de Memoria (Light vs. Fast):**
  * **Modo Ligero (~256 MiB RAM, Por Defecto):** Ideal para minar en segundo plano o equipos con 4–8 GB de RAM sin afectar la fluidez diaria del escritorio.
  * **Modo Rápido (~2080 MiB RAM):** Asigna el dataset completo de RandomX de 2.08 GB en RAM para obtener el máximo hashrate de CPU. Recomendado en sistemas con 16 GB+ de RAM.
* **Control Deslizante de Hilos CPU:** Ajusta cuántos hilos dedicar al hashing RandomX. Para máxima eficiencia, ajústalo a la caché L3 de tu CPU (`Caché L3 en MiB / 2`).
* **Dirección de Pago (`Coinbase`):** Utiliza automáticamente la dirección activa de tu billetera desbloqueada (o cualquier dirección `etherbase` configurada) para que los **23.75 ROGUE** por bloque minado + el 100% de las comisiones de transacción del bloque lleguen directamente a ti.
* **Protección Sync-Gating:** El control de inicio de minería verifica que tu nodo esté en ejecución, conectado a al menos 1 par y sincronizado con la punta de la cadena antes de comenzar el hashing, evitando trabajo desperdiciado en bloques obsoletos.
* **Telemetría en Vivo:** Muestra el hashrate en tiempo real (`H/s`), estado activo y bloques minados recientemente.

---

### 4. Explorer (Explorador)
La pestaña **Explorer** ofrece un navegador integrado y sin confianza (trustless) de bloques y transacciones respaldado directamente por la API JSON-RPC de tu nodo local:
* Busca o explora números de bloque recientes, hashes de bloque, marcas de tiempo, direcciones de mineros (`coinbase`), gas usado y recibos individuales de transacciones sin depender de exploradores web externos.

---

### 5. Node Console (Consola del Nodo)
La **Node Console** transmite en vivo la salida de logs `stdout` y `stderr` directamente desde el proceso `core-rogue` gestionado:
* Supervisa handshakes de pares, importación de bloques, inicialización del dataset RandomX, avisos de fallback de HugePages y descubrimiento de bloques minados en tiempo real.
* Muy útil para diagnosticar problemas de firewall, conectividad de bootnodes o comportamiento de flags personalizados sin abrir una terminal.

---

### 6. Settings (Configuración)
La pestaña **Settings** expone control total sobre la conexión RPC del Cliente Desktop, el temporizador de autobloqueo, los parámetros del nodo local `core-rogue` y el mantenimiento de la base de datos.

Para un desglose completo de cada ajuste, valor por defecto y buenas prácticas de seguridad, continúa en [Configuración del Cliente Desktop y Seguridad del Vault](./desktop-configuration.md).
