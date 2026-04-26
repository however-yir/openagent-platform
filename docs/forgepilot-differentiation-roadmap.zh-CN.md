# ForgePilot Studio 差异化改造建议（70 条）

> 目标：把当前项目从“通用代码 Agent Fork”改造成一个有独立产品心智、独立视觉识别、独立工程治理能力的智能研发执行工作台。
> 说明：本清单不放进 README，作为后续迭代 backlog 使用。

## A. 品牌与命名（10 条）

1. 将 GitHub 仓库名从 `openagent-platform` 调整为 `forgepilot-studio`。
2. 将产品中文名固定为“ForgePilot 工程执行工作台”，避免继续使用“开放智能体平台”这类泛称。
3. 统一 README、docs、前端界面、CLI banner、Docker 镜像名里的产品名。
4. 将组件库包名统一迁移为 `@forgepilot/ui`。
5. 将 Python 包发布名统一迁移为 `forgepilot-studio`，内部包名后续分阶段处理。
6. 新增 `docs/brand-system.zh-CN.md`，定义 Logo、色彩、字体、语气和截图规范。
7. 生成 GitHub social preview 图，避免仓库卡片仍像上游项目。
8. 将默认 bot 用户名改为 `forgepilot-bot`，默认邮箱改为 `dev@forgepilot.local`。
9. 替换 favicon、safari pinned tab、manifest 图标和登录页图标。
10. 将产品文案从“AI software engineer”改成“可审计的工程执行工作台”。

## B. 产品定位与信息架构（10 条）

11. 首页默认进入任务台，而不是通用聊天页。
12. 新增“任务编排”一级导航，承载计划、执行、验证、回放四段流程。
13. 新增“运行时”一级导航，集中管理本地、Docker、Kubernetes 沙箱。
14. 新增“工具中心”一级导航，展示 MCP、脚本工具、内部 API 连接器。
15. 新增“审计回放”视图，把每次命令、文件修改、模型响应串成时间线。
16. 新增“成本与预算”视图，展示模型调用量、token、耗时和任务成本。
17. 新增“团队空间”模型，区分个人任务、团队任务和共享模板。
18. 新增“任务模板库”，沉淀 bugfix、代码审查、文档生成、测试补全等模板。
19. 新增“执行策略”配置页，管理确认模式、危险命令、网络访问和文件范围。
20. 新增“成果交付”页面，一键产出 PR 描述、变更摘要、测试报告和回放链接。

## C. UI 与交互体验（10 条）

21. 把主界面改成工程控制台布局：左侧项目树，中间任务流，右侧上下文面板。
22. 用 ForgePilot UI Kit 统一按钮、输入框、状态标签、工具调用卡片。
23. 为任务状态建立专用视觉系统：planned、running、blocked、verified、shipped。
24. 将聊天气泡弱化，突出任务步骤、文件 diff、命令输出和验证结果。
25. 增加命令风险分级颜色：safe、review、danger、blocked。
26. 为 MCP 工具调用设计独立卡片，显示参数、耗时、返回摘要和错误原因。
27. 为长任务增加“阶段折叠”和“只看失败步骤”过滤器。
28. 加入项目级仪表盘，展示最近任务、失败率、平均耗时和成本趋势。
29. 将设置页拆成模型、运行时、安全、团队、集成五个明确分组。
30. 为首次启动新增私有化部署向导，引导配置模型、数据库、沙箱和工作区。

## D. Agent 工作流与能力（10 条）

31. 引入 Plan -> Execute -> Verify -> Report 的固定任务协议。
32. 新增任务验收标准字段，让 Agent 在执行前明确完成条件。
33. 新增“变更边界”输入，限制 Agent 只能修改指定目录或文件类型。
34. 新增“自动验证策略”，按语言自动选择 pytest、npm test、mvn test、cargo test 等命令。
35. 新增“失败自愈回合数”配置，控制测试失败后最多重试几轮。
36. 新增“只读研究模式”，允许 Agent 分析代码但不能改文件。
37. 新增“审查模式”，让 Agent 输出 review findings 而不是直接修复。
38. 新增“交接模式”，自动生成给人类工程师继续处理的 handoff 文档。
39. 新增“多 Agent 分工模板”，覆盖探索、实现、验证、文档四类角色。
40. 新增“知识记忆注入”，把团队规范、项目约束和常见坑自动加入上下文。

## E. 工具生态与 MCP（10 条）

41. 建立 MCP Registry 页面，支持启用、禁用、测试连接和查看 schema。
42. 内置 GitHub、GitLab、Jira、Linear、Notion、Sentry、Slack 等连接器模板。
43. 为每个工具增加权限边界：只读、可写、可执行、需要确认。
44. 增加工具调用录制功能，方便复盘 Agent 是否误用工具。
45. 增加工具 mock 机制，让测试环境不访问真实三方系统。
46. 增加工具健康检查，启动时检查 token、网络和版本兼容。
47. 为内部 HTTP API 提供低代码连接器配置。
48. 支持把常用 shell 脚本包装成可审计工具。
49. 为工具返回结果增加摘要器，避免大输出污染上下文。
50. 增加工具级成本统计，区分模型成本、CI 成本和外部 API 成本。

## F. 架构与代码命名空间（10 条）

51. 制定 `openhands` 到 `forgepilot` 的命名空间迁移计划，先文档后 API 再包名。
52. 将前端 Logo 组件统一改为 `ForgePilotLogo` 命名。
53. 将 i18n key 从 `BRANDING$OPENHANDS` 迁移为 `BRANDING$FORGEPILOT`，保留兼容别名一版。
54. 将配置类名、HTTP header、环境变量中的上游品牌词列入 rename 白名单。
55. 新增自动化 rename 脚本，按白名单改名并生成回滚补丁。
56. 把核心控制平面抽象为 `control_plane` 模块，弱化历史包结构。
57. 将运行时适配层抽象为 `runtime_providers`，便于替换 Docker/K8s/远程沙箱。
58. 将模型适配层抽象为 `llm_gateway`，统一 OpenAI、Ollama、LiteLLM 和私有网关。
59. 将审计事件抽象为独立 schema，避免散落在 UI 和后端业务代码中。
60. 增加架构 ADR 目录，记录每次从上游分化的关键决策。

## G. 工程质量、部署与商业化准备（10 条）

61. 新增 ForgePilot 专属 CI：lint、typecheck、unit、frontend build、secret scan。
62. 新增最小 E2E：创建任务、执行命令、修改文件、运行验证、生成报告。
63. 新增 Docker 镜像发布流程，默认推送到 GHCR 或私有 registry。
64. 新增 Helm Chart，覆盖 ingress、secret、postgres、redis、runtime 配额。
65. 新增 `dev/staging/prod` 三套配置模板。
66. 增加日志结构化输出和 trace_id，从前端任务贯通到后端执行器。
67. 增加审计日志导出，支持 JSONL、CSV 和对象存储归档。
68. 增加租户与角色模型，为团队空间、权限和计费打基础。
69. 增加版本发布规范：CHANGELOG、迁移说明、兼容矩阵、回滚步骤。
70. 增加演示数据和演示项目，让仓库打开后能快速展示完整闭环。
