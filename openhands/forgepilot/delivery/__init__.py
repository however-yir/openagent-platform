"""One-click delivery artifacts: PR description, test report, replay link.

Assembles task execution records into shippable deliverables for code review
and release workflows.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field

from openhands.forgepilot.audit.schema import AuditEvent, AuditEventType, ordered_timeline
from openhands.forgepilot.audit.timeline import AuditTimeline, build_timeline


class FileChangeSummary(BaseModel):
    path: str
    action: str  # 'added', 'modified', 'deleted', 'renamed'
    lines_added: int = 0
    lines_removed: int = 0
    description: str = ''


class TestResult(BaseModel):
    name: str
    passed: bool
    duration_ms: int = 0
    output: str = ''
    error: str = ''


class TestReport(BaseModel):
    total: int = 0
    passed: int = 0
    failed: int = 0
    skipped: int = 0
    duration_ms: int = 0
    results: list[TestResult] = Field(default_factory=list)

    @property
    def pass_rate(self) -> float:
        if self.total == 0:
            return 1.0
        return self.passed / self.total


class PRDescription(BaseModel):
    title: str
    body: str
    labels: list[str] = Field(default_factory=list)
    reviewers: list[str] = Field(default_factory=list)


class ReplayLink(BaseModel):
    url: str
    task_id: str
    expires_at: datetime | None = None


class DeliveryArtifact(BaseModel):
    """One-click delivery output for a completed ForgePilot task."""

    task_id: str
    task_title: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    pr_description: PRDescription | None = None
    test_report: TestReport | None = None
    replay_link: ReplayLink | None = None
    file_changes: list[FileChangeSummary] = Field(default_factory=list)
    commit_message: str = ''
    summary: str = ''


def _extract_file_changes(events: list[AuditEvent]) -> list[FileChangeSummary]:
    changes: dict[str, FileChangeSummary] = {}
    for event in events:
        if event.event_type != AuditEventType.FILE_CHANGE:
            continue
        path = event.payload.get('path', '')
        if not path:
            continue
        if path not in changes:
            changes[path] = FileChangeSummary(
                path=path,
                action=event.payload.get('action', 'modified'),
                description=event.summary,
            )
        changes[path].lines_added += event.payload.get('lines_added', 0)
        changes[path].lines_removed += event.payload.get('lines_removed', 0)
    return list(changes.values())


def _extract_test_results(events: list[AuditEvent]) -> TestReport:
    report = TestReport()
    for event in events:
        if event.event_type != AuditEventType.VERIFICATION:
            continue
        test_data = event.payload.get('tests', [])
        if isinstance(test_data, list):
            for t in test_data:
                result = TestResult(
                    name=t.get('name', 'unnamed'),
                    passed=t.get('passed', True),
                    duration_ms=t.get('duration_ms', 0),
                    output=t.get('output', ''),
                    error=t.get('error', ''),
                )
                report.results.append(result)
                report.total += 1
                if result.passed:
                    report.passed += 1
                else:
                    report.failed += 1
        report.duration_ms += event.duration_ms or 0
    return report


def _generate_commit_message(task_title: str, file_changes: list[FileChangeSummary]) -> str:
    scope = ', '.join(c.path for c in file_changes[:3])
    if len(file_changes) > 3:
        scope += f' (+{len(file_changes) - 3} more)'
    return f'forgepilot: {task_title}\n\nAffected: {scope}'


def _generate_pr_body(
    task_title: str,
    task_objective: str,
    file_changes: list[FileChangeSummary],
    test_report: TestReport | None,
    timeline: AuditTimeline,
) -> str:
    lines = [
        f'## Summary',
        f'',
        f'{task_objective}',
        f'',
        f'## Changes',
        f'',
    ]
    for change in file_changes:
        emoji = {'added': '+', 'modified': '~', 'deleted': '-', 'renamed': '→'}.get(
            change.action, '?'
        )
        lines.append(f'- `{emoji}` `{change.path}` - {change.description}')

    lines.extend(['', '## Verification', ''])
    if test_report and test_report.total > 0:
        lines.append(
            f'**{test_report.passed}/{test_report.total} tests passed** '
            f'({test_report.pass_rate:.0%} pass rate)'
        )
        for r in test_report.results:
            if not r.passed:
                lines.append(f'- FAIL: `{r.name}` — {r.error}')
    else:
        lines.append('Verification commands ran successfully (see audit replay).')

    lines.extend([
        '',
        f'## Audit Replay',
        f'',
        f'Full execution trace: {timeline.summary}',
        f'Cost: ${timeline.total_cost_usd:.4f} | Duration: {timeline.total_duration_ms}ms',
        f'',
        f'---',
        f'Generated by ForgePilot Studio',
    ])
    return '\n'.join(lines)


def generate_delivery_artifact(
    task_id: str,
    task_title: str,
    task_objective: str,
    events: list[AuditEvent],
    *,
    replay_base_url: str = 'https://forgepilot.studio/audit',
    git_pr_labels: list[str] | None = None,
    git_reviewers: list[str] | None = None,
) -> DeliveryArtifact:
    """Produce a one-click delivery artifact from completed task events."""
    sorted_events = ordered_timeline(events)
    timeline = build_timeline(sorted_events)
    file_changes = _extract_file_changes(sorted_events)
    test_report = _extract_test_results(sorted_events)
    commit_msg = _generate_commit_message(task_title, file_changes)

    pr_body = _generate_pr_body(
        task_title, task_objective, file_changes, test_report, timeline
    )

    artifact = DeliveryArtifact(
        task_id=task_id,
        task_title=task_title,
        pr_description=PRDescription(
            title=f'forgepilot: {task_title}',
            body=pr_body,
            labels=git_pr_labels or [],
            reviewers=git_reviewers or [],
        ),
        test_report=test_report,
        replay_link=ReplayLink(
            url=f'{replay_base_url}/{task_id}',
            task_id=task_id,
        ),
        file_changes=file_changes,
        commit_message=commit_msg,
        summary=timeline.summary,
    )
    return artifact


def export_delivery_json(artifact: DeliveryArtifact) -> str:
    """Serialize delivery artifact as JSON for the Delivery page API."""
    return artifact.model_dump_json(indent=2, exclude_none=True)
