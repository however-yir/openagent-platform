export type MCPServerType = "sse" | "stdio" | "shttp";

export type MCPPermissionLevel = "read" | "write" | "execute" | "confirm";

export type MCPHealthStatus = "unknown" | "testing" | "healthy" | "unreachable";

export interface MCPServerConfig {
  id: string;
  type: MCPServerType;
  name?: string;
  url?: string;
  api_key?: string;
  timeout?: number;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPServerPreference {
  enabled: boolean;
  permission: MCPPermissionLevel;
  health: MCPHealthStatus;
  lastCheckedAt?: string;
  lastError?: string;
}

export type MCPServerPreferenceMap = Record<string, MCPServerPreference>;

export const DEFAULT_MCP_SERVER_PREFERENCE: MCPServerPreference = {
  enabled: true,
  permission: "read",
  health: "unknown",
};
