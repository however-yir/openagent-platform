# ForgePilot Shell 工具产品化流程

## 目标

将常用 shell 脚本包装为可审计工具，确保执行有权限边界、有审计记录、可复盘。

## 设计要点

1. 工具声明

- 使用 `ShellToolSpec` 定义 `tool_id`、命令、参数模板、超时和执行目录。
- 为工具在 `ToolRegistry` 中注册明确的 `permission`（建议 `execute` 或 `confirm`）。

2. 运行时约束

- `execute_shell_tool` 在执行前检查工具是否启用。
- 非 `execute/confirm` 权限的工具会被运行时拒绝。
- `confirm` 权限工具必须显式确认后才能执行。

3. 审计记录

- 每次调用都会写入 `ToolCallRecord`，包含参数摘要、输出摘要、错误和 `trace_id`。
- 拒绝执行（权限不足/未确认/工具禁用）也会记录审计事件。

## 示例

```python
from openhands.forgepilot.tool_registry import (
    ShellToolSpec,
    ToolPermission,
    ToolRegistryEntry,
    execute_shell_tool,
)

registry.register(
    ToolRegistryEntry(
        tool_id='shell.repo_status',
        display_name='Repository Status',
        provider='shell',
        permission=ToolPermission.CONFIRM,
    )
)

spec = ShellToolSpec(
    tool_id='shell.repo_status',
    display_name='Repository Status',
    command='sh',
    args=['-lc', 'git status --short'],
)

result, record = execute_shell_tool(
    registry,
    spec,
    confirmed=True,
    trace_id='trace-123',
)
```

## 验证

1. 单测：`tests/unit/forgepilot/test_shell_tools.py`
2. 运行检查：`python -m pytest tests/unit/forgepilot/test_shell_tools.py`
