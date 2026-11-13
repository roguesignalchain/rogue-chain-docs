---
title: Configuración del Nodo y Servicio Systemd
description: Cómo configurar core-rogue como servicio en segundo plano 24/7.
---

# Configuración del Nodo y Servicio Systemd

En servidores Linux, la mejor manera de mantener el nodo activo de forma ininterrumpida es mediante una unidad de servicio de `systemd`. Esto proporciona reinicios automáticos tras fallos y gestión centralizada de registros con `journalctl`.

---

## ⚙️ Archivo de Servicio para `systemd`

Crea el archivo `/etc/systemd/system/rogue-node.service`:

```ini
[Unit]
Description=Rogue Signal Core Blockchain Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=rogue
Group=rogue
WorkingDirectory=/var/lib/rogue
ExecStart=/usr/local/bin/core-rogue \
  --rogue \
  --datadir /var/lib/rogue/data \
  --http \
  --http.addr 127.0.0.1 \
  --http.port 38845 \
  --http.api eth,net,web3,rogue \
  --port 38888 \
  --maxpeers 50 \
  --metrics

# Opcional: inyectar bootnodes dinámicos mediante variable de entorno (enodes separados por comas)
# Environment="ROGUE_BOOTNODES=enode://<pubkey1>@<ip1>:38888,enode://<pubkey2>@<ip2>:38888,enode://<pubkey3>@<ip3>:38888"

Restart=always
RestartSec=10
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

---

## 🚀 Activación y Puesta en Marcha

Recarga el demonio de `systemd`, habilita el arranque automático con el sistema e inicia el servicio:

```bash
# Recargar configuración de systemd
sudo systemctl daemon-reload

# Habilitar inicio automático en el arranque
sudo systemctl enable rogue-node

# Arrancar el nodo
sudo systemctl start rogue-node

# Consultar los logs en tiempo real
sudo journalctl -u rogue-node -f
```

---

## 🌐 Bootnodes P2P y Descubrimiento Dinámico de Pares

Rogue Signal (`core-rogue`) admite la inyección dinámica de bootnodes para que las redes puedan arrancarse de forma limpia durante el desarrollo y en entornos de pruebas multi-VPS antes de que los bootnodes de mainnet queden codificados en `params.RogueBootnodes`.

### Prioridad de Resolución

Cuando `--rogue` está habilitado, `core-rogue` resuelve los nodos de arranque en el siguiente orden:

1. **Flag CLI `--bootnodes`** (máxima prioridad; sobrescribe todas las demás fuentes).
2. **Variable de entorno `ROGUE_BOOTNODES`** (URLs `enode://` separadas por comas; se evalúa dinámicamente cuando se omite `--bootnodes`).
3. **`params.RogueBootnodes`** (bootnodes compilados de mainnet; vacío durante el desarrollo previo a mainnet).
4. **Pares Manuales / Estáticos** (`<datadir>/geth/static-nodes.json` o `admin.addPeer(...)` por IPC).

### Arranque en Desarrollo y Multi-Validador (`ROGUE_BOOTNODES`)

Durante el desarrollo previo al lanzamiento, `params.RogueBootnodes` se mantiene intencionalmente vacío. Para garantizar la protección anti-eclipse (`defaultMinSyncPeers = 3`) y la finalidad artificial continua **ECBP-1100 (MESS)** (`minArtificialFinalityPeers = 3`), las topologías de producción deben desplegar **al menos 3 nodos validadores/semilla iniciales** en instancias VPS separadas.

1. **Obtén la URL enode de cada validador** mediante IPC:
   ```bash
   ./build/bin/core-rogue attach /var/lib/rogue/data/geth.ipc --exec "admin.nodeInfo.enode"
   ```
2. **Inyecta la lista de bootnodes dinámicamente** mediante `ROGUE_BOOTNODES`:
   ```bash
   ROGUE_BOOTNODES="enode://<pubkey1>@<vps1-ip>:38888,enode://<pubkey2>@<vps2-ip>:38888,enode://<pubkey3>@<vps3-ip>:38888" \
     ./build/bin/core-rogue --rogue --datadir /var/lib/rogue/data --port 38888 --http --http.port 38845
   ```

:::note Topologías de Testnet Pequeñas (< 3 Pares)
Si ejecutas una testnet local aislada de 1 o 2 nodos, la sincronización inicial igualmente progresa mediante el ticker `forceSyncCycle` de 10 segundos, mientras que `minArtificialFinalityPeers = 3` asegura el umbral completo de reactivación de MESS una vez que haya 3 o más pares conectados.
:::

---

## 🛡️ Endurecimiento del Protocolo y Perfil EVM (Bloque 0)

`RogueChainConfig` activa una base EVM moderna y endurecida desde el Bloque 0, manteniendo la simplicidad de transacciones únicamente heredadas (`Type 0`) y tarifas de gas predecibles:

* **EIPs de Seguridad de Berlin y London:** `EIP-2565` (ModExp), `EIP-2929` (reajuste de gas de acceso de estado frío/caliente frente a DoS de E/S en bloques de 50M de gas), `EIP-3529` (límite de reembolso de gas) y `EIP-3541` (rechazo de bytecode de contratos `0xEF`).
* **Opcodes de Shanghai y Cancun:** `EIP-3651` (`COINBASE` caliente), `EIP-3855` (`PUSH0`), `EIP-3860` (límite de tamaño y medición de initcode), `EIP-6049`, `EIP-5656` (`MCOPY`) y `EIP-1153` (`TSTORE`/`TLOAD`).
* **Anti-DoS en TxPool y RPC:** `TxPool` acotado a `3072` slots globales / `1024` en cola (~128 MB máx. de RAM), `PriceLimit = 1 GWei` y limitación configurable de concurrencia HTTP/WebSocket por IP (`--http.maxconnsperip`, predeterminado `100`, devolviendo `HTTP 429` con `Retry-After: 1`).
* **Endurecimiento detrás de Proxy Inverso (`--http.trustedproxies`):** Cerrado por defecto (*fail-closed*, usa la IP directa del par). Cuando se despliega detrás de Nginx, Caddy, Traefik o Cloudflare, configura `--http.trustedproxies "127.0.0.1/32"` (o los CIDRs de tu proxy) para extraer la IP real del cliente mediante el algoritmo **Rightmost Untrusted IP** sobre `X-Forwarded-For` (con respaldo de `X-Real-IP`), evitando evasiones por falsificación de cabeceras.
* **Caché de Verificación de Cabeceras por Lotes:** `MaxResolvedSeedCache = 2048` (~80 KB de RAM) evita la degradación LRU (*thrashing*) durante lotes paralelos de `VerifyHeaders`.
