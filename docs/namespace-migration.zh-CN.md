# OpenHands 到 ForgePilot 命名空间迁移计划

## 原则

1. 先迁移对外品牌，再迁移前端组件名，再迁移 API 和环境变量，最后迁移底层 Python 包名。
2. 任何包名或路径级 rename 都必须配套自动化检查、回滚补丁和最小回归测试。
3. 对外兼容期至少保留一个小版本，旧 key 和旧环境变量只做 fallback，不作为主文档入口。

## 阶段

### Phase 1：展示层

- README、Logo、favicon、manifest、social preview。
- 前端可见文案和默认 bot 信息。
- UI package metadata：`@forgepilot/ui`。

### Phase 2：前端代码层

- `OpenHandsLogo` -> `ForgePilotLogo`。
- `BRANDING$OPENHANDS` -> `BRANDING$FORGEPILOT`，旧 key 保留兼容。
- 路由和导航改成任务台、工具中心、审计回放等 ForgePilot 信息架构。

### Phase 3：配置与 API

- `OPENHANDS_IMAGE_NAME` -> `FORGEPILOT_IMAGE_NAME`。
- `OPENHANDS_CONTAINER_NAME` -> `FORGEPILOT_CONTAINER_NAME`。
- HTTP header、cookie、local storage key 逐步加 ForgePilot 前缀。
- 旧变量保留 fallback 并输出迁移提示。

### Phase 4：后端包名

- 设计 `forgepilot` 包，并从 `openhands` 逐步 re-export。
- 给 imports、tests、entrypoints 建立 rename 白名单。
- 每批迁移后执行 unit、frontend build、最小 E2E。

## 检查命令

```bash
./scripts/forgepilot-rename-audit.sh
npm --prefix frontend run typecheck
npm --prefix frontend run build
python -m compileall openhands enterprise third_party
```
