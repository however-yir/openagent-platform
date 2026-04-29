# ForgePilot Studio Preview Release Draft

> 用途：发布 ForgePilot Preview 时的 release note 草稿。真正发布前需要确认 tag、目标仓库、镜像 tag、演示 GIF 和回归结果。

## Release title

ForgePilot Studio Preview: 可审计 AI 工程执行工作台

## Positioning

ForgePilot Studio Preview 是一个基于 OpenHands 深改的 AI 工程执行平台。它继承 OpenHands 的 Agent 与 runtime 基础，并新增面向研发团队的控制平面、任务台、团队权限、审计回放、成本阈值、MCP 工具治理和私有化部署配置。

ForgePilot 的目标不是隐藏上游来源，而是把上游能力工程化、团队化、可审计化，让研发团队可以把 AI Agent 纳入真实交付流程。

## Preview highlights

- Task Console：默认首页展示任务队列、阶段状态、失败过滤、预算和私有化部署向导。
- Control Plane：新增 `Plan -> Execute -> Verify -> Report` 任务协议、验收标准、变更边界和执行策略。
- Audit Replay：将模型响应、命令执行、文件修改、工具调用、验证结果和报告串成可导出时间线。
- Teamspace：新增 owner/admin/member/viewer 权限矩阵，为团队空间、共享模板和审计隔离打基础。
- Tool Registry：将 MCP、HTTP、shell 工具纳入 registry，支持权限、mock、schema、健康状态和调用记录。
- LLM Gateway：统一 OpenAI、Anthropic、Ollama、LiteLLM 和私有 OpenAI-compatible gateway 的配置口径。
- Runtime Provider：抽象 local、Docker、Kubernetes、remote runtime，并标记网络策略与资源配额能力。
- Private Deployment：补充本地模型、Ollama、LiteLLM 和企业模型网关启动指引。

## Demo path

演示 GIF 建议覆盖以下闭环：

1. 任务台创建任务。
2. 填写目标、验收标准和变更边界。
3. 执行安全命令。
4. 展示代码或文档 diff。
5. 运行验证测试。
6. 打开审计回放，查看 model、command、file_change、tool_call、verification、report 时间线。

建议输出：

```text
docs/assets/forgepilot-preview-demo.gif
```

## Based on OpenHands

This preview is deeply customized from OpenHands. ForgePilot keeps the proven Agent/runtime foundation and adds team-oriented governance, auditability, deployment configuration, and product workflows.

Do not describe this preview as a from-scratch Agent runtime.

## Required checks before publishing

```bash
python3 -m pytest tests/unit/forgepilot -q
uv run --no-sync python -m pytest tests/unit/core/config/test_forgepilot_execution_config.py -q
npm --prefix frontend run typecheck
scripts/forgepilot-release-check.sh
```

## Known limitations

- `openhands/` remains the Python package namespace during the compatibility window.
- Some task-console and audit-console metrics are still mock/demo data until backend APIs are fully wired.
- Preview GIF should be recorded from a real task flow before publishing.
- `uv.lock` should be reconciled with the current package name before using `uv --frozen` in CI.

## Links

- Differentiation: `docs/fork-differentiation.md`
- Upstream sync: `docs/upstream-sync.md`
- Module map and tests: `docs/forgepilot-module-map.md`
- Local models and gateways: `docs/local-models-and-gateways.md`
