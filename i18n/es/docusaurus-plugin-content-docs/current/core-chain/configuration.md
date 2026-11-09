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
  --http.port 8545 \
  --http.api eth,net,web3 \
  --maxpeers 50 \
  --metrics

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
