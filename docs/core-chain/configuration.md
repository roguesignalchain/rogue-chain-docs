---
title: Node Configuration & Systemd
description: Configuring core-rogue as a persistent background service.
---

# Node Configuration & Systemd

Running a persistent node on a Linux server is best managed using a `systemd` service unit. This guarantees automatic restart upon crashes, graceful shutdown on server reboot, and structured log management via `journalctl`.

---

## ⚙️ Example `systemd` Service File

Create `/etc/systemd/system/rogue-node.service`:

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

## 🚀 Enabling and Starting the Service

Reload `systemd` daemon, enable automatic start at boot, and launch the service:

```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable service at system startup
sudo systemctl enable rogue-node

# Start the node
sudo systemctl start rogue-node

# Inspect live logs
sudo journalctl -u rogue-node -f
```
