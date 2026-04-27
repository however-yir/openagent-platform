"""ForgePilot tool registry schema and helpers."""

from .registry import (
    BUILTIN_CONNECTOR_TEMPLATES,
    ConnectorTemplate,
    HTTPConnectorConfig,
    ToolCallRecord,
    ToolMockSpec,
    ToolRegistry,
    build_http_connector_request,
)
from .schema import (
    ToolCostBreakdown,
    ToolExecutionMode,
    ToolHealthCheck,
    ToolHealthStatus,
    ToolPermission,
    ToolRegistryEntry,
    ToolSchemaRef,
    summarize_tool_output,
)
from .shell_tools import ShellToolResult, ShellToolSpec, execute_shell_tool

__all__ = [
    'ConnectorTemplate',
    'HTTPConnectorConfig',
    'ToolMockSpec',
    'ToolCallRecord',
    'ToolRegistry',
    'BUILTIN_CONNECTOR_TEMPLATES',
    'build_http_connector_request',
    'ToolPermission',
    'ToolExecutionMode',
    'ToolHealthStatus',
    'ToolSchemaRef',
    'ToolHealthCheck',
    'ToolCostBreakdown',
    'ToolRegistryEntry',
    'summarize_tool_output',
    'ShellToolSpec',
    'ShellToolResult',
    'execute_shell_tool',
]
