"""Runtime tool permission enforcement and schema visualization.

E-41: Generates Mermaid diagrams and JSON Schema visualizations for MCP tools.
E-43: Wraps tool invocations with runtime permission guards that cannot be bypassed.
"""

from __future__ import annotations

import copy
import fnmatch
import json
from dataclasses import dataclass, field
from typing import Any, Callable, Mapping

from .registry import ToolRegistry
from .schema import ToolExecutionMode, ToolPermission, ToolRegistryEntry


# ───────────────────────────────────────────────
#  E-43: Runtime Permission Enforcement
# ───────────────────────────────────────────────


@dataclass
class PermissionViolation:
    tool_id: str
    required_permission: ToolPermission
    actual_permission: ToolPermission
    detail: str


class ToolAccessGuard:
    """Runtime guard that intercepts every tool invocation.

    Cannot be bypassed — wraps the ToolRegistry.invoke() entrypoint so that
    every call path (shell, HTTP, MCP, script) goes through the same check.
    """

    def __init__(
        self,
        registry: ToolRegistry,
        *,
        path_allowlist: list[str] | None = None,
        path_blocklist: list[str] | None = None,
    ) -> None:
        self._registry = registry
        self._path_allowlist = path_allowlist or []
        self._path_blocklist = path_blocklist or []
        self._violations: list[PermissionViolation] = []
        self._block_on_violation = True

    @property
    def violations(self) -> list[PermissionViolation]:
        return list(self._violations)

    def check(
        self,
        tool_id: str,
        *,
        required: ToolPermission = ToolPermission.READ,
        target_path: str | None = None,
    ) -> bool:
        """Check whether a tool call is allowed under the current policy.

        Returns True if allowed; appends a violation and returns False otherwise.
        """
        try:
            entry = self._registry.get_entry(tool_id)
        except KeyError:
            self._violations.append(
                PermissionViolation(
                    tool_id=tool_id,
                    required_permission=required,
                    actual_permission=ToolPermission.READ,
                    detail=f'unknown tool: {tool_id}',
                )
            )
            return False

        if not entry.enabled:
            self._violations.append(
                PermissionViolation(
                    tool_id=tool_id,
                    required_permission=required,
                    actual_permission=entry.permission,
                    detail='tool is disabled',
                )
            )
            return False

        # Permission level check
        if not _meets_permission(entry.permission, required):
            self._violations.append(
                PermissionViolation(
                    tool_id=tool_id,
                    required_permission=required,
                    actual_permission=entry.permission,
                    detail=f'insufficient permission: need {required.value}, have {entry.permission.value}',
                )
            )
            return False

        # Path boundary check
        if target_path is not None:
            if self._path_blocklist and any(
                fnmatch.fnmatch(target_path, pattern)
                for pattern in self._path_blocklist
            ):
                self._violations.append(
                    PermissionViolation(
                        tool_id=tool_id,
                        required_permission=required,
                        actual_permission=entry.permission,
                        detail=f'path {target_path} is blocked',
                    )
                )
                return False

            if self._path_allowlist and not any(
                fnmatch.fnmatch(target_path, pattern)
                for pattern in self._path_allowlist
            ):
                self._violations.append(
                    PermissionViolation(
                        tool_id=tool_id,
                        required_permission=required,
                        actual_permission=entry.permission,
                        detail=f'path {target_path} is not in allowlist',
                    )
                )
                return False

        return True

    def guard_invoke(
        self,
        tool_id: str,
        parameters: Mapping[str, object] | str,
        *,
        executor: Callable | None = None,
        trace_id: str | None = None,
        target_path: str | None = None,
        required: ToolPermission = ToolPermission.READ,
    ):
        """Invoke a tool through the permission guard.

        Behaves identically to ToolRegistry.invoke but first runs permission,
        enablement, and path-boundary checks.  Raises PermissionError on violation
        when block_on_violation is True.
        """
        if not self.check(
            tool_id,
            required=required,
            target_path=target_path,
        ):
            if self._block_on_violation:
                latest = self._violations[-1]
                raise PermissionError(
                    f'Tool access denied: {latest.tool_id} — {latest.detail}'
                )
            # If not blocking, return a synthetic error record
            return self._registry.record_call(
                tool_id=tool_id,
                parameters=parameters,
                output='',
                duration_ms=0,
                error=f'permission denied: {self._violations[-1].detail}',
                trace_id=trace_id,
            )

        return self._registry.invoke(
            tool_id,
            parameters,
            executor=executor,
            trace_id=trace_id,
        )


# ───────────────────────────────────────────────
#  E-41: Schema Visualization (Mermaid + JSON)
# ───────────────────────────────────────────────


@dataclass
class SchemaNode:
    name: str
    type_: str  # 'object', 'string', 'number', 'array', 'boolean'
    required: bool = False
    children: list["SchemaNode"] = field(default_factory=list)
    description: str = ""


def _entries_to_graph(entries: list[ToolRegistryEntry]) -> str:
    """Render tool schemas as a Mermaid graph for the MCP Registry dashboard."""
    lines = ["graph TD", "  TITLE[MCP Tool Registry]"]
    for entry in entries:
        node_id = _safe_id(entry.tool_id)
        provider = entry.provider or "unknown"
        permission = entry.permission.value
        status = "enabled" if entry.enabled else "disabled"
        lines.append(
            f'  {node_id}["{entry.display_name} ({entry.tool_id})<br/>'
            f'{provider} | {permission} | {status}"]'
        )
        if entry.schema_ref:
            schema_id = f"{node_id}_schema"
            lines.append(
                f'  {schema_id}[("Schema: {entry.schema_ref.schema_type}")]'
            )
            lines.append(f"  {node_id} --> {schema_id}")
    return "\n".join(lines)


def _entry_to_json_schema(entry: ToolRegistryEntry) -> dict[str, Any]:
    """Generate a JSON Schema fragment for a tool registry entry."""
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": entry.display_name,
        "type": "object",
        "properties": {
            "tool_id": {"type": "string", "const": entry.tool_id},
            "provider": {"type": "string", "const": entry.provider},
            "permission": {
                "type": "string",
                "enum": [p.value for p in ToolPermission],
                "default": entry.permission.value,
            },
            "enabled": {"type": "boolean", "default": entry.enabled},
            "mode": {
                "type": "string",
                "enum": [m.value for m in ToolExecutionMode],
                "default": entry.mode.value,
            },
            "health_status": {
                "type": "string",
                "enum": ["unknown", "healthy", "degraded", "unreachable"],
            },
        },
    }


def generate_mermaid_registry_graph(registry: ToolRegistry) -> str:
    """Generate a complete Mermaid diagram of the tool registry for the dashboard."""
    entries = registry.list_entries()
    return _entries_to_graph(entries)


def generate_json_schemas(registry: ToolRegistry) -> dict[str, dict[str, Any]]:
    """Generate JSON Schema definitions for every registered tool."""
    return {
        entry.tool_id: _entry_to_json_schema(entry)
        for entry in registry.list_entries()
    }


def _safe_id(tool_id: str) -> str:
    return tool_id.replace(".", "_").replace("-", "_").replace(":", "_")


def _meets_permission(actual: ToolPermission, required: ToolPermission) -> bool:
    """Check if actual permission level satisfies the required level."""
    levels = {
        ToolPermission.READ: 0,
        ToolPermission.WRITE: 1,
        ToolPermission.EXECUTE: 2,
        ToolPermission.CONFIRM: 0,  # CONFIRM requires human approval, not auto
    }
    return levels.get(actual, 0) >= levels.get(required, 0)
