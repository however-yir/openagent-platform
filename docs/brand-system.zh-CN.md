# ForgePilot Studio 品牌系统

## 品牌定位

`ForgePilot Studio` 是面向研发团队的可审计工程执行工作台。它的语气应该像一位可靠的工程协作者：清晰、克制、可追溯，不使用夸张营销语。

中文固定名称：`ForgePilot 工程执行工作台`

英文固定名称：`ForgePilot Studio`

一句话描述：可审计的工程执行工作台，面向 Agent 任务编排、验证和交付。

## Logo

主 Logo：`docs/assets/forgepilot-logo.svg`

社交预览图：`docs/assets/forgepilot-social-preview.png`

前端图标：`frontend/src/assets/branding/forgepilot-logo.svg`

Logo 使用规则：

1. README 和文档首页优先使用横版 Logo。
2. App 导航和 favicon 使用紧凑六边形标识。
3. Logo 四周至少保留图标宽度 `1/4` 的留白。
4. 不要拉伸、旋转或改变标识比例。
5. 不要把 Logo 放在低对比度背景上。

## 色彩

| Token | Hex | 用途 |
| --- | --- | --- |
| `forge-bg` | `#101417` | 主背景 |
| `forge-panel` | `#151b1f` | 控制台面板 |
| `forge-mint` | `#2dd4bf` | 主品牌强调 |
| `forge-gold` | `#f59e0b` | 执行中、提醒、预算 |
| `forge-red` | `#ef4444` | 阻断、高风险 |
| `forge-text` | `#f8fafc` | 主文字 |
| `forge-muted` | `#aebbc0` | 次级文字 |

状态色：

| 状态 | Hex | 说明 |
| --- | --- | --- |
| `planned` | `#38bdf8` | 已计划 |
| `running` | `#fbbf24` | 执行中 |
| `blocked` | `#f87171` | 被阻断 |
| `verified` | `#34d399` | 已验证 |
| `shipped` | `#5eead4` | 已交付 |

风险色：

| 风险 | Hex | 说明 |
| --- | --- | --- |
| `safe` | `#34d399` | 可自动执行 |
| `review` | `#fbbf24` | 需要人工确认 |
| `danger` | `#fb923c` | 高风险 |
| `blocked` | `#ef4444` | 默认阻断 |

## 字体

产品界面优先使用系统字体，确保后台工具稳定和可读：

- UI：`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Noto Sans SC`, `sans-serif`
- Code：`IBM Plex Mono`, `SFMono-Regular`, `Menlo`, `Consolas`, `monospace`

## 文案语气

推荐：

- “任务已进入验证阶段”
- “该命令需要人工确认”
- “已生成交付报告草稿”
- “预算接近阈值”

避免：

- “让 AI 改变一切”
- “一键替代工程师”
- “极速黑科技”
- “无需审查即可自动上线”

## 截图规范

1. 截图优先展示任务台、执行轨迹、工具调用、审计回放。
2. 避免空状态截图。
3. 隐藏真实密钥、邮箱、组织名和私有仓库路径。
4. GitHub social preview 使用 `1280x640`。
5. 文档截图应保留浏览器宽度，不裁掉主导航。
