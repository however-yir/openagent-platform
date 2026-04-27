from __future__ import annotations

from openhands.forgepilot.tool_registry.registry import ToolRegistry
from openhands.forgepilot.tool_registry.schema import (
    ToolExecutionMode,
    ToolPermission,
    ToolRegistryEntry,
)
from openhands.forgepilot.tool_registry.shell_tools import (
    ShellToolSpec,
    execute_shell_tool,
)


def _register_shell_tool(
    registry: ToolRegistry,
    *,
    permission: ToolPermission = ToolPermission.EXECUTE,
    enabled: bool = True,
) -> ShellToolSpec:
    registry.register(
        ToolRegistryEntry(
            tool_id='shell.format',
            display_name='Shell Format',
            provider='shell',
            permission=permission,
            enabled=enabled,
            mode=ToolExecutionMode.LIVE,
        )
    )
    return ShellToolSpec(
        tool_id='shell.format',
        display_name='Shell Format',
        command='sh',
        args=['-lc', 'printf "{{value}}"'],
    )


def test_execute_shell_tool_records_success():
    registry = ToolRegistry.from_builtin_templates()
    spec = _register_shell_tool(registry)
    result, record = execute_shell_tool(
        registry,
        spec,
        parameters={'value': 'forgepilot'},
        trace_id='trace-shell-success',
    )
    assert result.exit_code == 0
    assert result.stdout == 'forgepilot'
    assert record.error is None
    assert record.trace_id == 'trace-shell-success'
    assert 'command: sh -lc' in record.output_summary


def test_execute_shell_tool_requires_confirmation_for_confirm_permission():
    registry = ToolRegistry.from_builtin_templates()
    spec = _register_shell_tool(registry, permission=ToolPermission.CONFIRM)
    result, record = execute_shell_tool(
        registry,
        spec,
        parameters={'value': 'forgepilot'},
        confirmed=False,
    )
    assert result.exit_code == 126
    assert result.stderr == 'confirmation is required for this tool'
    assert record.error == 'confirmation required'


def test_execute_shell_tool_rejects_non_execute_permission():
    registry = ToolRegistry.from_builtin_templates()
    spec = _register_shell_tool(registry, permission=ToolPermission.READ)
    result, record = execute_shell_tool(
        registry,
        spec,
        parameters={'value': 'forgepilot'},
    )
    assert result.exit_code == 126
    assert 'does not allow shell execution' in result.stderr
    assert record.error == 'permission denied'


def test_execute_shell_tool_rejects_disabled_tool():
    registry = ToolRegistry.from_builtin_templates()
    spec = _register_shell_tool(registry, enabled=False)
    result, record = execute_shell_tool(
        registry,
        spec,
        parameters={'value': 'forgepilot'},
    )
    assert result.exit_code == 126
    assert result.stderr == 'tool is disabled'
    assert record.error == 'tool is disabled'
