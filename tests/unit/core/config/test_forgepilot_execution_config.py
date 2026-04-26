from openhands.core.config.forgepilot_execution_config import ForgePilotExecutionConfig


def test_forgepilot_execution_defaults():
    config = ForgePilotExecutionConfig()

    assert config.protocol == ("plan", "execute", "verify", "report")
    assert config.confirmation_mode == "on-request"
    assert config.max_self_heal_rounds == 2
    assert "rm -rf" in config.dangerous_command_patterns


def test_forgepilot_execution_verify_command_override_and_fallback():
    config = ForgePilotExecutionConfig(
        auto_verify_command_map={
            "python": ["pytest -q"],
            "typescript": ["npm run test"],
        }
    )

    assert config.get_verify_commands("python") == ["pytest -q"]
    assert config.get_verify_commands("go") == ["go test ./..."]
