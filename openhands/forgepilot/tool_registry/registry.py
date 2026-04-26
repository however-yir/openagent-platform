from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Mapping
from uuid import uuid4

from pydantic import BaseModel, Field

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


class ConnectorTemplate(BaseModel):
    template_id: str
    display_name: str
    provider: str
    required_env_vars: tuple[str, ...] = ()
    default_permission: ToolPermission = ToolPermission.READ
    schema_location: str


class ToolCallRecord(BaseModel):
    trace_id: str
    tool_id: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    duration_ms: int
    parameters_summary: str
    output_summary: str
    error: str | None = None
    mode: ToolExecutionMode = ToolExecutionMode.LIVE


BUILTIN_CONNECTOR_TEMPLATES: tuple[ConnectorTemplate, ...] = (
    ConnectorTemplate(
        template_id='github',
        display_name='GitHub',
        provider='github',
        required_env_vars=('GITHUB_TOKEN',),
        default_permission=ToolPermission.CONFIRM,
        schema_location='app://github/schema',
    ),
    ConnectorTemplate(
        template_id='gitlab',
        display_name='GitLab',
        provider='gitlab',
        required_env_vars=('GITLAB_TOKEN',),
        default_permission=ToolPermission.CONFIRM,
        schema_location='app://gitlab/schema',
    ),
    ConnectorTemplate(
        template_id='jira',
        display_name='Jira',
        provider='jira',
        required_env_vars=('JIRA_BASE_URL', 'JIRA_API_TOKEN'),
        default_permission=ToolPermission.WRITE,
        schema_location='app://jira/schema',
    ),
    ConnectorTemplate(
        template_id='linear',
        display_name='Linear',
        provider='linear',
        required_env_vars=('LINEAR_API_KEY',),
        default_permission=ToolPermission.WRITE,
        schema_location='app://linear/schema',
    ),
    ConnectorTemplate(
        template_id='notion',
        display_name='Notion',
        provider='notion',
        required_env_vars=('NOTION_API_KEY',),
        default_permission=ToolPermission.WRITE,
        schema_location='app://notion/schema',
    ),
    ConnectorTemplate(
        template_id='sentry',
        display_name='Sentry',
        provider='sentry',
        required_env_vars=('SENTRY_AUTH_TOKEN',),
        default_permission=ToolPermission.READ,
        schema_location='app://sentry/schema',
    ),
    ConnectorTemplate(
        template_id='slack',
        display_name='Slack',
        provider='slack',
        required_env_vars=('SLACK_BOT_TOKEN',),
        default_permission=ToolPermission.WRITE,
        schema_location='app://slack/schema',
    ),
)


class ToolRegistry:
    def __init__(self, entries: list[ToolRegistryEntry] | None = None):
        self._entries: dict[str, ToolRegistryEntry] = {}
        self._call_records: list[ToolCallRecord] = []
        for entry in entries or []:
            self._entries[entry.tool_id] = entry.model_copy(deep=True)

    @classmethod
    def from_builtin_templates(cls) -> 'ToolRegistry':
        entries = [
            ToolRegistryEntry(
                tool_id=f'connector.{template.template_id}',
                display_name=template.display_name,
                provider=template.provider,
                permission=template.default_permission,
                schema_ref=ToolSchemaRef(location=template.schema_location),
            )
            for template in BUILTIN_CONNECTOR_TEMPLATES
        ]
        return cls(entries=entries)

    def list_entries(self) -> list[ToolRegistryEntry]:
        return [self._entries[key] for key in sorted(self._entries)]

    def get_entry(self, tool_id: str) -> ToolRegistryEntry:
        return self._entries[tool_id]

    def register(self, entry: ToolRegistryEntry) -> ToolRegistryEntry:
        self._entries[entry.tool_id] = entry.model_copy(deep=True)
        return self._entries[entry.tool_id]

    def set_enabled(self, tool_id: str, enabled: bool) -> ToolRegistryEntry:
        entry = self.get_entry(tool_id)
        entry.enabled = enabled
        return entry

    def set_permission(
        self,
        tool_id: str,
        permission: ToolPermission,
    ) -> ToolRegistryEntry:
        entry = self.get_entry(tool_id)
        entry.permission = permission
        return entry

    def set_mode(
        self,
        tool_id: str,
        mode: ToolExecutionMode,
    ) -> ToolRegistryEntry:
        entry = self.get_entry(tool_id)
        entry.mode = mode
        return entry

    def record_call(
        self,
        tool_id: str,
        parameters: Mapping[str, object] | str,
        output: str,
        duration_ms: int,
        *,
        error: str | None = None,
        trace_id: str | None = None,
    ) -> ToolCallRecord:
        entry = self.get_entry(tool_id)
        parameters_text = (
            json.dumps(parameters, ensure_ascii=False)
            if isinstance(parameters, Mapping)
            else str(parameters)
        )
        record = ToolCallRecord(
            trace_id=trace_id or uuid4().hex,
            tool_id=tool_id,
            duration_ms=duration_ms,
            parameters_summary=summarize_tool_output(parameters_text, max_chars=300),
            output_summary=summarize_tool_output(output, max_chars=800),
            error=error,
            mode=entry.mode,
        )
        self._call_records.append(record)
        return record

    def list_call_records(self, tool_id: str | None = None) -> list[ToolCallRecord]:
        if tool_id is None:
            return list(self._call_records)
        return [record for record in self._call_records if record.tool_id == tool_id]

    def run_health_check(
        self,
        tool_id: str,
        *,
        env: Mapping[str, str | None] | None = None,
        network_ok: bool = True,
        version_compatible: bool = True,
    ) -> ToolHealthCheck:
        entry = self.get_entry(tool_id)
        env = env or {}
        template = next(
            (
                value
                for value in BUILTIN_CONNECTOR_TEMPLATES
                if value.provider == entry.provider
            ),
            None,
        )
        required_env_vars = template.required_env_vars if template else ()
        missing_env_vars = [name for name in required_env_vars if not env.get(name)]

        status = ToolHealthStatus.HEALTHY
        details: list[str] = []
        if missing_env_vars:
            status = ToolHealthStatus.UNREACHABLE
            details.append(f'missing credentials: {", ".join(missing_env_vars)}')
        else:
            if not network_ok:
                status = ToolHealthStatus.DEGRADED
                details.append('network check failed')
            if not version_compatible:
                status = ToolHealthStatus.DEGRADED
                details.append('version compatibility check failed')

        health_check = ToolHealthCheck(
            status=status,
            detail='; '.join(details) if details else 'ready',
        )
        entry.health_check = health_check
        return health_check

    def record_cost(
        self,
        tool_id: str,
        *,
        model_cost_usd: float = 0.0,
        ci_cost_usd: float = 0.0,
        external_api_cost_usd: float = 0.0,
    ) -> ToolCostBreakdown:
        entry = self.get_entry(tool_id)
        entry.cost.model_cost_usd = round(entry.cost.model_cost_usd + model_cost_usd, 6)
        entry.cost.ci_cost_usd = round(entry.cost.ci_cost_usd + ci_cost_usd, 6)
        entry.cost.external_api_cost_usd = round(
            entry.cost.external_api_cost_usd + external_api_cost_usd,
            6,
        )
        return entry.cost

    def aggregate_costs(self) -> ToolCostBreakdown:
        total = ToolCostBreakdown()
        for entry in self._entries.values():
            total.model_cost_usd = round(
                total.model_cost_usd + entry.cost.model_cost_usd,
                6,
            )
            total.ci_cost_usd = round(total.ci_cost_usd + entry.cost.ci_cost_usd, 6)
            total.external_api_cost_usd = round(
                total.external_api_cost_usd + entry.cost.external_api_cost_usd,
                6,
            )
        return total
