from openhands.forgepilot.llm_gateway.provider_registry import (
    detect_provider,
    list_gateway_providers,
    normalize_model_identifier,
)


def test_detect_provider_from_model_identifier():
    provider = detect_provider("openai/gpt-4.1")
    assert provider is not None
    assert provider.provider_id == "openai"


def test_detect_provider_unknown_prefix_returns_none():
    assert detect_provider("unknown/model-x") is None


def test_normalize_model_identifier():
    assert normalize_model_identifier("anthropic/claude-3-7-sonnet") == "claude-3-7-sonnet"
    assert normalize_model_identifier("gpt-4.1") == "gpt-4.1"


def test_gateway_registry_includes_forgepilot_provider():
    provider_ids = {provider.provider_id for provider in list_gateway_providers()}
    assert "forgepilot" in provider_ids
