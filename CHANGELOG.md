# Changelog

All notable changes to ForgePilot Studio are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses semantic versioning.

## [Unreleased]

## [v0.2.0-milestone] - 2026-05-01

### Added

- Control Plane: Plan/Execute/Verify/Report task protocol
- Task Console with stage-aware UI
- TeamSpace RBAC (owner/admin/member/viewer)
- Audit Replay with AuditEvent timeline
- MCP Tool Registry with health checks
- LLM Gateway (OpenAI-compatible / Ollama)

### Known Limitations

- `delivery` and `orchestration` modules are stubs (planned for v0.3.0)
- Python package namespace remains `openhands/` during migration period

### Added

- Added an auditable shell-tool execution helper in `openhands.forgepilot.tool_registry`.
- Added a whitelist-driven namespace rename script with scoped forward/rollback patch generation.
- Added release engineering artifacts: compatibility matrix and rollback playbook.

## [1.6.0] - 2026-04-27

### Added

- Introduced ForgePilot task console navigation updates and deployment wizard onboarding path.
- Added tool-registry mock invocation support and low-code HTTP connector request builder.
- Added minimal ForgePilot E2E coverage and dedicated ForgePilot CI workflow.

### Changed

- Updated default branding baseline across core metadata and repository profile docs.
