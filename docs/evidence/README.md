# ForgePilot Studio Evidence Pack

This pack collects the shortest public proof path for reviewing the AI engineering execution workbench.

## Runtime Evidence

- Container proof path: `docker compose up -d --build`
- Primary CI: `.github/workflows/forgepilot-ci.yml`
- GHCR build workflow: `.github/workflows/ghcr-build.yml`
- UI build: `.github/workflows/ui-build.yml`
- Baseline release: `AI Matrix Baseline 2026.05`
- Release: `v0.2.0 Milestone - Control Plane & Task Console`

## Product And Architecture Evidence

- Demo GIF: `docs/assets/screenshots/demo.gif`
- Task console screenshot: `docs/assets/screenshots/task-console.png`
- Runtime log screenshot: `docs/assets/screenshots/runtime-log.png`
- Model config screenshot: `docs/assets/screenshots/model-config.png`
- Differentiation: `docs/fork-differentiation.md`
- Module map: `docs/forgepilot-module-map.md`
- Upstream sync strategy: `docs/upstream-sync.md`

## Verification Checklist

- Start the stack with Docker Compose.
- Open the operator console and confirm task status surfaces are visible.
- Review runtime logs and audit replay evidence.
- Confirm model configuration supports OpenAI-compatible gateways and local models.
- Check MCP/tool governance documentation.
- Open the latest GitHub Actions run and confirm the primary CI is green.
