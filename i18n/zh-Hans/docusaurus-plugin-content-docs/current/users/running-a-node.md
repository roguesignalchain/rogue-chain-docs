---
sidebar_position: 1
title: 运行节点（Linux、macOS 与 Windows）
description: "在 Linux、macOS 和 Windows 上安装、初始化并运行 Rogue Signal (core-rogue) 全节点的多种方法。"
---

# 跨操作系统运行节点

**`core-rogue`** 守护进程（`rogue-core-chain`）是 **Rogue Signal** 网络的官方全节点客户端。它使用 **RandomX (`rx/0`)** 验证工作量证明（PoW）区块头、执行 EVM 交易、维护全局状态树，并对外提供本地 JSON-RPC 2.0 接口。

根据你的使用场景——无论是无命令行的图形界面、快速终端会话，还是 24/7 无人值守后台服务——你都可以选择以下任意一种方式运行 `core-rogue`。

---

## 💻 硬件与操作系统要求

| 资源 | 最低要求 | 推荐配置（活跃节点 / 矿工） |
| :--- | :--- | :--- |
| **CPU** | 64 位 x86_64 或 ARM64 | 支持 AVX2 和 AES-NI 的现代多核处理器（Intel 第 10 代+、AMD Ryzen 3000+ 或 Apple Silicon） |
| **内存 (RAM)** | 4 GB | 8 GB（如果以 RandomX 快速模式挖矿，建议 16 GB+，该模式需分配约 2.08 GB 数据集） |
| **存储** | 100 GB SSD | 200 GB+ NVMe SSD |
| **网络** | 10 Mbps 宽带 | 稳定宽带，并开放 TCP/UDP `38888` 端口以接收外部节点连接 |
| **操作系统** | Linux、macOS 12+、Windows 10/11（64 位） | Ubuntu 22.04+ / Debian 12+、macOS 13+、Windows 11 |

---

## 🧭 选择适合你的方式

1. **方式 1 — 零命令行桌面客户端（推荐大多数用户使用）：** 安装 **Rogue Desktop Client**，它内置了 `core-rogue` 边车进程，可自动初始化创世区块并通过图形界面管理节点生命周期。参见 [使用桌面客户端](./desktop-client.md)。
2. **方式 2 — 预编译独立二进制文件（CLI）：** 下载对应操作系统的官方发布压缩包，初始化创世状态并在终端中直接运行 `core-rogue`。适合快速测试、自定义启动参数或便携部署。
3. **方式 3 — 持久化后台服务（`systemd`、`launchd`、Windows 任务计划/服务）：** 在后台无人值守运行 `core-rogue`，支持故障自动重启与开机自启。适合专用节点、验证者以及 24/7 独立矿工。

*（如果你希望从源码自行编译 `core-rogue`，请参阅开发者指南：[从源码编译](../developers/compiling-from-source.md)。）*

---

## 📦 方式 2：运行预编译二进制文件

官方预编译归档包与校验文件 `SHA256SUMS` 均发布在 [Rogue Signal Core Chain Releases](https://github.com/roguesignalchain/rogue-core-chain/releases) 页面。

### 步骤 1：下载并校验 Checksum

在运行任何二进制文件前，请务必验证下载压缩包的加密校验和。

#### Linux (`.tar.gz`)
```bash
# 下载压缩包和 SHA256SUMS 后进行校验
sha256sum -c SHA256SUMS --ignore-missing

# 解压二进制文件
tar -xzf core-rogue-linux-amd64.tar.gz
chmod +x core-rogue
```

#### macOS (`.tar.gz`)
```bash
# 校验 SHA256
shasum -a 256 -c SHA256SUMS

# 解压并在需要时移除 macOS Gatekeeper 隔离属性
tar -xzf core-rogue-darwin-arm64.tar.gz
chmod +x core-rogue
xattr -d com.apple.quarantine ./core-rogue 2>/dev/null || true
```

#### Windows（`.zip`，使用 PowerShell）
```powershell
# 将计算的 SHA256 哈希与 SHA256SUMS 中的值比对
Get-FileHash .\core-rogue-windows-amd64.zip -Algorithm SHA256

# 解压归档
Expand-Archive -Path .\core-rogue-windows-amd64.zip -DestinationPath C:\rogue-signal
cd C:\rogue-signal
```

---

### 步骤 2：初始化内置创世区块

Rogue Signal 通过 `--rogue` 参数将 **Chain ID `800055`** 的创世状态直接内嵌在 `core-rogue` 中，**无需**外部 `genesis.json` 文件。每个数据目录只需执行一次 `init`：

#### Linux 与 macOS
```bash
./core-rogue --rogue --datadir ~/.local/share/rogue-signal/chaindata init
```

#### Windows (PowerShell)
```powershell
.\core-rogue.exe --rogue --datadir "$env:LOCALAPPDATA\rogue-signal\chaindata" init
```

执行后应能看到创世状态（`0xde4c5e747fbb072d39db2ece5a245e46b6164045e166301dfdba78f86cfbe4dd`）已成功写入的确认信息。

---

### 步骤 3：在前台启动节点

使用 Rogue Signal 标准端口（P2P `38888`，HTTP JSON-RPC `38845`）启动节点：

#### Linux 与 macOS
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

:::info 为什么使用 `--syncmode full`？
Rogue Signal 强制使用逐块完整验证（`--syncmode full`），以确保对 RandomX 工作量证明进行完整校验，避免 PoW 链上因 snap-sync 导致的状态不一致问题。
:::

---

### 步骤 4：验证同步与节点连接

打开第二个终端，向本地 HTTP-RPC 接口发送查询：

```bash
# 检查同步进度（完全同步后返回 false）
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:38845

# 检查已连接的 P2P 节点数（十六进制）
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://127.0.0.1:38845
```

在 Windows PowerShell 中可使用 `Invoke-RestMethod`：
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:38845 -Method Post -ContentType "application/json" `
  -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🔄 方式 3：作为持久化后台服务运行

对于 24/7 长期运行，将 `core-rogue` 配置为操作系统托管服务可确保异常崩溃自动重启、通过 `SIGTERM` 优雅关机（防止 LevelDB 数据库损坏）以及开机自启。

### Linux（`systemd` 自动安装脚本与手动配置）

`rogue-core-chain` 仓库提供了无人值守服务安装脚本（`scripts/install-service.sh`），同时支持**用户级**（无需 root）和**系统级**（`sudo`）部署。

#### 选项 A：使用 `install-service.sh` 自动安装（推荐）
```bash
# 1. 安装为用户级无 root 权限服务（不需要 sudo）
./scripts/install-service.sh --user

# 或者：安装为系统级服务并运行在专用 'rogue' 用户下
sudo ./scripts/install-service.sh --system

# 可选：直接在服务单元中启用 CPU 挖矿
./scripts/install-service.sh --user --mine --threads 4 --coinbase 0xYourRogueAddress
```

常用管理命令：
```bash
# 针对 --user 模式：
systemctl --user status rogue-node.service
journalctl --user -u rogue-node.service -f

# 针对 --system 模式：
sudo systemctl status rogue-node.service
sudo journalctl -u rogue-node.service -f
```

#### 选项 B：手动创建 `systemd` 服务单元
如果你将 `core-rogue` 安装在 `/usr/local/bin/core-rogue`，可创建 `/etc/systemd/system/rogue-node.service`：

```ini
[Unit]
Description=Rogue Signal Headless Node (core-rogue)
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=rogue
Environment="ROGUE_DATADIR=/var/lib/rogue-signal/chaindata"
# 可选：注入动态引导节点
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

启用并启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rogue-node.service
```

---

### macOS（`launchd` 后台代理）

在 macOS 上，`launchd` 可以原生管理持久化用户代理，无需第三方进程管理器。

1. 将 `core-rogue` 二进制文件放到 `/usr/local/bin/core-rogue`（或 `/opt/homebrew/bin/core-rogue`）。
2. 初始化一次数据目录：
   ```bash
   mkdir -p ~/Library/Application\ Support/rogue-signal/chaindata
   mkdir -p ~/Library/Logs/rogue-signal
   /usr/local/bin/core-rogue --rogue --datadir ~/Library/Application\ Support/rogue-signal/chaindata init
   ```
3. 创建 `~/Library/LaunchAgents/org.roguesignal.node.plist`（将 `YOUR_USERNAME` 替换为你的 macOS 用户名）：

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

4. 加载并查看日志：
   ```bash
   launchctl load -w ~/Library/LaunchAgents/org.roguesignal.node.plist
   tail -f ~/Library/Logs/rogue-signal/node.err.log
   ```
   如需停止并卸载：
   ```bash
   launchctl unload ~/Library/LaunchAgents/org.roguesignal.node.plist
   ```

---

### Windows（计划任务与防火墙配置）

在 Windows 上，你可以使用内置的**任务计划程序（Task Scheduler）**或 **NSSM** 等服务封装工具在开机时持久运行 `core-rogue.exe`。

#### 1. 在 Windows Defender 防火墙中放行 P2P 流量
以**管理员身份运行 PowerShell** 并放行 `38888` 端口以进行节点发现：
```powershell
New-NetFirewallRule -DisplayName "Rogue Signal P2P (TCP)" -Direction Inbound -Protocol TCP -LocalPort 38888 -Action Allow
New-NetFirewallRule -DisplayName "Rogue Signal P2P (UDP)" -Direction Inbound -Protocol UDP -LocalPort 38888 -Action Allow
```

#### 2. 注册开机自启计划任务（PowerShell）
```powershell
$Action = New-ScheduledTaskAction `
  -Execute "C:\rogue-signal\core-rogue.exe" `
  -Argument "--rogue --datadir `"$env:LOCALAPPDATA\rogue-signal\chaindata`" --port 38888 --syncmode full --cache 256 --http --http.addr 127.0.0.1 --http.port 38845 --http.api eth,net,web3,randomx"

$Trigger = New-ScheduledTaskTrigger -AtStartup
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName "RogueSignalNode" -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest
Start-ScheduledTask -TaskName "RogueSignalNode"
```

查看或停止任务：
```powershell
Get-ScheduledTask -TaskName "RogueSignalNode"
Stop-ScheduledTask -TaskName "RogueSignalNode"
```

---

## 🌐 防火墙与端口汇总

| 端口 | 协议 | 默认绑定地址 | 用途 | 是否建议公开暴露？ |
| :--- | :--- | :--- | :--- | :--- |
| **`38888`** | TCP & UDP | `0.0.0.0` | P2P 区块广播与节点发现 | **是**（可提升节点连接数） |
| **`38845`** | TCP | `127.0.0.1` | HTTP JSON-RPC 2.0 API | **否**（保持本地访问或置于带认证的 TLS 反向代理之后） |
| **`38846`** | TCP | `127.0.0.1` | WebSocket JSON-RPC API（启用 `--ws` 时） | **否** |
| **`8551`** | TCP | `127.0.0.1` | 内部 Engine / AuthRPC 端口 | **否** |

---

## 🔗 下一步

* 更喜欢图形化钱包与一键挖矿？请继续阅读 [使用桌面客户端](./desktop-client.md)。
* 希望针对挖矿优化 CPU 性能？请阅读 [RandomX CPU 挖矿指南](./mining-guide.md) 和 [Huge Pages 与 CPU 调优](./hugepages-tuning.md)。
* 需要从源码编译或运行本地测试网？请查看 [开发者指南](../developers/compiling-from-source.md)。

