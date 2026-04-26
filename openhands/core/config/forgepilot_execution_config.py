from __future__ import annotations

from pydantic import BaseModel, Field

from openhands.forgepilot.control_plane.task_protocol import (
    select_verification_commands,
)


class ForgePilotExecutionConfig(BaseModel):
    """ForgePilot execution strategy controls.

    This config maps to the Plan -> Execute -> Verify -> Report task protocol and
    allows teams to centralize guardrails for confirmation mode, path boundaries,
    network access, and self-heal retry rounds.
    """

    protocol: tuple[str, str, str, str] = ('plan', 'execute', 'verify', 'report')
    confirmation_mode: str = 'on-request'
    dangerous_command_patterns: list[str] = Field(
        default_factory=lambda: [
            'rm -rf',
            'dd if=',
            'mkfs',
            'shutdown',
            'reboot',
            'curl | sh',
        ]
    )
    network_access_policy: str = 'allowlist'
    enforce_change_boundary: bool = True
    allowed_paths: list[str] = Field(default_factory=list)
    allowed_file_extensions: list[str] = Field(
        default_factory=lambda: [
            '.py',
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.md',
            '.yml',
            '.yaml',
            '.toml',
            '.json',
            '.sh',
        ]
    )
    readonly_research_mode: bool = False
    review_mode: bool = False
    handoff_mode: bool = False
    max_self_heal_rounds: int = Field(default=2, ge=0, le=10)

    auto_verify_command_map: dict[str, list[str]] = Field(
        default_factory=lambda: {
            'python': ['pytest -q'],
            'typescript': ['npm run typecheck', 'npm test -- --runInBand'],
            'javascript': ['npm test -- --runInBand'],
            'java': ['mvn -q test'],
            'rust': ['cargo test'],
            'go': ['go test ./...'],
        }
    )

    def get_verify_commands(self, language: str) -> list[str]:
        lowered = language.strip().lower()
        if lowered in self.auto_verify_command_map:
            return self.auto_verify_command_map[lowered]
        return select_verification_commands(language)
