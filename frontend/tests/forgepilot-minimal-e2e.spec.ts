import test, { expect } from "@playwright/test";

const webClientConfig = {
  app_mode: "oss",
  posthog_client_key: null,
  feature_flags: {
    enable_billing: false,
    hide_llm_settings: false,
    enable_jira: false,
    enable_jira_dc: false,
    enable_linear: false,
    hide_users_page: true,
    hide_billing_page: true,
    hide_integrations_page: false,
  },
  providers_configured: [],
  maintenance_start_time: null,
  auth_url: null,
  recaptcha_site_key: null,
  faulty_models: [],
  error_message: null,
  updated_at: new Date().toISOString(),
  github_app_slug: null,
} as const;

const settingsPayload = {
  llm_model: "openai/gpt-4.1",
  llm_base_url: "",
  agent: "CodeActAgent",
  language: "zh-CN",
  llm_api_key: null,
  llm_api_key_set: false,
  search_api_key_set: false,
  confirmation_mode: false,
  security_analyzer: "llm",
  remote_runtime_resource_factor: 1,
  provider_tokens_set: {},
  enable_default_condenser: true,
  condenser_max_size: 240,
  enable_sound_notifications: false,
  user_consents_to_analytics: false,
  enable_proactive_conversation_starters: false,
  enable_solvability_analysis: false,
  search_api_key: "",
  is_new_user: false,
  disabled_skills: [],
  max_budget_per_task: null,
  email: "",
  email_verified: true,
  mcp_config: {
    sse_servers: ["https://mcp.example.com/sse"],
    stdio_servers: [],
    shttp_servers: [],
  },
  git_user_name: "forgepilot-bot",
  git_user_email: "dev@forgepilot.local",
  v1_enabled: true,
  sandbox_grouping_strategy: "NO_GROUPING",
} as const;

test("forgepilot minimal e2e: task console, protocol badges and mcp registry controls", async ({
  page,
}) => {
  await page.route("**/api/v1/web-client/config", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(webClientConfig),
    });
  });

  await page.route("**/api/settings", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settingsPayload),
      });
      return;
    }

    await route.continue();
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "任务台" })).toBeVisible();
  await expect(page.getByTestId("workflow-badge-plan")).toBeVisible();
  await expect(page.getByTestId("workflow-badge-execute")).toBeVisible();
  await expect(page.getByTestId("workflow-badge-verify")).toBeVisible();
  await expect(page.getByTestId("workflow-badge-report")).toBeVisible();
  await expect(page.getByTestId("task-filter-failed")).toBeVisible();
  await expect(page.getByTestId("stage-toggle-plan")).toBeVisible();
  await expect(page.getByTestId("stage-toggle-execute")).toBeVisible();

  await page.getByTestId("task-filter-failed").click();
  await expect(page.getByText("重构运行时配置加载")).toBeVisible();
  await expect(
    page.getByText("修复前端 eslint 升级后的类型告警"),
  ).not.toBeVisible();
  await page.getByTestId("task-filter-failed").click();

  await page.getByLabel("任务编排").click();
  await expect(page.getByRole("heading", { name: "任务编排" })).toBeVisible();

  await page.getByLabel("运行时").click();
  await expect(page.getByRole("heading", { name: "运行时" })).toBeVisible();

  await page.getByLabel("工具中心").click();
  await expect(page.getByRole("heading", { name: "工具中心" })).toBeVisible();
  await expect(
    page.getByTestId("tool-call-card-tool-call-github-checks"),
  ).toBeVisible();

  await page.getByLabel("审计回放").click();
  await expect(page.getByRole("heading", { name: "审计回放" })).toBeVisible();

  await page.getByLabel("成果交付").click();
  await expect(page.getByRole("heading", { name: "成果交付" })).toBeVisible();

  await page.goto("/settings/mcp");
  await expect(page.getByRole("heading", { name: "MCP" })).toBeVisible();
  await expect(page.getByTestId("add-mcp-server-button")).toBeVisible();
});
