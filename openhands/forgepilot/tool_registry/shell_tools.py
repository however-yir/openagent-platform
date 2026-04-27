from __future__ import annotations

import shlex
import subprocess
import time
from pathlib import Path
from typing import Mapping

from pydantic import BaseModel, Field

from .registry import ToolRegistry
from .schema import ToolPermission


class ShellToolSpec(BaseModel):
    tool_id: str
    display_name: str
    command: str
    args: list[str] = Field(default_factory=list)
    cwd: str | None = None
    timeout_seconds: int = Field(default=120, ge=1, le=1800)


class ShellToolResult(BaseModel):
    exit_code: int
    stdout: str
    stderr: str
    command_line: str


def _build_command(spec: ShellToolSpec, parameters: Mapping[str, object]) -> list[str]:
    command = [spec.command]
    for arg in spec.args:
        rendered = arg
        for key, value in parameters.items():
            rendered = rendered.replace(f'{{{{{key}}}}}', str(value))
        command.append(rendered)
    return command


def _summarize_result(result: ShellToolResult) -> str:
    lines = [
        f'command: {result.command_line}',
        f'exit_code: {result.exit_code}',
    ]
    if result.stdout:
        lines.append(f'stdout: {result.stdout.strip()}')
    if result.stderr:
        lines.append(f'stderr: {result.stderr.strip()}')
    return '\n'.join(lines)


def execute_shell_tool(
    registry: ToolRegistry,
    spec: ShellToolSpec,
    *,
    parameters: Mapping[str, object] | None = None,
    trace_id: str | None = None,
    workspace_root: Path | None = None,
    confirmed: bool = False,
) -> tuple[ShellToolResult, object]:
    parameters = parameters or {}
    entry = registry.get_entry(spec.tool_id)
    command = _build_command(spec, parameters)
    command_line = shlex.join(command)

    if not entry.enabled:
        result = ShellToolResult(
            exit_code=126,
            stdout='',
            stderr='tool is disabled',
            command_line=command_line,
        )
        record = registry.record_call(
            spec.tool_id,
            parameters=parameters,
            output=_summarize_result(result),
            duration_ms=0,
            error='tool is disabled',
            trace_id=trace_id,
        )
        return result, record

    if entry.permission not in {ToolPermission.EXECUTE, ToolPermission.CONFIRM}:
        result = ShellToolResult(
            exit_code=126,
            stdout='',
            stderr=f'permission {entry.permission.value} does not allow shell execution',
            command_line=command_line,
        )
        record = registry.record_call(
            spec.tool_id,
            parameters=parameters,
            output=_summarize_result(result),
            duration_ms=0,
            error='permission denied',
            trace_id=trace_id,
        )
        return result, record

    if entry.permission == ToolPermission.CONFIRM and not confirmed:
        result = ShellToolResult(
            exit_code=126,
            stdout='',
            stderr='confirmation is required for this tool',
            command_line=command_line,
        )
        record = registry.record_call(
            spec.tool_id,
            parameters=parameters,
            output=_summarize_result(result),
            duration_ms=0,
            error='confirmation required',
            trace_id=trace_id,
        )
        return result, record

    if spec.cwd:
        cwd = Path(spec.cwd)
    elif workspace_root is not None:
        cwd = workspace_root
    else:
        cwd = Path.cwd()

    started = time.perf_counter()
    completed = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        capture_output=True,
        timeout=spec.timeout_seconds,
        check=False,
    )
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    result = ShellToolResult(
        exit_code=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
        command_line=command_line,
    )

    record = registry.record_call(
        spec.tool_id,
        parameters=parameters,
        output=_summarize_result(result),
        duration_ms=elapsed_ms,
        error=None if completed.returncode == 0 else f'exit code {completed.returncode}',
        trace_id=trace_id,
    )
    return result, record
