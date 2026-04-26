from openhands.forgepilot.tool_registry.registry import (
    BUILTIN_CONNECTOR_TEMPLATES,
    ToolRegistry,
)
from openhands.forgepilot.tool_registry.schema import ToolHealthStatus


def test_builtin_templates_include_target_connectors():
    template_ids = {template.template_id for template in BUILTIN_CONNECTOR_TEMPLATES}
    assert {
        'github',
        'gitlab',
        'jira',
        'linear',
        'notion',
        'sentry',
        'slack',
    }.issubset(template_ids)


def test_registry_from_templates_exposes_entries():
    registry = ToolRegistry.from_builtin_templates()
    tool_ids = [entry.tool_id for entry in registry.list_entries()]
    assert 'connector.github' in tool_ids
    assert 'connector.sentry' in tool_ids


def test_health_check_detects_missing_credentials():
    registry = ToolRegistry.from_builtin_templates()
    health = registry.run_health_check('connector.github', env={})
    assert health.status == ToolHealthStatus.UNREACHABLE
    assert health.detail and 'GITHUB_TOKEN' in health.detail


def test_health_check_detects_network_and_version_degradation():
    registry = ToolRegistry.from_builtin_templates()
    health = registry.run_health_check(
        'connector.github',
        env={'GITHUB_TOKEN': 'x'},
        network_ok=False,
        version_compatible=False,
    )
    assert health.status == ToolHealthStatus.DEGRADED
    assert health.detail and 'network check failed' in health.detail
    assert health.detail and 'version compatibility check failed' in health.detail


def test_record_call_and_cost_aggregation():
    registry = ToolRegistry.from_builtin_templates()

    record = registry.record_call(
        'connector.github',
        parameters={'repo': 'however-yir/forgepilot-studio', 'pr': 418},
        output='checks: lint=success, unit=failed',
        duration_ms=812,
        trace_id='trace-tool-1',
    )
    assert record.trace_id == 'trace-tool-1'
    assert record.parameters_summary.startswith('{"repo":')

    registry.record_cost('connector.github', model_cost_usd=0.21, ci_cost_usd=0.55)
    registry.record_cost(
        'connector.sentry',
        model_cost_usd=0.11,
        external_api_cost_usd=0.09,
    )
    total = registry.aggregate_costs()
    assert total.total_cost_usd == 0.96
