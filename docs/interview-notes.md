# Interview Notes

## One-Minute Pitch

ForgePilot Studio is an auditable AI engineering execution workspace based on a deep OpenHands fork. It focuses on the team governance layer around coding agents: task protocol, operator console, team permissions, audit replay, budget thresholds, MCP tool management, and private deployment configuration.

## What It Proves

- The project acknowledges its OpenHands base and documents the fork boundary.
- New value is concentrated in control-plane and product surfaces rather than vague rebranding.
- The runtime story includes local, container, and Kubernetes-oriented operation.
- Audit replay makes model output, commands, file changes, tool calls, and verification steps inspectable.
- The repository includes module maps, sync strategy docs, preview release notes, and public module contract tests.

## Best Technical Story

The strongest story is turning a coding Agent from a personal assistant into a team-governed execution system. The interesting work is the layer that wraps execution: plan, policy, runtime boundaries, tool registry, cost visibility, and replayable evidence.

## Tradeoffs To Explain

- The Python package still keeps `openhands/` during the migration window to reduce upstream-sync risk.
- The project should be described as a fork/deep customization, not as a from-scratch Agent runtime.
- Some enterprise capabilities are intentionally documented as staged roadmap work until their implementation is complete.

## Validation Path

```bash
poetry install
cd frontend && npm ci && npm run lint && npm run test && npm run build
cd .. && pytest tests/unit/forgepilot/test_public_module_contract.py
```

## Follow-Up Ideas

- Add a fork-differentiation checklist to each release.
- Add a compact demo script showing task creation, execution, verification, and audit replay.
- Keep the README focused on product evidence before long roadmap details.
