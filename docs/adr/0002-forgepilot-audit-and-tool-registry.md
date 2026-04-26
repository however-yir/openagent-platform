# ADR 0002：ForgePilot 审计事件与工具注册表

## 状态

Accepted

## 背景

随着任务台和工具中心能力扩展，审计事件与工具元数据分散在页面文案和运行日志里，缺少统一 schema，不利于导出、复盘、成本分析和权限治理。

## 决策

1. 新增 `openhands.forgepilot.audit`：
   - 定义 `AuditEvent` 和 `AuditEventType`。
   - 提供按时间线排序能力。
   - 提供 JSONL / CSV 导出函数。
2. 新增 `openhands.forgepilot.tool_registry`：
   - 定义工具权限级别（read/write/execute/confirm）。
   - 定义工具执行模式（live/mock）与健康状态。
   - 定义工具 schema 引用和成本分解模型。
   - 提供大输出摘要函数，避免工具返回污染上下文。

## 影响

- 审计回放和交付报告可复用统一事件结构。
- 工具中心可逐步从“连接配置页”进化为“可治理注册表”。
- 后续接入真实健康检查、权限策略和成本统计时，不需要再重构基础数据模型。
