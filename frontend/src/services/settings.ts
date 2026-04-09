import { Settings } from "#/types/settings";

export const LATEST_SETTINGS_VERSION = 5;

const readEnvString = (
  value: string | undefined,
  fallback: string,
): string => {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const DEFAULT_LANGUAGE = readEnvString(
  import.meta.env.VITE_DEFAULT_LANGUAGE,
  "zh-CN",
);
const DEFAULT_MODEL = readEnvString(
  import.meta.env.VITE_DEFAULT_LLM_MODEL,
  "openhands/claude-opus-4-5-20251101",
);
const DEFAULT_LLM_BASE_URL = readEnvString(
  import.meta.env.VITE_DEFAULT_LLM_BASE_URL,
  "",
);
const DEFAULT_GIT_USER_NAME = readEnvString(
  import.meta.env.VITE_DEFAULT_GIT_USER_NAME,
  "openagent-bot",
);
const DEFAULT_GIT_USER_EMAIL = readEnvString(
  import.meta.env.VITE_DEFAULT_GIT_USER_EMAIL,
  "dev@openagent.local",
);

export const DEFAULT_SETTINGS: Settings = {
  llm_model: DEFAULT_MODEL,
  llm_base_url: DEFAULT_LLM_BASE_URL,
  agent: "CodeActAgent",
  language: DEFAULT_LANGUAGE,
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
  is_new_user: true,
  disabled_skills: [],
  max_budget_per_task: null,
  email: "",
  email_verified: true, // Default to true to avoid restricting access unnecessarily
  mcp_config: {
    sse_servers: [],
    stdio_servers: [],
    shttp_servers: [],
  },
  git_user_name: DEFAULT_GIT_USER_NAME,
  git_user_email: DEFAULT_GIT_USER_EMAIL,
  v1_enabled: true,
  sandbox_grouping_strategy: "NO_GROUPING",
};

/**
 * Get the default settings
 */
export const getDefaultSettings = (): Settings => DEFAULT_SETTINGS;
