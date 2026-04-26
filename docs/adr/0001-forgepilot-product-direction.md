# ADR 0001：ForgePilot Studio 产品方向

## 状态

Accepted

## 背景

项目需要从通用代码 Agent 仓库演进为独立的工程执行工作台。仅做 Logo 和 README 替换不足以形成差异化，需要在信息架构、工作流、审计、工具生态和部署治理上形成自己的产品心智。

## 决策

ForgePilot Studio 的主体验围绕以下对象组织：

- 任务台：默认首页，展示任务状态和验证闭环。
- 任务编排：承载 Plan -> Execute -> Verify -> Report 协议。
- 运行时：管理 local、Docker、Kubernetes 沙箱。
- 工具中心：管理 MCP、脚本工具和内部连接器。
- 审计回放：串联模型响应、命令、文件修改和工具调用。
- 成本预算：展示模型、工具、CI 和运行时成本。

## 影响

- 前端默认入口从聊天导向改为任务台导向。
- 品牌文案从“AI software engineer”改为“可审计的工程执行工作台”。
- 后续后端重构应围绕 control plane、runtime providers、llm gateway 和 audit schema 拆分。
