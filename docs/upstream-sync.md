# 上游同步策略

> 目标：说明 ForgePilot 如何持续吸收 OpenHands 上游能力，同时保护 ForgePilot 自研控制平面、任务台、权限、审计和私有化配置不被覆盖。

## 同步原则

ForgePilot 不是一次性 fork 后封闭演进。同步策略是“底座跟进、平台层隔离、产品层自主”：

- 底座跟进：Agent controller、runtime、LLM/MCP 基础能力、安全修复和依赖升级优先从 OpenHands 上游同步。
- 平台层隔离：ForgePilot 自研模块集中在 `openhands/forgepilot/*`、ForgePilot 前端路由、配置模板和发布文档中。
- 产品层自主：任务台、工具中心、审计回放、成本预算、teamspace、私有化向导等体验按 ForgePilot 路线独立推进。
- 冲突可解释：每次同步必须能说明哪些变更来自上游，哪些变更属于 ForgePilot 深改。

## 分支建议

| 分支 | 用途 |
| --- | --- |
| `main` | ForgePilot 主开发分支，保持可发布。 |
| `upstream/openhands` | 跟踪 OpenHands 上游干净镜像，不直接开发。 |
| `sync/openhands-YYYYMMDD` | 每轮上游同步工作分支。 |
| `release/preview-*` | Preview release 稳定分支，只接受阻断修复。 |

如果仓库当前没有配置上游 remote，建议执行：

```bash
git remote add upstream https://github.com/OpenHands/OpenHands.git
git fetch upstream
git branch upstream/openhands upstream/main
```

## 同步流程

1. 记录当前 ForgePilot 状态：

```bash
git status --short
scripts/forgepilot-release-check.sh
```

2. 获取上游：

```bash
git fetch upstream
git checkout -b sync/openhands-YYYYMMDD main
git merge --no-ff upstream/main
```

3. 优先处理底座冲突：

- `openhands/controller/`
- `openhands/runtime/`
- `openhands/llm/`
- `openhands/mcp/`
- `openhands/server/`
- `pyproject.toml`、`poetry.lock`
- `frontend/package.json`、`frontend/package-lock.json`

4. 保护 ForgePilot 深改区域：

- `openhands/forgepilot/`
- `frontend/src/components/features/forgepilot/`
- `frontend/src/routes/task-console.tsx`
- `frontend/src/routes/audit.tsx`
- `frontend/src/routes/tools.tsx`
- `frontend/src/routes/runtimes.tsx`
- `frontend/src/routes/team.tsx`
- `.env.fork.example`
- `.env.local.example`
- `docs/adr/`
- `docs/fork-differentiation.md`
- `docs/upstream-sync.md`

5. 运行验证：

```bash
python -m pytest tests/unit/forgepilot -q
python -m pytest tests/unit/core/config/test_forgepilot_execution_config.py -q
npm --prefix frontend run typecheck
```

6. 写同步记录：

- 上游基准 commit。
- 合入范围。
- 冲突文件。
- ForgePilot 保留策略。
- 回归命令与结果。

## 为什么保留 `openhands/` 包名

保留 `openhands/` 包名是迁移期的兼容策略：

1. OpenHands 上游大量导入路径以 `openhands.*` 为入口，立即 rename 会让同步成本指数级上升。
2. Docker entrypoint、runtime 构建、测试夹具、CLI、配置加载和文档链接仍依赖旧命名。
3. ForgePilot 当前差异化重点在控制平面、任务台、权限、审计、工具治理和私有化配置，不在一次性 rename。
4. 先保留包名可以让上游安全修复、runtime 修复、MCP 修复更容易合入。

这不是长期品牌策略。ForgePilot 会把新增能力放在 `openhands/forgepilot/*` 下形成稳定边界，再做命名空间迁移。

## 命名空间迁移计划

详见 `docs/namespace-migration.zh-CN.md`。简化路线如下：

| 阶段 | 目标 | 兼容策略 |
| --- | --- | --- |
| 展示层 | README、Logo、favicon、GitHub profile、前端文案使用 ForgePilot | 不影响导入路径。 |
| 前端代码层 | `OpenHandsLogo`、i18n key、路由信息架构迁移到 ForgePilot | 旧 key 保留一个小版本。 |
| 配置与 API | 新增 `FORGEPILOT_*` 环境变量、header、cookie、local storage key | `OPENHANDS_*` 继续 fallback 并输出迁移提示。 |
| 后端包名 | 新增 `forgepilot` 包并从 `openhands` re-export | 分批迁移 imports，保留兼容层和回滚补丁。 |

## 冲突处理规则

### OpenHands 底座文件

默认优先上游，但需要检查 ForgePilot 是否在同一文件加入了品牌默认值、预算传递、配置 fallback 或日志别名。如果有，保留 ForgePilot 行为，并把差异写入同步记录。

### ForgePilot 专属文件

默认保留 ForgePilot。上游如果新增类似能力，需要评估是否替换底层实现，但不要直接删除 ForgePilot 的产品 API、文档和测试。

### 前端共享组件

优先保留上游 bugfix 和依赖升级；涉及默认入口、侧边栏、任务台、审计页、工具中心、部署向导的冲突，按 ForgePilot 信息架构处理。

### 配置文件

不要删除 `FORGEPILOT_*` 变量。涉及 `OPENHANDS_*` 的上游新增项可以保留，但需要在模板中说明是否为兼容变量或底层运行时变量。

### 依赖锁文件

锁文件冲突以“能安装、能测试、能构建”为准，不手动拼接不确定版本。同步后必须运行 Python 单测和前端 typecheck。

## 每轮同步检查清单

- [ ] 上游 commit 与同步日期已记录。
- [ ] `openhands/forgepilot/*` 没有被误删。
- [ ] README 首屏仍明确 ForgePilot 定位。
- [ ] `docs/fork-differentiation.md` 仍能对应当前代码证据。
- [ ] `docs/upstream-sync.md` 已补充本轮特殊冲突。
- [ ] `python -m pytest tests/unit/forgepilot -q` 通过。
- [ ] ForgePilot 配置测试通过。
- [ ] 前端 typecheck 或 build 已执行，失败原因已记录。
- [ ] release note 明确“基于 OpenHands 深改”，不隐藏上游来源。

## Preview release 口径

Preview release 应使用以下表述：

> ForgePilot Studio Preview 是一个基于 OpenHands 深改的 AI 工程执行平台。它继承 OpenHands 的 Agent 与 runtime 基础，并新增面向研发团队的控制平面、任务台、团队权限、审计回放、成本阈值、MCP 工具治理和私有化部署配置。

避免使用“完全自研 Agent runtime”这类不准确表述。
