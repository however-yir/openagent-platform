# 本地模型、Ollama 与 OpenAI-compatible Gateway 启动指引

> 目标：让 ForgePilot Preview 可以在本地模型、Ollama 或私有 OpenAI-compatible gateway 下跑通“创建任务 -> 执行命令 -> 修改代码 -> 验证测试 -> 审计回放”的演示闭环。

## 方案选择

| 方案 | 推荐场景 | 配置重点 |
| --- | --- | --- |
| Ollama 本地模型 | 单机演示、离线 PoC、低成本验证 | `OLLAMA_BASE_URL`、`LLM_BASE_URL=http://127.0.0.1:11434/v1`、模型名 |
| LiteLLM Gateway | 团队统一转发多个云模型或本地模型 | gateway endpoint、provider keys、fallback 策略 |
| 私有 OpenAI-compatible Gateway | 企业已有模型网关、内网代理、审计代理 | `LLM_BASE_URL`、`LLM_API_KEY`、模型前缀 |
| 云端 OpenAI-compatible Provider | Preview 快速演示 | API key、base_url、成本阈值 |

## Ollama 本地启动

1. 启动 Ollama：

```bash
ollama serve
```

2. 拉取模型：

```bash
ollama pull qwen2.5-coder:14b
```

3. 配置 `.env.local`：

```bash
cp .env.local.example .env.local
```

建议值：

```dotenv
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://127.0.0.1:11434/v1
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5-coder:14b
```

4. 配置 `config.toml` 或等价配置：

```toml
[llm]
model = "ollama/qwen2.5-coder:14b"
base_url = "http://127.0.0.1:11434/v1"
api_key = "ollama"
```

5. 启动 ForgePilot：

```bash
docker compose up -d --build
```

如果容器内需要访问宿主机 Ollama，使用：

```dotenv
LLM_BASE_URL=http://host.docker.internal:11434/v1
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

## LiteLLM Gateway 启动

1. 准备 gateway 配置，例如 `litellm-config.yaml`：

```yaml
model_list:
  - model_name: forgepilot-coder
    litellm_params:
      model: openai/gpt-4.1-mini
      api_key: os.environ/OPENAI_API_KEY
  - model_name: local-qwen
    litellm_params:
      model: ollama/qwen2.5-coder:14b
      api_base: http://host.docker.internal:11434
```

2. 启动 LiteLLM：

```bash
docker run --rm -p 4000:4000 \
  -v "$PWD/litellm-config.yaml:/app/config.yaml" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  ghcr.io/berriai/litellm:main-latest \
  --config /app/config.yaml --port 4000
```

3. 配置 ForgePilot：

```dotenv
LLM_MODEL=litellm/forgepilot-coder
LLM_BASE_URL=http://127.0.0.1:4000/v1
LLM_API_KEY=replace_with_gateway_key_if_enabled
```

## 私有 OpenAI-compatible Gateway

如果团队已有统一模型网关，只需要保证其兼容 OpenAI Chat Completions 或 Responses 风格接口，并在 ForgePilot 中配置：

```dotenv
LLM_MODEL=forgepilot/company-coder
LLM_BASE_URL=https://llm-gateway.example.com/v1
LLM_API_KEY=replace_with_private_gateway_key
MAX_BUDGET_PER_TASK=10
```

建议网关侧提供：

- 请求 trace id 透传。
- usage/cost 返回。
- 模型 allowlist。
- 租户或 teamspace 维度限流。
- 审计日志导出。
- 工具调用与模型调用的统一账单口径。

## 成本阈值

ForgePilot 支持将单任务预算作为执行策略的一部分。推荐在演示环境设置较低阈值，防止长任务误跑：

```bash
poetry run python -m openhands.core.main \
  --max-budget-per-task 2 \
  --llm-model "$LLM_MODEL" \
  --llm-base-url "$LLM_BASE_URL"
```

前端任务台和会话 metrics 会展示 accumulated cost 与 max budget per task，后续应将其归集到 `teamspace` 维度。

## Demo GIF 录制脚本

演示路径：

1. 打开任务台。
2. 创建任务，填写目标、验收标准和变更边界。
3. 让 Agent 执行一条安全命令，例如 `pytest tests/unit/forgepilot -q`。
4. 展示代码修改或文档修改 diff。
5. 运行验证命令。
6. 打开审计回放，展示 model、command、file_change、verification 和 report 时间线。

推荐录制命令：

```bash
# 1. 启动前端 mock 演示
npm --prefix frontend run dev:mock -- --host 127.0.0.1 --port 5173

# 2. 用浏览器录屏工具录制以下路径
open http://127.0.0.1:5173/
open http://127.0.0.1:5173/audit
open http://127.0.0.1:5173/settings
```

导出文件建议放在：

```text
docs/assets/forgepilot-preview-demo.gif
```

README 首屏可在 GIF 准备好后补充：

```markdown
![ForgePilot Preview Demo](docs/assets/forgepilot-preview-demo.gif)
```

## Preview release 发布说明模板

```markdown
# ForgePilot Studio Preview

ForgePilot Studio Preview 是一个基于 OpenHands 深改的 AI 工程执行平台。它继承 OpenHands 的 Agent 与 runtime 基础，并新增面向研发团队的控制平面、任务台、团队权限、审计回放、成本阈值、MCP 工具治理和私有化部署配置。

## Preview highlights

- Task Console: 任务队列、执行阶段、失败过滤和预算指标。
- Control Plane: Plan -> Execute -> Verify -> Report 任务协议。
- Audit Replay: 模型响应、命令、文件修改、工具调用和验证结果时间线。
- Tool Registry: MCP/HTTP/shell 工具的权限、mock、schema 和调用记录。
- Teamspace: owner/admin/member/viewer 权限矩阵。
- LLM Gateway: OpenAI、Ollama、LiteLLM、私有 OpenAI-compatible gateway 统一入口。
- Runtime Provider: local、Docker、Kubernetes、remote runtime 抽象。

## Based on OpenHands

This preview is deeply customized from OpenHands. ForgePilot keeps the proven Agent/runtime foundation and adds team-oriented governance, auditability, deployment configuration, and product workflows.
```
