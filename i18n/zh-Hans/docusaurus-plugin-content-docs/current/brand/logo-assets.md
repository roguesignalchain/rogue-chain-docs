---
id: logo-assets
title: 官方徽标与图形架构规范
sidebar_label: 徽标与视觉资产
sidebar_position: 2
---

# 官方徽标与图形架构规范

Rogue Signal 协议的视觉标识采用双层架构体系：
1. **市场与社区徽记（Marketing Insignia）：** 冲击力极强的战术纹章，专用于公众品牌形象、社交媒体、版本发布与宣发推广。
2. **技术开发图形标志（Technical Isotypes）：** 透明且高精度的矢量级字形符号，专用于桌面应用程序、深浅色 UI 导航栏、CLI 工具以及浏览器 Favicon。

---

## 1. 市场与社区徽记

* **权威文件：** `/recursos/imagenes/rogue-signal.logo-rrss.png` (900×900px, RGB)
* **适用场景：** 社交平台头像（X/Twitter、Telegram、Discord）、媒体资料包、GitHub 组织头像以及社区版本发布公告。

![Rogue Signal 市场徽记](/img/logo.png)

---

## 2. 技术开发图形标志系统

对于软件界面、导航标题栏、桌面应用窗体边框以及快捷方式，请使用透明的高精度技术图标：

### 白色技术图标（深色界面与 UI）
* **文件路径：** `/recursos/imagenes/roguechain-icon.png` (1254×1254px, RGBA 透明)
* **优化尺寸包：** `/recursos/iconos/roguechain-icon-white-[16|22|32|64|128|256|512].png`
* **适用场景：**
  * 深色模式顶栏与导航栏（`#000000` / `#050505`）。
  * 桌面客户端 UI 顶栏（`rogue-desktop-client`）。
  * 官方浏览器 Favicon。
  * 系统托盘 / 状态栏常驻图标（22×22px）。

![Rogue Signal 白色技术图标](/img/icon.png)

---

## 黑色技术图标（浅色表面与打印）
* **文件路径：** `/recursos/imagenes/roguechain-icon-black.png` (1254×1254px, RGBA 透明)
* **优化尺寸包：** `/recursos/iconos/roguechain-icon-black-[size].png`
* **适用场景：**
  * 打印输出的白色纸质技术文档及纸钱包。
  * 反色白色按钮与纯白 UI 强调卡片（`bg-white text-black`）。
  * 浅色桌面操作系统环境或浅色系统任务栏。

---

## 3. 实现标准与尺寸规范矩阵

| 资产 | 文件名 | 目标用途 | 推荐尺寸 |
| :--- | :--- | :--- | :--- |
| **浏览器 Favicon** | `roguechain-icon.png` | 官方网站与文档中心标签页 | `32×32px` / `16×16px` |
| **导航栏 Header** | `roguechain-icon.png` | 应用与网页顶栏（搭配 Space Grotesk 字体） | 高度 `32px` |
| **桌面客户端窗体** | `roguechain-icon.png` | Tauri 客户端主窗口标题栏 | `28px – 32px` |
| **Tauri 应用图标包** | `src-tauri/icons/` | 操作系统执行程序与任务栏快捷方式 | 多尺寸格式（`.ico`, `.png`） |
| **系统托盘图标** | `roguechain-icon-white-22x22.png` | 后台常驻节点守护进程（System Tray） | `22×22px` |
| **社区宣发资产** | `rogue-signal.logo-rrss.png` | Twitter、Discord、版本发布海报 | `900×900px` |

---

## 4. 安全边距与留白规范

在技术图形标志四周必须保留至少等于其自身尺寸一半（$0.5X$）的安全留白空间：

```
       [+]───────────────────────────────────────[+]
       │                 0.5X                     │
       │         ┌───────────────────┐            │
       │         │                   │            │
       │  0.5X   │  TECHNICAL ISOTYPE│    0.5X    │
       │         │                   │            │
       │         └───────────────────┘            │
       │                 0.5X                     │
       [+]───────────────────────────────────────[+]
```

---

## 5. 违规使用限制

* ❌ **严禁添加彩色或渐变：** 两个技术图标必须严格保持纯白（`#FFFFFF`）或纯黑（`#000000`）。
* ❌ **严禁不当反转底色：** 切勿在浅色背景上放置白色 `roguechain-icon.png`；在浅色背景下必须始终使用 `roguechain-icon-black.png`。
* ❌ **严禁扭曲纵横比：** 必须始终保持 1:1 正方形等比缩放。

