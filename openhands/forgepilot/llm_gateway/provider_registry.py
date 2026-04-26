from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class LLMGatewayProvider:
    provider_id: str
    display_name: str
    default_base_url: str


_PROVIDERS: tuple[LLMGatewayProvider, ...] = (
    LLMGatewayProvider('openai', 'OpenAI', 'https://api.openai.com/v1'),
    LLMGatewayProvider('anthropic', 'Anthropic', 'https://api.anthropic.com'),
    LLMGatewayProvider('ollama', 'Ollama', 'http://localhost:11434/v1'),
    LLMGatewayProvider('litellm', 'LiteLLM', 'http://localhost:4000/v1'),
    LLMGatewayProvider(
        'forgepilot', 'ForgePilot Gateway', 'https://llm.forgepilot.local/v1'
    ),
)


def list_gateway_providers() -> tuple[LLMGatewayProvider, ...]:
    return _PROVIDERS


def detect_provider(model_identifier: str) -> LLMGatewayProvider | None:
    if '/' not in model_identifier:
        return None

    prefix = model_identifier.split('/', 1)[0].strip().lower()
    for provider in _PROVIDERS:
        if provider.provider_id == prefix:
            return provider
    return None


def normalize_model_identifier(model_identifier: str) -> str:
    """Return model name without provider prefix for routing-layer matching."""

    if '/' not in model_identifier:
        return model_identifier.strip()
    return model_identifier.split('/', 1)[1].strip()
