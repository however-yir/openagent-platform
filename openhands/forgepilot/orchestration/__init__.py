"""Multi-agent orchestration and knowledge injection engine.

D-39: Defines multi-agent role templates and automatic task distribution.
D-40: Manages knowledge memory injection from project context into agent context.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum

from pydantic import BaseModel, Field


class AgentRole(str, Enum):
    EXPLORER = 'explorer'
    IMPLEMENTER = 'implementer'
    VERIFIER = 'verifier'
    REPORTER = 'reporter'
    ORCHESTRATOR = 'orchestrator'


class AgentCapability(BaseModel):
    role: AgentRole
    allowed_tools: list[str] = Field(default_factory=list)
    allowed_paths: list[str] = Field(default_factory=list)
    read_only: bool = False
    max_self_heal: int = 1
    priority: int = 0


class OrchestrationTemplate(BaseModel):
    template_id: str
    name: str
    description: str
    agents: list[AgentCapability]
    handoff_strategy: str = 'sequential'  # 'sequential', 'parallel', 'voting'
    requires_confirmation: bool = True
    knowledge_injection: bool = True


# ── Pre-built Templates ─────────────────────────────


def _bugfix_template() -> OrchestrationTemplate:
    return OrchestrationTemplate(
        template_id='bugfix',
        name='Bugfix',
        description='Reproduce → locate → fix → verify → report',
        agents=[
            AgentCapability(
                role=AgentRole.EXPLORER,
                allowed_tools=['cmd.run', 'file.read', 'mcp.sentry'],
                allowed_paths=['*'],
                read_only=True,
                priority=0,
            ),
            AgentCapability(
                role=AgentRole.IMPLEMENTER,
                allowed_tools=['cmd.run', 'file.edit', 'file.create', 'git.commit'],
                allowed_paths=['src/', 'tests/'],
                read_only=False,
                max_self_heal=2,
                priority=1,
            ),
            AgentCapability(
                role=AgentRole.VERIFIER,
                allowed_tools=['cmd.run', 'file.read'],
                allowed_paths=['*'],
                read_only=True,
                priority=2,
            ),
            AgentCapability(
                role=AgentRole.REPORTER,
                allowed_tools=['file.read', 'delivery.generate'],
                allowed_paths=['*'],
                read_only=True,
                priority=3,
            ),
        ],
        handoff_strategy='sequential',
        requires_confirmation=False,
        knowledge_injection=True,
    )


def _review_template() -> OrchestrationTemplate:
    return OrchestrationTemplate(
        template_id='code-review',
        name='Code Review',
        description='Analyze diff → check for bugs/security/style → report findings',
        agents=[
            AgentCapability(
                role=AgentRole.EXPLORER,
                allowed_tools=['file.read', 'git.diff', 'git.log'],
                allowed_paths=['*'],
                read_only=True,
            ),
            AgentCapability(
                role=AgentRole.REPORTER,
                allowed_tools=['file.read', 'delivery.generate'],
                allowed_paths=['*'],
                read_only=True,
            ),
        ],
        handoff_strategy='sequential',
        requires_confirmation=False,
        knowledge_injection=True,
    )


def _docs_template() -> OrchestrationTemplate:
    return OrchestrationTemplate(
        template_id='docs',
        name='Documentation',
        description='Analyze code → generate/update docs → verify links',
        agents=[
            AgentCapability(
                role=AgentRole.EXPLORER,
                allowed_tools=['file.read', 'cmd.run'],
                allowed_paths=['*'],
                read_only=True,
            ),
            AgentCapability(
                role=AgentRole.IMPLEMENTER,
                allowed_tools=['file.edit', 'file.create'],
                allowed_paths=['docs/', '*.md'],
                read_only=False,
            ),
            AgentCapability(
                role=AgentRole.VERIFIER,
                allowed_tools=['cmd.run'],
                allowed_paths=['docs/'],
                read_only=True,
            ),
        ],
        handoff_strategy='sequential',
        requires_confirmation=True,
        knowledge_injection=True,
    )


BUILTIN_TEMPLATES: dict[str, OrchestrationTemplate] = {
    'bugfix': _bugfix_template(),
    'code-review': _review_template(),
    'docs': _docs_template(),
}


# ── Knowledge Injection ─────────────────────────────


class KnowledgeSource(BaseModel):
    source_type: str  # 'repo_md', 'glossary', 'setup_sh', 'conventions'
    path: str
    content: str
    priority: int = 0


class KnowledgeContext(BaseModel):
    """Aggregated project knowledge injected into agent context."""

    task_id: str
    sources: list[KnowledgeSource] = Field(default_factory=list)
    injected_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    def assemble_system_prompt_fragment(self) -> str:
        """Build the knowledge-injection fragment for the system prompt."""
        if not self.sources:
            return ''

        lines = ['\n## Project Knowledge (injected)', '']
        for src in sorted(self.sources, key=lambda s: -s.priority):
            lines.append(f'### {src.source_type}: {src.path}')
            lines.append(src.content.strip())
            lines.append('')
        return '\n'.join(lines)


class KnowledgeLoader:
    """Loads project knowledge from repo conventions and injects into agent context."""

    _instance: KnowledgeLoader | None = None

    def __init__(self) -> None:
        self._cache: dict[str, str] = {}

    @classmethod
    def get(cls) -> KnowledgeLoader:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load(self, path: str) -> str | None:
        if path in self._cache:
            return self._cache[path]
        try:
            with open(path) as f:
                content = f.read()
            self._cache[path] = content
            return content
        except FileNotFoundError:
            return None

    def build_context(
        self, task_id: str, workspace_root: str = '.'
    ) -> KnowledgeContext:
        context = KnowledgeContext(task_id=task_id)
        sources_to_check = [
            ('repo_md', f'{workspace_root}/.forgepilot/microagents/repo.md', 3),
            ('glossary', f'{workspace_root}/.forgepilot/microagents/glossary.md', 2),
            ('setup_sh', f'{workspace_root}/.forgepilot/setup.sh', 1),
            ('conventions', f'{workspace_root}/.forgepilot/conventions.md', 2),
            ('knowledge', f'{workspace_root}/.forgepilot/knowledge.md', 2),
        ]
        for source_type, path, priority in sources_to_check:
            content = self.load(path)
            if content:
                context.sources.append(
                    KnowledgeSource(
                        source_type=source_type,
                        path=path,
                        content=content,
                        priority=priority,
                    )
                )
        return context


class OrchestrationRegistry:
    """Registry of multi-agent orchestration templates."""

    def __init__(self) -> None:
        self._templates: dict[str, OrchestrationTemplate] = dict(BUILTIN_TEMPLATES)

    def register(self, template: OrchestrationTemplate) -> None:
        self._templates[template.template_id] = template

    def get(self, template_id: str) -> OrchestrationTemplate | None:
        return self._templates.get(template_id)

    def list_templates(self) -> list[OrchestrationTemplate]:
        return list(self._templates.values())

    def next_agent(
        self,
        template: OrchestrationTemplate,
        completed_role: AgentRole | None,
    ) -> AgentCapability | None:
        """Determine the next agent to dispatch based on handoff strategy."""
        if completed_role is None:
            # Start with the first agent
            for a in sorted(template.agents, key=lambda a: a.priority):
                return a
            return None

        for a in sorted(template.agents, key=lambda a: a.priority):
            if a.priority > _get_priority(template, completed_role):
                return a
        return None


def _get_priority(template: OrchestrationTemplate, role: AgentRole) -> int:
    for agent in template.agents:
        if agent.role == role:
            return agent.priority
    return -1


orchestration_registry = OrchestrationRegistry()
knowledge_loader = KnowledgeLoader.get()
