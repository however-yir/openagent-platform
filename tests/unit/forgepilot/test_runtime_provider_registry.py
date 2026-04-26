from openhands.forgepilot.runtime_providers.registry import (
    get_runtime_provider,
    list_runtime_providers,
)


def test_runtime_providers_have_expected_defaults():
    providers = list_runtime_providers()
    names = [provider.name for provider in providers]
    assert names == ['local', 'docker', 'kubernetes', 'remote']


def test_get_runtime_provider_case_insensitive():
    provider = get_runtime_provider('Docker')
    assert provider is not None
    assert provider.runtime_class == 'DockerRuntime'
    assert provider.supports_resource_quota is True
