from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RuntimeProviderSpec:
    name: str
    runtime_class: str
    supports_network_policy: bool
    supports_resource_quota: bool


_RUNTIME_PROVIDERS: tuple[RuntimeProviderSpec, ...] = (
    RuntimeProviderSpec(
        name="local",
        runtime_class="CLIRuntime",
        supports_network_policy=False,
        supports_resource_quota=False,
    ),
    RuntimeProviderSpec(
        name="docker",
        runtime_class="DockerRuntime",
        supports_network_policy=True,
        supports_resource_quota=True,
    ),
    RuntimeProviderSpec(
        name="kubernetes",
        runtime_class="KubernetesRuntime",
        supports_network_policy=True,
        supports_resource_quota=True,
    ),
    RuntimeProviderSpec(
        name="remote",
        runtime_class="RemoteRuntime",
        supports_network_policy=True,
        supports_resource_quota=True,
    ),
)


def list_runtime_providers() -> tuple[RuntimeProviderSpec, ...]:
    return _RUNTIME_PROVIDERS


def get_runtime_provider(name: str) -> RuntimeProviderSpec | None:
    normalized = name.strip().lower()
    for provider in _RUNTIME_PROVIDERS:
        if provider.name == normalized:
            return provider
    return None
