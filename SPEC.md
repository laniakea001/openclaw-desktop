# OpenClaw Desktop - 技术方案

## 产品定位

Windows 桌面端一键安装包，让用户无需命令行即可使用 OpenClaw。

## 技术栈

| 组件 | 技术选型 | 理由 |
|------|----------|------|
| 框架 | Tauri 2.x | 体积小(10MB)、性能高、Rust 后端 |
| 前端 | React + TypeScript | 生态丰富 |
| 状态管理 | Zustand | 轻量 |
| 样式 | Tailwind CSS | 快速开发 |
| 打包 | tauri-builder | 一键生成 .exe |

## 功能规划

### MVP (V0.1) ✅ 已完成
- [x] 一键安装 OpenClaw 运行时
- [x] 配置模型 API Key
- [x] 启动/停止 Gateway
- [x] 实时日志查看

### V1.0 ✅ 已完成
- [x] 模型选择 (MiniMax/DeepSeek/Claude)
- [x] 渠道选择 (飞书/Telegram/Discord/Slack)
- [x] 高级设置 (开机启动/托盘/自动运行)
- [x] Skills 市场入口
- [x] 配置持久化

### V1.1 ✅ 已完成
- [x] 系统托盘
- [x] 托盘菜单 (显示/隐藏/退出)
- [x] 应用图标

### V2.0 (规划中)
- [ ] Skills 市场集成
- [ ] 插件管理
- [ ] 多账户支持

## 架构

```
┌─────────────────────────────────────┐
│           React UI                  │
│  (配置面板、日志、状态显示)          │
├─────────────────────────────────────┤
│          Tauri Commands             │
│  (Rust 后端 IPC)                    │
├─────────────────────────────────────┤
│       OpenClaw Gateway              │
│  (Node.js 运行时)                   │
├─────────────────────────────────────┤
│         Windows API                 │
│  (托盘、通知、开机启动)             │
└─────────────────────────────────────┘
```

## 项目结构

```
openclaw-desktop/
├── src/                 # React 前端
│   ├── App.tsx         # 主界面
│   └── index.css        # 样式
├── src-tauri/           # Rust 后端
│   ├── src/main.rs     # 核心逻辑
│   └── tauri.conf.json # 配置
├── SPEC.md             # 技术方案
└── README.md           # 说明文档
```

---

*2026-03-09*
