---
id: typography-colors
title: 字体排印与色彩架构
sidebar_label: 字体与色彩
sidebar_position: 3
---

# 字体排印与色彩架构

Rogue Signal 设计系统运用高对比度的单色设计令牌，以确保极致的阅读可读性与战术美学的一致性。

---

## 🎨 色彩光谱

### 画布与表面令牌（Canvas & Surface Tokens）
* **虚空 (`#000000`)：** 所有全屏视口的底层画布基础。
* **黑曜石 (`#050505`)：** 次级应用程序主体与布局容器背景。
* **表面卡片 (`#0A0A0C`)：** 组件容器、信息卡片、数据表格与侧边栏。
* **高位表面 (`#121217`)：** 模态弹窗、下拉菜单与浮动气泡（Popover）。

### 文本令牌（Text Tokens）
* **主文本 (`#FFFFFF`)：** 100% 纯白，用于主标题、关键数字与高优先级指标。
* **次级文本 (`#D4D4D8` / `zinc-300`)：** 正文段落、功能描述与激活态面包屑导航。
* **弱化文本 (`#A1A1AA` / `zinc-400`)：** 表单标签、表格表头与辅助遥测信息。
* **微光文本 (`#71717A` / `zinc-500`)：** 禁用状态、括号分隔符与时间戳页脚。

### 边框与分割线（Borders & Dividing Lines）
* **发丝线 (`rgba(255, 255, 255, 0.08)`)：** 微妙的卡片内部边线与网格网状线。
* **精细线 (`rgba(255, 255, 255, 0.15)`)：** 默认卡片外框与输入框线。
* **中度线 (`rgba(255, 255, 255, 0.30)`)：** 鼠标悬停边框与激活态输入框聚焦光环。
* **实心纯白 (`#FFFFFF`)：** 高优先级焦点与战术准星交叉线。

---

## 🔤 字体排印

### 主标题字体：Space Grotesk
用于所有展示性文字、标题栏、分节标题与品牌宣示。

```css
font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

* **字重（Weights）：** `700` (Bold), `600` (SemiBold), `500` (Medium)。
* **字距（Tracking）：** 大号主标题采用紧凑字距（`tracking-tight` 或 `-0.03em`）。

### 等宽字体：JetBrains Mono
用于所有区块链底层指标、密码学哈希、CLI 命令、智能合约代码与状态徽章。

```css
font-family: 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

* **字重（Weights）：** `400` (Regular), `500` (Medium), `700` (Bold)。
* **对齐方式：** 默认启用等宽表格数字特性（Tabular figures），确保在数据表与财务账本中纵向对齐。

---

## 字体阶梯层级矩阵

| 令牌名称 | 字号 | 行高 | 适用场景 |
| :--- | :--- | :--- | :--- |
| `text-display` | `4.5rem` / `72px` | `1.05` | 官网首屏主标题（Hero Headline） |
| `text-h1` | `2.25rem` / `36px` | `1.15` | 页面与技术文档主标题 H1 |
| `text-h2` | `1.75rem` / `28px` | `1.20` | 分区标题与模态弹窗标题 |
| `text-h3` | `1.25rem` / `20px` | `1.30` | 卡片头部与功能特性标题 |
| `text-body` | `1.00rem` / `16px` | `1.50` | 技术文档正文主体 |
| `text-mono` | `0.875rem` / `14px`| `1.45` | 哈希值与命令行 CLI 参数 |
| `text-hud` | `0.750rem` / `12px`| `1.40` | 大写方括号状态徽章 `[SYNCED]` |

