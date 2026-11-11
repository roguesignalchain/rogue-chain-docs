---
title: 节点服务配置与 Systemd
description: 如何将 core-rogue 配置为高可用 24/7 后台系统服务。
---

# 节点服务配置与 Systemd

在 Linux 服务器上维护稳定运行的区块链持久节点，最佳实践是使用 `systemd` 单元服务进行管理。这可以确保进程异常崩溃时自动重启、系统重启时平滑停机，并通过 `journalctl` 实现结构化的日志追踪。

---

## ⚙️ `systemd` 服务配置文件示例

创建配置文件 `/etc/systemd/system/rogue-node.service`：

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

## 🚀 启用与启动服务

重新加载 `systemd` 守护进程配置，设置开机自动启动并立即启动节点服务：

```bash
# 重载 systemd 配置
sudo systemctl daemon-reload

# 设置开机自启
sudo systemctl enable rogue-node

# 启动节点服务
sudo systemctl start rogue-node

# 查看实时运行日志
sudo journalctl -u rogue-node -f
```

