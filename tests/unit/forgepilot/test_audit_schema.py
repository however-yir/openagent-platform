from datetime import UTC, datetime, timedelta

from openhands.forgepilot.audit.schema import (
    AuditEvent,
    AuditEventType,
    export_audit_events_csv,
    export_audit_events_jsonl,
    ordered_timeline,
)


def test_ordered_timeline_sorts_by_timestamp():
    now = datetime.now(UTC)
    late = AuditEvent(
        trace_id='trace-1',
        event_type=AuditEventType.REPORT,
        summary='final report',
        timestamp=now + timedelta(seconds=10),
    )
    early = AuditEvent(
        trace_id='trace-1',
        event_type=AuditEventType.COMMAND,
        summary='run tests',
        timestamp=now,
    )

    timeline = ordered_timeline([late, early])
    assert [event.summary for event in timeline] == ['run tests', 'final report']


def test_export_audit_events_jsonl():
    event = AuditEvent(
        trace_id='trace-jsonl',
        task_id='task-42',
        event_type=AuditEventType.TOOL_CALL,
        phase='execute',
        summary='invoke github connector',
        payload={'tool': 'github', 'status': 'ok'},
        duration_ms=321,
        cost_usd=0.003,
    )

    content = export_audit_events_jsonl([event])
    assert '"trace_id": "trace-jsonl"' in content
    assert '"event_type": "tool_call"' in content
    assert '"tool": "github"' in content


def test_export_audit_events_csv():
    event = AuditEvent(
        trace_id='trace-csv',
        event_type=AuditEventType.VERIFICATION,
        phase='verify',
        summary='pytest -q',
        payload={'exit_code': 0},
    )

    content = export_audit_events_csv([event])
    lines = content.strip().splitlines()
    assert lines[0].startswith('trace_id,task_id,event_type')
    assert 'trace-csv' in lines[1]
    assert 'verification' in lines[1]
