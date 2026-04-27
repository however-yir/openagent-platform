# ForgePilot 兼容矩阵

更新时间：2026-04-27

| 组件 | 当前基线版本 | 兼容范围 | 说明 |
| --- | --- | --- | --- |
| ForgePilot Studio 后端（Python） | `1.6.0` | `>=1.6,<2.0` | 以 `pyproject.toml` 版本为准。 |
| 前端（frontend） | `package.json` 当前版本 | 与后端 `1.6.x` 对齐 | 前后端需同一发布批次。 |
| Python 运行时 | `3.12` | `>=3.12,<3.14` | 由 `pyproject.toml` 约束。 |
| Node.js | `22` | `22.x` | 与 ForgePilot CI 保持一致。 |
| Docker Engine | `24+` | `24.x~26.x` | 本地/CI 构建与运行时建议版本。 |
| PostgreSQL | `15` | `14~16` | 团队空间与审计数据建议 `15`。 |
| Redis | `7` | `6.2~7.x` | 用于会话与缓存。 |
| LLM Gateway（LiteLLM） | `>=1.74.3` | `1.74.x~1.x` | 需避开已知问题版本。 |
| OpenAI SDK | `2.8.0` | `2.8.x` | 与当前 LiteLLM 组合验证通过。 |
| Sandbox Runtime（agent-server） | `1.16.1` | `1.16.x` | 与 `openhands-agent-server` 依赖版本一致。 |

## 维护要求

1. 每次发布必须更新本矩阵中的“当前基线版本”与“兼容范围”。
2. 若出现不兼容改动，需在 `CHANGELOG.md` 和迁移说明中同步标注。
3. 发布前执行 `scripts/forgepilot-release-check.sh`，确保发布文档完整。
