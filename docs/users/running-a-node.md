---
sidebar_position: 1
title: Running a Node (Linux, macOS & Windows)
description: Multiple approaches to installing, initializing, and running a Rogue Signal (core-rogue) full node across Linux, macOS, and Windows.
---

# Running a Node Across Operating Systems

The **`core-rogue`** daemon (`rogue-core-chain`) is the official full-node client for the **Rogue Signal** network. It validates Proof-of-Work headers using **RandomX (`rx/0`)**, executes EVM transactions, maintains the global state trie, and exposes a local JSON-RPC 2.0 interface.

Depending on your workflow—whether you want a zero-CLI graphical experience, a quick terminal session, or an unattended 24/7 background daemon—you can run `core-rogue` using any of the approaches below.

---

## 💻 Hardware & OS Requirements

| Resource | Minimum | Recommended (Active Node / Miner) |
| :--- | :--- | :--- |
| **CPU** | 64-bit x86_64 or ARM64 | Modern multi-core CPU with AVX2 & AES-NI (Intel 10th+ Gen, AMD Ryzen 3000+, or Apple Silicon) |
| **RAM** | 4 GB | 8 GB (16 GB+ if mining in RandomX Fast Mode, which allocates a ~2.08 GB dataset) |
| **Storage** | 100 GB SSD | 200 GB+ NVMe SSD |
| **Network** | 10 Mbps broadband | Stable broadband with TCP/UDP port `38888` reachable for inbound peers |
| **Operating System** | Linux, macOS 12+, Windows 10/11 (64-bit) | Ubuntu 22.04+ / Debian 12+, macOS 13+, Windows 11 |

---

## 🧭 Choosing Your Approach

1. **Approach 1 — Zero-CLI Desktop Client (Recommended for Most Users):** Install **Rogue Desktop Client**, which bundles `core-rogue` as an integrated sidecar, initializes genesis automatically, and manages the node lifecycle from a graphical interface. See [Using the Desktop Client](./desktop-client.md).
2. **Approach 2 — Prebuilt Standalone Binary (CLI):** Download the official release archive for your OS, initialize the genesis state, and run `core-rogue` directly in a terminal. Ideal for quick checks, custom flags, or portable setups.
3. **Approach 3 — Persistent Background Service (`systemd`, `launchd`, Windows Task/Service):** Run `core-rogue` unattended in the background with automatic restart on failure and startup at boot. Ideal for dedicated nodes, validators, and 24/7 solo miners.

*(If you prefer to compile `core-rogue` from source code, see the Developer Guide: [Compiling from Source](../developers/compiling-from-source.md).)*

---

## 📦 Approach 2: Running Prebuilt Release Binaries

Official precompiled archives are published on the [Rogue Signal Core Chain Releases](https://github.com/roguesignalchain/rogue-core-chain/releases) page alongside a `SHA256SUMS` file.

### Step 1: Download & Verify Checksums

Always verify the cryptographic integrity of your downloaded archive before running it.

#### Linux (`.tar.gz`)
```bash
# Download the archive and SHA256SUMS, then verify
sha256sum -c SHA256SUMS --ignore-missing

# Extract the binary
tar -xzf core-rogue-linux-amd64.tar.gz
chmod +x core-rogue
```

#### macOS (`.tar.gz`)
```bash
# Verify checksum
shasum -a 256 -c SHA256SUMS

# Extract and remove macOS Gatekeeper quarantine attribute if needed
tar -xzf core-rogue-darwin-arm64.tar.gz
chmod +x core-rogue
xattr -d com.apple.quarantine ./core-rogue 2>/dev/null || true
```

#### Windows (`.zip` via PowerShell)
```powershell
# Verify SHA256 hash against the published value in SHA256SUMS
Get-FileHash .\core-rogue-windows-amd64.zip -Algorithm SHA256

# Extract archive
Expand-Archive -Path .\core-rogue-windows-amd64.zip -DestinationPath C:\rogue-signal
cd C:\rogue-signal
```

---

### Step 2: Initialize the Embedded Genesis Block

Rogue Signal embeds its **Chain ID `800055`** genesis state directly inside `core-rogue` via the `--rogue` flag. You do **not** need an external `genesis.json` file. Run `init` once per data directory:

#### Linux & macOS
```bash
./core-rogue --rogue --datadir ~/.local/share/rogue-signal/chaindata init
```

#### Windows (PowerShell)
```powershell
.\core-rogue.exe --rogue --datadir "$env:LOCALAPPDATA\rogue-signal\chaindata" init
```

You should see confirmation that the genesis state (`0xde4c5e747fbb072d39db2ece5a245e46b6164045e166301dfdba78f86cfbe4dd`) was successfully written.

---

### Step 3: Launch the Node in the Foreground

Start the node with standard Rogue Signal ports (`38888` P2P, `38845` HTTP JSON-RPC):

#### Linux & macOS
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

:::info Why `--syncmode full`?
Rogue Signal enforces full block-by-block validation (`--syncmode full`) to guarantee complete RandomX PoW verification and prevent snap-sync state inconsistencies on PoW chains.
:::

---

### Step 4: Verify Synchronization & Peers

Open a second terminal and query the local HTTP-RPC endpoint:

```bash
# Check sync progress (returns false when fully synced)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
  http://127.0.0.1:38845

# Check connected P2P peer count (hexadecimal)
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  http://127.0.0.1:38845
```

On Windows PowerShell, you can use `Invoke-RestMethod`:
```powershell
Invoke-RestMethod -Uri http://127.0.0.1:38845 -Method Post -ContentType "application/json" `
  -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🔄 Approach 3: Running as a Persistent Background Service

For 24/7 operation, running `core-rogue` as an OS-managed service ensures automatic crash recovery, clean `SIGTERM` shutdown (preventing LevelDB corruption), and boot persistence.

### Linux (`systemd` Automated Installer & Manual Setup)

The `rogue-core-chain` repository includes an unattended service installer (`scripts/install-service.sh`) that supports both **user-level** (rootless) and **system-wide** (`sudo`) deployments.

#### Option A: Automated `install-service.sh` (Recommended)
```bash
# 1. Install as a rootless user service (no sudo required)
./scripts/install-service.sh --user

# OR: Install as a system-wide service under a dedicated 'rogue' user
sudo ./scripts/install-service.sh --system

# Optional: Enable CPU mining directly in the service unit
./scripts/install-service.sh --user --mine --threads 4 --coinbase 0xYourRogueAddress
```

Useful management commands:
```bash
# For --user mode:
systemctl --user status rogue-node.service
journalctl --user -u rogue-node.service -f

# For --system mode:
sudo systemctl status rogue-node.service
sudo journalctl -u rogue-node.service -f
```

#### Option B: Manual `systemd` Unit
If you installed `core-rogue` to `/usr/local/bin/core-rogue`, create `/etc/systemd/system/rogue-node.service`:

```ini
[Unit]
Description=Rogue Signal Headless Node (core-rogue)
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=rogue
Environment="ROGUE_DATADIR=/var/lib/rogue-signal/chaindata"
# Optional: inject dynamic bootnodes
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

Enable and start it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rogue-node.service
```

---

### macOS (`launchd` Background Agent)

On macOS, `launchd` manages persistent user agents cleanly without third-party process managers.

1. Place the `core-rogue` binary in `/usr/local/bin/core-rogue` (or `/opt/homebrew/bin/core-rogue`).
2. Initialize the data directory once:
   ```bash
   mkdir -p ~/Library/Application\ Support/rogue-signal/chaindata
   mkdir -p ~/Library/Logs/rogue-signal
   /usr/local/bin/core-rogue --rogue --datadir ~/Library/Application\ Support/rogue-signal/chaindata init
   ```
3. Create `~/Library/LaunchAgents/org.roguesignal.node.plist` (replace `YOUR_USERNAME` with your macOS username):

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

4. Load and inspect the agent:
   ```bash
   launchctl load -w ~/Library/LaunchAgents/org.roguesignal.node.plist
   tail -f ~/Library/Logs/rogue-signal/node.err.log
   ```
   To stop and unload later:
   ```bash
   launchctl unload ~/Library/LaunchAgents/org.roguesignal.node.plist
   ```

---

### Windows (Scheduled Task & Firewall Configuration)

On Windows, you can run `core-rogue.exe` persistently at system boot using **Task Scheduler** (built into Windows) or a service wrapper like **NSSM**.

#### 1. Allow P2P Traffic in Windows Defender Firewall
Open an **Administrator PowerShell** and allow port `38888` for peer discovery:
```powershell
New-NetFirewallRule -DisplayName "Rogue Signal P2P (TCP)" -Direction Inbound -Protocol TCP -LocalPort 38888 -Action Allow
New-NetFirewallRule -DisplayName "Rogue Signal P2P (UDP)" -Direction Inbound -Protocol UDP -LocalPort 38888 -Action Allow
```

#### 2. Register a Persistent Startup Task (PowerShell)
```powershell
$Action = New-ScheduledTaskAction `
  -Execute "C:\rogue-signal\core-rogue.exe" `
  -Argument "--rogue --datadir `"$env:LOCALAPPDATA\rogue-signal\chaindata`" --port 38888 --syncmode full --cache 256 --http --http.addr 127.0.0.1 --http.port 38845 --http.api eth,net,web3,randomx"

$Trigger = New-ScheduledTaskTrigger -AtStartup
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask -TaskName "RogueSignalNode" -Action $Action -Trigger $Trigger -Settings $Settings -RunLevel Highest
Start-ScheduledTask -TaskName "RogueSignalNode"
```

To check or stop the task:
```powershell
Get-ScheduledTask -TaskName "RogueSignalNode"
Stop-ScheduledTask -TaskName "RogueSignalNode"
```

---

## 🌐 Firewall & Port Summary

| Port | Protocol | Default Binding | Purpose | Should Expose Publicly? |
| :--- | :--- | :--- | :--- | :--- |
| **`38888`** | TCP & UDP | `0.0.0.0` | P2P block gossip & peer discovery | **Yes** (improves peer connectivity) |
| **`38845`** | TCP | `127.0.0.1` | HTTP JSON-RPC 2.0 API | **No** (keep local or behind authenticated TLS reverse proxy) |
| **`38846`** | TCP | `127.0.0.1` | WebSocket JSON-RPC API (when `--ws` is enabled) | **No** |
| **`8551`** | TCP | `127.0.0.1` | Engine / AuthRPC internal port | **No** |

---

## 🔗 Next Steps

* Prefer a graphical wallet and one-click miner? Continue to [Using the Desktop Client](./desktop-client.md).
* Want to optimize your CPU for mining? Read the [RandomX CPU Mining Guide](./mining-guide.md) and [Huge Pages & CPU Tuning](./hugepages-tuning.md).
* Building from source or running local testnets? Check the [Developer Guides](../developers/compiling-from-source.md).

