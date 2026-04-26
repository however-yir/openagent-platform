import {
  DEFAULT_MCP_SERVER_PREFERENCE,
  MCPHealthStatus,
  MCPPermissionLevel,
  MCPServerConfig,
  MCPServerPreferenceMap,
} from "./types";

const STORAGE_KEY = "forgepilot_mcp_registry_preferences_v1";

export function getMCPServerRegistryKey(server: MCPServerConfig): string {
  if (server.type === "stdio") {
    const stdioName = server.name || server.command || server.id;
    return `${server.type}:${stdioName}`;
  }

  return `${server.type}:${server.url || server.id}`;
}

export function loadMCPServerPreferences(): MCPServerPreferenceMap {
  if (typeof window === "undefined" || !window.localStorage) {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as MCPServerPreferenceMap;
    }
  } catch {
    // Fallback to empty preference map when malformed data exists.
  }
  return {};
}

export function saveMCPServerPreferences(preferences: MCPServerPreferenceMap) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export async function testMCPServerConnection(
  server: MCPServerConfig,
): Promise<{ health: MCPHealthStatus; error?: string }> {
  if (server.type === "stdio") {
    return {
      health: "unknown",
      error: "Stdio server needs runtime-side health probe.",
    };
  }

  if (!server.url) {
    return {
      health: "unreachable",
      error: "Missing server URL.",
    };
  }

  const timeoutMs = Math.min(
    Math.max((server.timeout || 8) * 1000, 1000),
    30000,
  );
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetch(server.url, {
      method: "GET",
      mode: "no-cors",
      signal: controller.signal,
    });
    return { health: "healthy" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network probe failed.";
    return { health: "unreachable", error: message };
  } finally {
    clearTimeout(timer);
  }
}

export function withDefaultPreference(
  preferences: MCPServerPreferenceMap,
  key: string,
) {
  return {
    ...DEFAULT_MCP_SERVER_PREFERENCE,
    ...(preferences[key] || {}),
  };
}

export function updateServerEnabled(
  preferences: MCPServerPreferenceMap,
  key: string,
  enabled: boolean,
): MCPServerPreferenceMap {
  const current = withDefaultPreference(preferences, key);
  return {
    ...preferences,
    [key]: { ...current, enabled },
  };
}

export function updateServerPermission(
  preferences: MCPServerPreferenceMap,
  key: string,
  permission: MCPPermissionLevel,
): MCPServerPreferenceMap {
  const current = withDefaultPreference(preferences, key);
  return {
    ...preferences,
    [key]: { ...current, permission },
  };
}

export function updateServerHealth(
  preferences: MCPServerPreferenceMap,
  key: string,
  health: MCPHealthStatus,
  error?: string,
): MCPServerPreferenceMap {
  const current = withDefaultPreference(preferences, key);
  return {
    ...preferences,
    [key]: {
      ...current,
      health,
      lastCheckedAt: new Date().toISOString(),
      lastError: error,
    },
  };
}
