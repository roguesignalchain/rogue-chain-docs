---
id: ui-components
title: UI 组件与 HUD 战术规范
sidebar_label: UI 组件
sidebar_position: 4
---

# UI 组件与 HUD 战术规范

Rogue Signal 界面美学哲学采用野兽派战术组件，旨在表达坚如磐石的稳固感、极高的交互响应速度以及零多余的装饰浮夸。

---

## 🔘 按钮与动作触发器

### 主按钮（纯白反转高亮）
高对比度纯白实体元素，聚焦用户视觉核心。

```html
<button class="bg-white text-black font-semibold px-6 py-2.5 rounded-[2px] hover:bg-zinc-200 transition-colors duration-150 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
  START MINING [RX-0]
</button>
```

### 次级按钮（战术发丝线）
发丝线轮廓按钮，用于辅助操作与界面导航。

```html
<button class="bg-transparent text-white border border-white/20 font-medium px-6 py-2.5 rounded-[2px] hover:border-white hover:bg-white/5 transition-all duration-150">
  VIEW BLOCK EXPLORER
</button>
```

### 幽灵超链接（战术方括号超链）
终端风格的方括号文本超链接。

```html
<a href="/docs/intro" class="text-zinc-400 hover:text-white font-mono text-sm tracking-wider transition-colors">
  [ READ SPECIFICATIONS → ]
</a>
```

---

## 🗃️ 卡片与容器面板

* **表面：** `#0A0A0C` 底色。
* **边框：** `1px solid rgba(255, 255, 255, 0.08)`。
* **圆角：** `2px`（严格杜绝大圆角或胶囊圆角）。
* **悬停交互：** 鼠标悬停时边框高亮至 `rgba(255, 255, 255, 0.30)`。

```html
<div class="bg-[#0A0A0C] border border-white/10 rounded-[2px] p-6 hover:border-white/30 transition-all">
  <div class="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">[NODE STATUS]</div>
  <h3 class="text-xl font-bold text-white mb-2">Block Synchronizer</h3>
  <p class="text-zinc-400 text-sm">Processing RandomX cryptographic blocks via local P2P daemon.</p>
</div>
```

---

## 💡 状态指示器（单色遥测徽章）

系统健康状况通过亮度与呼吸动画来传达，而非饱和色彩：

| 状态 | 圆点呈现方式 | 徽章标记格式 | 含义 |
| :--- | :--- | :--- | :--- |
| **活跃中 / 挖矿中** | 白色呼吸脉冲点 (`animate-pulse`) | `[MINING]` 白字 / `border-white/30` | 系统全负荷正常运作中 |
| **空闲中 / 待机中** | 固定弱化 zinc-600 点 | `[STANDBY]` zinc-400 字 / `border-white/10` | 守护进程处于待机监听状态 |
| **同步中** | 快速脉冲 zinc-300 点 | `[SYNCING 99%]` zinc-200 字 | 正在高速追赶最新链上状态 |

---

## 📈 算力与性能数据图表

* **网格参考线：** `1px` 虚线 `rgba(255, 255, 255, 0.06)`。
* **数据走势折线：** `1.5px` 纯白实线 `#FFFFFF`。
* **填充渐变区域：** 垂直线性渐变，从顶部的 `rgba(255, 255, 255, 0.12)` 渐隐至底部的 `transparent`。
* **数据浮窗提示（Tooltip）：** 反色框体（`bg-white text-black font-mono font-bold text-xs px-2 py-1`）。

