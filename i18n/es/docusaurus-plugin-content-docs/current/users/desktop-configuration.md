---
sidebar_position: 3
title: Configuración del Desktop y Seguridad del Vault
description: Referencia completa de todos los ajustes de Rogue Desktop Client, parámetros del nodo, mantenimiento de base de datos y seguridad de la bóveda Argon2id + AES-256-GCM.
---

# Configuración del Desktop y Seguridad del Vault

Esta guía explica cada opción de configuración disponible en la pestaña **Settings** de **Rogue Desktop Client**, cómo se mapean estos ajustes al demonio `core-rogue` subyacente y cómo se protegen tus claves privadas en disco.

---

## ⚙️ Referencia de Ajustes

### 1. Ajustes del Gestor de Nodo Local

Estos parámetros controlan el proceso sidecar `core-rogue` gestionado por el Cliente Desktop. Los cambios surten efecto la próxima vez que detengas e inicies el nodo.

| Ajuste | Valor por Defecto | Flag CLI Subyacente | Descripción y Recomendación |
| :--- | :--- | :--- | :--- |
| **Puerto P2P** | `38888` | `--port` | Puerto TCP/UDP usado para descubrir pares e intercambiar bloques/transacciones. Redirige este puerto en tu router/firewall para mejorar la conectividad. |
| **Puerto HTTP RPC** | `38845` | `--http.port` | Puerto local (`127.0.0.1`) donde `core-rogue` atiende peticiones JSON-RPC 2.0. Incluye un botón de sincronización rápida para actualizar automáticamente la **URL del Endpoint RPC** y que coincida. |
| **Puerto WebSocket** | `0` (Desactivado) | `--ws.port` | Establecido en `0` por defecto para evitar colisiones de puertos si otro nodo está corriendo localmente. Configúralo en `38846` (u otro puerto libre distinto al puerto HTTP) para activar suscripciones `--ws`. |
| **Directorio de Datos (`datadir`)** | Datos de App del SO / `./nodes-local/node-desktop` (dev) | `--datadir` | Ruta del sistema de archivos donde se almacena `geth/chaindata` (estado y bloques). Requiere 100–200+ GB de espacio libre en SSD/NVMe a medida que crece la cadena. |
| **Bootnodes** | `enode://...` semilla por defecto de Rogue Signal | `--bootnodes` | Lista separada por comas de URLs `enode://<pubkey>@<ip>:<puerto>` para arrancar el descubrimiento P2P al inicio. Déjalo vacío para usar `ROGUE_BOOTNODES` o los valores integrados de red. |
| **Caché de Base de Datos (MB)** | `256` | `--cache` | Memoria (en MiB) asignada a la caché de LevelDB y del trie de estado. Haz clic en **Check System Resources** en Settings para detectar automáticamente los núcleos de tu CPU y RAM disponible y aplicar un tamaño de caché recomendado. |
| **Modo de Sincronización (`Sync Mode`)** | `full` | `--syncmode` | **Se exige validación completa** (`full`). Incluso si se selecciona `snap` en la interfaz, el gestor de procesos del Cliente Desktop fuerza `--syncmode full` para garantizar la verificación completa de PoW RandomX y evitar corrupción de estado por snap-sync. |
| **Verbosidad de Logs (`Log Verbosity`)** | `3` (Info) | `--verbosity` | Controla el detalle de logs de `core-rogue` enviados a **Node Console**: `0` (Silencioso), `1` (Error), `2` (Advertencia), `3` (Info), `4` (Debug), `5` (Detalle/Trace). |

:::tip Restablecer Valores por Defecto
Puedes hacer clic en **Reset Defaults** en cualquier momento dentro de Settings para restaurar los puertos estándar de Rogue Signal (`38845` HTTP, `38846` WS, `38888` P2P), `256 MB` de caché, modo `full`, verbosidad `3` y `15` minutos de autobloqueo.
:::

---

### 2. Ajustes de RPC y Seguridad de la Aplicación

| Ajuste | Valor por Defecto | Descripción y Recomendación |
| :--- | :--- | :--- |
| **URL del Endpoint RPC** | `http://127.0.0.1:38845` | Endpoint JSON-RPC utilizado por las vistas Wallet, Dashboard, Mining y Explorer. Apúntalo a `http://127.0.0.1:<puerto>` para tu nodo local, o introduce la URL de un nodo remoto/VPS (ej. detrás de HTTPS) si no deseas ejecutar un nodo local. |
| **Temporizador de Autobloqueo (Minutos)** | `15` | Bloquea automáticamente la billetera descifrada en memoria tras `N` minutos de inactividad. Establece un intervalo más corto (ej. `5` minutos) en equipos compartidos o portátiles. |

---

### 3. Control del Nodo y Mantenimiento de Base de Datos (Zona de Peligro)

En la parte superior de Settings puedes usar **Start Node** o **Stop Node** manualmente sin reiniciar el Cliente Desktop.

En la parte inferior de Settings, la **Danger Zone** ofrece **Clean Chaindata**:
* **Qué hace:** Detiene el proceso gestionado `core-rogue` (si está activo) y elimina el directorio `geth/chaindata` dentro de tu `datadir` configurado. En el siguiente inicio, el nodo reinicializa el Bloque 0 y resincroniza la blockchain desde cero.
* **Cuándo usarlo:** Únicamente si tu base de datos local de la cadena se corrompe tras un corte inesperado de energía, o al cambiar entre testnets locales incompatibles.
* **Qué NUNCA toca:** **Clean Chaindata NO elimina tu `.rogue-wallet.vault` ni tus claves privadas.** Tus fondos y billeteras permanecen completamente intactos.

---

## 🔐 Seguridad del Vault y Arquitectura Criptográfica

La seguridad de tus fondos `ROGUE` depende de la confidencialidad e integridad de tus claves privadas. El Cliente Desktop implementa una arquitectura de bóveda local estrictamente autocustodial y de conocimiento cero:

1. **Generación de Mnemónicos BIP-39 mediante CSPRNG:**
   * Las billeteras nuevas generan una frase mnemónica BIP-39 en inglés de 12 palabras (128 bits de entropía) o 24 palabras (256 bits de entropía) usando el generador de números aleatorios criptográficamente seguro del sistema operativo.
   * Las cuentas se derivan de forma determinista mediante **HMAC-SHA512** siguiendo la ruta estándar EVM BIP-44: `m/44'/60'/0'/0/0` (y `.../1`, `.../2`, etc. para cuentas adicionales).

2. **Cifrado en Disco Argon2id + AES-256-GCM:**
   * Todas las billeteras, etiquetas y mnemónicos se almacenan localmente en `.rogue-wallet.vault`.
   * Tu contraseña maestra nunca se guarda en disco. En su lugar, se combina con un salt aleatorio de 16 bytes y se procesa mediante **Argon2id** (una función de derivación de claves resistente a memoria, diseñada contra ataques por fuerza bruta con GPU/ASIC) para derivar una clave de cifrado de 256 bits.
   * El contenido de la bóveda se cifra y autentica mediante **AES-256-GCM** con un nonce criptográfico único, protegiendo tanto la confidencialidad como la integridad frente a manipulaciones.

3. **Firma Únicamente en Memoria:**
   * Las transacciones se firman en memoria dentro del backend en Rust (`secp256k1`) y se transmiten al nodo como payloads hexadecimales firmados Legacy (`Type 0`). Las claves privadas nunca se exponen a endpoints RPC ni a pares de la red.

---

## ⚠️ Buenas Prácticas de Respaldo Seguro

> [!CAUTION]
> Nunca almacenes tu frase semilla de 12 o 24 palabras sin cifrar en correo electrónico, almacenamiento en la nube, capturas de pantalla o aplicaciones de mensajería. Cualquiera que obtenga tu frase semilla tendrá acceso inmediato e irreversible a todas las cuentas derivadas y a tus fondos.

* **Respaldo Físico Offline:** Anota tu frase de recuperación en papel o grábala en una placa metálica ignífuga y guárdala en un lugar físico seguro.
* **Verifica la Recuperación Antes de Transferencias Grandes:** Tras crear una billetera, comprueba que anotaste cada palabra en el orden exacto antes de enviar saldos importantes de `ROGUE`.
* **Contraseña Maestra Robusta:** Utiliza una contraseña maestra única y de alta entropía para `.rogue-wallet.vault`, de modo que incluso si una copia local del disco queda expuesta, el cifrado Argon2id + AES-256-GCM no pueda ser vulnerado por fuerza bruta.
* **Respaldo del Archivo Vault (Opcional):** Puedes hacer copia de seguridad de `.rogue-wallet.vault` junto con tu respaldo físico de la frase semilla, siempre que recuerdes tu contraseña maestra.

