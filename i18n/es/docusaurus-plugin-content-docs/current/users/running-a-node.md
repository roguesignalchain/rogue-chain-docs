---
sidebar_position: 1
title: Ejecutar un Nodo (Linux, macOS y Windows)
description: Múltiples enfoques para instalar, inicializar y ejecutar un nodo completo de Rogue Signal (core-rogue) en Linux, macOS y Windows.
---

# Ejecutar un Nodo en Diferentes Sistemas Operativos

El demonio **`core-rogue`** (`rogue-core-chain`) es el cliente oficial de nodo completo para la red **Rogue Signal**. Valida encabezados Proof-of-Work mediante **RandomX (`rx/0`)**, ejecuta transacciones EVM, mantiene el trie de estado global y expone una interfaz JSON-RPC 2.0 local.

Dependiendo de tu flujo de trabajo —ya sea que busques una experiencia gráfica sin terminal, una sesión rápida por línea de comandos o un demonio desatendido 24/7 en segundo plano— puedes ejecutar `core-rogue` mediante cualquiera de los siguientes enfoques.

---

## 💻 Requisitos de Hardware y Sistema Operativo

| Recurso | Mínimo | Recomendado (Nodo Activo / Minero) |
| :--- | :--- | :--- |
| **CPU** | x86_64 o ARM64 de 64 bits | CPU multinúcleo moderna con AVX2 y AES-NI (Intel 10ª gen+, AMD Ryzen 3000+ o Apple Silicon) |
| **RAM** | 4 GB | 8 GB (16 GB+ si minas en Modo Rápido de RandomX, que asigna un dataset de ~2.08 GB) |
| **Almacenamiento** | SSD de 100 GB | SSD NVMe de 200 GB+ |
| **Red** | Banda ancha de 10 Mbps | Banda ancha estable con el puerto TCP/UDP `38888` accesible para pares entrantes |
| **Sistema Operativo** | Linux, macOS 12+, Windows 10/11 (64 bits) | Ubuntu 22.04+ / Debian 12+, macOS 13+, Windows 11 |

---

## 🧭 Elegir tu Enfoque

1. **Enfoque 1 — Cliente Desktop sin CLI (Recomendado para la mayoría de usuarios):** Instala **Rogue Desktop Client**, que incluye `core-rogue` como sidecar integrado, inicializa el bloque génesis automáticamente y gestiona el ciclo de vida del nodo desde una interfaz gráfica. Consulta [Usar el Cliente Desktop](./desktop-client.md).
2. **Enfoque 2 — Binario Precompilado Independiente (CLI):** Descarga el archivo oficial de lanzamiento para tu sistema operativo, inicializa el estado génesis y ejecuta `core-rogue` directamente en una terminal. Ideal para comprobaciones rápidas, flags personalizados o configuraciones portátiles.
3. **Enfoque 3 — Servicio Persistente en Segundo Plano (`systemd`, `launchd`, Tarea/Servicio de Windows):** Ejecuta `core-rogue` de forma desatendida en segundo plano con reinicio automático ante fallos y arranque al iniciar el sistema. Ideal para nodos dedicados, validadores y mineros en solitario 24/7.

*(Si prefieres compilar `core-rogue` desde el código fuente, consulta la Guía de Desarrolladores: [Compilar desde el Código Fuente](../developers/compiling-from-source.md).)*

---

## 📦 Enfoque 2: Ejecutar Binarios Precompilados

Los archivos precompilados oficiales se publican en la página de [Lanzamientos de Rogue Signal Core Chain](https://github.com/roguesignalchain/rogue-core-chain/releases) junto con un archivo `SHA256SUMS`.

### Paso 1: Descargar y Verificar Checksums

Verifica siempre la integridad criptográfica del archivo descargado antes de ejecutarlo.

#### Linux (`.tar.gz`)
```bash
# Descargar el archivo y SHA256SUMS, luego verificar
sha256sum -c SHA256SUMS --ignore-missing

# Extraer el binario
tar -xzf core-rogue-linux-amd64.tar.gz
chmod +x core-rogue
```

#### macOS (`.tar.gz`)
```bash
# Verificar checksum
shasum -a 256 -c SHA256SUMS

# Extraer y eliminar el atributo de cuarentena de macOS Gatekeeper si es necesario
tar -xzf core-rogue-darwin-arm64.tar.gz
chmod +x core-rogue
xattr -d com.apple.quarantine ./core-rogue 2>/dev/null || true
```

#### Windows (`.zip` mediante PowerShell)
```powershell
# Verificar el hash SHA256 contra el valor publicado en SHA256SUMS
Get-FileHash .\core-rogue-windows-amd64.zip -Algorithm SHA256

# Extraer el archivo
Expand-Archive -Path .\core-rogue-windows-amd64.zip -DestinationPath C:\rogue-signal
cd C:\rogue-signal
```

---

### Paso 2: Inicializar el Bloque Génesis Integrado

Rogue Signal integra el estado génesis de **Chain ID `800055`** directamente dentro de `core-rogue` mediante el flag `--rogue`. **No** necesitas un archivo `genesis.json` externo. Ejecuta `init` una vez por directorio de datos:

#### Linux y macOS
```bash
./core-rogue --rogue --datadir ~/.local/share/rogue-signal/chaindata init
```

#### Windows (PowerShell)
```powershell
.\core-rogue.exe --rogue --datadir "$env:LOCALAPPDATA\rogue-signal\chaindata" init
```

Deberías ver la confirmación de que el estado génesis (`0xde4c5e747fbb072d39db2ece5a245e46b6164045e166301dfdba78f86cfbe4dd`) se escribió correctamente.

---

### Paso 3: Iniciar el Nodo en Primer Plano

Inicia el nodo con los puertos estándar de Rogue Signal (`38888` P2P, `38845` HTTP JSON-RPC):

#### Linux y macOS
```bash
./core-rogue --rogue \
  --datadir ~/.local/share/rogue-signal/chaindata \
  --port 38888 \
  --syncmode full \
  --cache 256 \
  --http --http.addr 127.0.0.1 --http.port 38845 --http.api eth,net,web3,randomx
```

#### Windows (PowerShell)
```powershell
.\core-rogue.exe --rogue `
  --datadir "$env:LOCALAPPDATA\rogue-signal\chaindata" `
  --port 38888 `
  --syncmode full `
  --cache 256 `
  --http --http.addr 127.0.0.1 --http.port 38845 --http.api eth,net,web3,randomx
```

:::info ¿Por qué `--syncmode full`?
Rogue Signal exige validación completa bloque por bloque (`--syncmode full`) para garantizar la verificación total de la prueba de trabajo RandomX y evitar inconsistencias de estado por snap-sync en cadenas PoW.
:::

---

### Paso 4: Verificar Sincronización y Pares

Abre una segunda terminal y consulta el endpoint local HTTP-RPC:

```bash
# Comprobar progreso de sincronización (devuelve false cuando está completamente sincronizado)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:38845

# Comprobar número de pares P2P conectados (hexadecimal)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://127.0.0.1:38845
```

En Windows PowerShell puedes usar `Invoke-RestMethod`:
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:38845 -Method Post -ContentType "application/json" `
  -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🔄 Enfoque 3: Ejecutar como Servicio Persistente en Segundo Plano

Para operación 24/7, ejecutar `core-rogue` como un servicio gestionado por el sistema operativo garantiza recuperación automática ante fallos, apagado limpio mediante `SIGTERM` (evitando corrupción de LevelDB) y persistencia al reiniciar.

### Linux (Instalador Automático `systemd` y Configuración Manual)

El repositorio `rogue-core-chain` incluye un instalador de servicios desatendido (`scripts/install-service.sh`) que soporta despliegues a nivel de **usuario** (sin root) y de **sistema** (`sudo`).

#### Opción A: `install-service.sh` Automatizado (Recomendado)
```bash
# 1. Instalar como servicio de usuario sin privilegios root (no requiere sudo)
./scripts/install-service.sh --user

# O: Instalar como servicio de sistema bajo un usuario dedicado 'rogue'
sudo ./scripts/install-service.sh --system

# Opcional: Activar minería CPU directamente en la unidad de servicio
./scripts/install-service.sh --user --mine --threads 4 --coinbase 0xTuDireccionRogue
```

Comandos útiles de gestión:
```bash
# Para modo --user:
systemctl --user status rogue-node.service
journalctl --user -u rogue-node.service -f

# Para modo --system:
sudo systemctl status rogue-node.service
sudo journalctl -u rogue-node.service -f
```

#### Opción B: Unidad `systemd` Manual
Si instalaste `core-rogue` en `/usr/local/bin/core-rogue`, crea `/etc/systemd/system/rogue-node.service`:

```ini
[Unit]
Description=Rogue Signal Headless Node (core-rogue)
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=rogue
Environment="ROGUE_DATADIR=/var/lib/rogue-signal/chaindata"
# Opcional: inyectar bootnodes dinámicos
# Environment="ROGUE_BOOTNODES=enode://<pubkey>@<ip>:38888"
ExecStartPre=/usr/local/bin/core-rogue --rogue --datadir ${ROGUE_DATADIR} init
ExecStart=/usr/local/bin/core-rogue \
    --rogue \
    --datadir ${ROGUE_DATADIR} \
    --http \
    --http.addr 127.0.0.1 \
    --http.port 38845 \
    --http.api eth,net,web3,randomx \
    --port 38888 \
    --nat any \
    --syncmode full \
    --cache 256
Restart=always
RestartSec=5s
LimitNOFILE=65535
TimeoutStopSec=30s
KillSignal=SIGTERM

[Install]
WantedBy=multi-user.target
```

Habilítalo e inícialo:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rogue-node.service
```

---

### macOS (Agente en Segundo Plano `launchd`)

En macOS, `launchd` gestiona agentes de usuario persistentes de forma nativa sin gestores de procesos de terceros.

1. Coloca el binario `core-rogue` en `/usr/local/bin/core-rogue` (o `/opt/homebrew/bin/core-rogue`).
2. Inicializa el directorio de datos una vez:
   ```bash
   mkdir -p ~/Library/Application\ Support/rogue-signal/chaindata
   mkdir -p ~/Library/Logs/rogue-signal
   /usr/local/bin/core-rogue --rogue --datadir ~/Library/Application\ Support/rogue-signal/chaindata init
   ```
3. Crea `~/Library/LaunchAgents/org.roguesignal.node.plist` (reemplaza `YOUR_USERNAME` por tu usuario de macOS):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>org.roguesignal.node</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/core-rogue</string>
    <string>--rogue</string>
    <string>--datadir</string>
    <string>/Users/YOUR_USERNAME/Library/Application Support/rogue-signal/chaindata</string>
    <string>--port</string>
    <string>38888</string>
    <string>--syncmode</string>
    <string>full</string>
    <string>--cache</string>
    <string>256</string>
    <string>--http</string>
    <string>--http.addr</string>
    <string>127.0.0.1</string>
    <string>--http.port</string>
    <string>38845</string>
    <string>--http.api</string>
    <string>eth,net,web3,randomx</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/Users/YOUR_USERNAME/Library/Logs/rogue-signal/node.out.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/YOUR_USERNAME/Library/Logs/rogue-signal/node.err.log</string>
</dict>
</plist>
```

4. Carga e inspecciona el agente:
   ```bash
   launchctl load -w ~/Library/LaunchAgents/org.roguesignal.node.plist
   tail -f ~/Library/Logs/rogue-signal/node.err.log
   ```
   Para detenerlo y descargarlo más adelante:
   ```bash
   launchctl unload ~/Library/LaunchAgents/org.roguesignal.node.plist
   ```

---

### Windows (Tarea Programada y Configuración de Firewall)

En Windows, puedes ejecutar `core-rogue.exe` de forma persistente al iniciar el sistema usando el **Programador de Tareas** (integrado en Windows) o un wrapper de servicio como **NSSM**.

#### 1. Permitir Tráfico P2P en el Firewall de Windows Defender
Abre **PowerShell como Administrador** y permite el puerto `38888` para el descubrimiento de pares:
```powershell
New-NetFirewallRule -DisplayName "Rogue Signal P2P (TCP)" -Direction Inbound -Protocol TCP -LocalPort 38888 -Action Allow
New-NetFirewallRule -DisplayName "Rogue Signal P2P (UDP)" -Direction Inbound -Protocol UDP -LocalPort 38888 -Action Allow
```

#### 2. Registrar una Tarea Persistente de Arranque (PowerShell)
```powershell
$Action = New-ScheduledTaskAction `
  -Execute "C:\rogue-signal\core-rogue.exe" `
  -Argument "--rogue --datadir `"$env:LOCALAPPDATA\rogue-signal\chaindata`" --port 38888 --syncmode full --cache 256 --http --http.addr 127.0.0.1 --http.port 38845 --http.api eth,net,web3,randomx"

$Trigger = New-ScheduledTaskTrigger -AtStartup
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName "RogueSignalNode" -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest
Start-ScheduledTask -TaskName "RogueSignalNode"
```

Para comprobar o detener la tarea:
```powershell
Get-ScheduledTask -TaskName "RogueSignalNode"
Stop-ScheduledTask -TaskName "RogueSignalNode"
```

---

## 🌐 Resumen de Puertos y Firewall

| Puerto | Protocolo | Enlace por Defecto | Propósito | ¿Exponer Públicamente? |
| :--- | :--- | :--- | :--- | :--- |
| **`38888`** | TCP y UDP | `0.0.0.0` | Gossip de bloques P2P y descubrimiento de pares | **Sí** (mejora la conectividad de pares) |
| **`38845`** | TCP | `127.0.0.1` | API HTTP JSON-RPC 2.0 | **No** (mantener local o detrás de proxy inverso TLS autenticado) |
| **`38846`** | TCP | `127.0.0.1` | API WebSocket JSON-RPC (cuando `--ws` está activo) | **No** |
| **`8551`** | TCP | `127.0.0.1` | Puerto interno Engine / AuthRPC | **No** |

---

## 🔗 Siguientes Pasos

* ¿Prefieres una billetera gráfica y minero en un clic? Continúa con [Usar el Cliente Desktop](./desktop-client.md).
* ¿Quieres optimizar tu CPU para minar? Lee la [Guía de Minería CPU RandomX](./mining-guide.md) y [Huge Pages y Optimización de CPU](./hugepages-tuning.md).
* ¿Compilando desde código fuente o ejecutando testnets locales? Consulta las [Guías de Desarrolladores](../developers/compiling-from-source.md).

