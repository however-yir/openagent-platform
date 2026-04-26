from __future__ import annotations

import csv
import io
import json
from datetime import UTC, datetime
from enum import Enum
from typing import Any, Iterable

from pydantic import BaseModel, Field


class AuditEventType(str, Enum):
    MODEL = 'model'
    COMMAND = 'command'
    FILE_CHANGE = 'file_change'
    TOOL_CALL = 'tool_call'
    VERIFICATION = 'verification'
    REPORT = 'report'


class AuditEvent(BaseModel):
    trace_id: str
    task_id: str | None = None
    event_type: AuditEventType
    phase: str | None = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    summary: str
    payload: dict[str, Any] = Field(default_factory=dict)
    duration_ms: int | None = None
    cost_usd: float | None = None

    def model_dump_for_export(self) -> dict[str, Any]:
        return {
            'trace_id': self.trace_id,
            'task_id': self.task_id or '',
            'event_type': self.event_type.value,
            'phase': self.phase or '',
            'timestamp': self.timestamp.isoformat(),
            'summary': self.summary,
            'duration_ms': self.duration_ms or '',
            'cost_usd': self.cost_usd if self.cost_usd is not None else '',
            'payload': self.payload,
        }


def ordered_timeline(events: Iterable[AuditEvent]) -> list[AuditEvent]:
    return sorted(events, key=lambda event: event.timestamp)


def export_audit_events_jsonl(events: Iterable[AuditEvent]) -> str:
    lines: list[str] = []
    for event in ordered_timeline(events):
        row = event.model_dump_for_export()
        lines.append(json.dumps(row, ensure_ascii=False))
    return '\n'.join(lines)


def export_audit_events_csv(events: Iterable[AuditEvent]) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=[
            'trace_id',
            'task_id',
            'event_type',
            'phase',
            'timestamp',
            'summary',
            'duration_ms',
            'cost_usd',
            'payload',
        ],
    )
    writer.writeheader()

    for event in ordered_timeline(events):
        row = event.model_dump_for_export()
        row['payload'] = json.dumps(row['payload'], ensure_ascii=False)
        writer.writerow(row)

    return output.getvalue()
