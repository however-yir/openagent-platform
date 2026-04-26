import { FaPencil, FaTrash } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  MCPHealthStatus,
  MCPPermissionLevel,
  MCPServerConfig,
  MCPServerPreference,
} from "./types";

const HEALTH_LABELS: Record<MCPHealthStatus, string> = {
  unknown: "未检测",
  testing: "检测中",
  healthy: "健康",
  unreachable: "不可达",
};

const HEALTH_STYLES: Record<MCPHealthStatus, string> = {
  unknown: "border-[#334155] bg-[#0f172a]/50 text-[#cbd5e1]",
  testing: "border-[#a16207] bg-[#451a03]/30 text-[#fcd34d]",
  healthy: "border-[#166534] bg-[#052e16]/40 text-[#86efac]",
  unreachable: "border-[#991b1b] bg-[#450a0a]/40 text-[#fca5a5]",
};

const PERMISSION_OPTIONS: Array<{
  value: MCPPermissionLevel;
  label: string;
}> = [
  { value: "read", label: "只读" },
  { value: "write", label: "可写" },
  { value: "execute", label: "可执行" },
  { value: "confirm", label: "需确认" },
];

export function MCPServerListItem({
  server,
  preference,
  onEdit,
  onDelete,
  onToggleEnabled,
  onChangePermission,
  onTestConnection,
}: {
  server: MCPServerConfig;
  preference: MCPServerPreference;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onChangePermission: (permission: MCPPermissionLevel) => void;
  onTestConnection: () => void;
}) {
  const { t } = useTranslation();

  const getServerTypeLabel = (type: string) => {
    switch (type) {
      case "sse":
        return t(I18nKey.SETTINGS$MCP_SERVER_TYPE_SSE);
      case "stdio":
        return t(I18nKey.SETTINGS$MCP_SERVER_TYPE_STDIO);
      case "shttp":
        return t(I18nKey.SETTINGS$MCP_SERVER_TYPE_SHTTP);
      default:
        return type.toUpperCase();
    }
  };

  const getServerDescription = (serverConfig: MCPServerConfig) => {
    if (serverConfig.type === "stdio") {
      if (serverConfig.command) {
        const args =
          serverConfig.args && serverConfig.args.length > 0
            ? ` ${serverConfig.args.join(" ")}`
            : "";
        return `${serverConfig.command}${args}`;
      }
      return serverConfig.name || "";
    }
    if (
      (serverConfig.type === "sse" || serverConfig.type === "shttp") &&
      serverConfig.url
    ) {
      return serverConfig.url;
    }
    return "";
  };

  const serverName = server.type === "stdio" ? server.name : server.url;
  const serverDescription = getServerDescription(server);
  const isTesting = preference.health === "testing";

  return (
    <tr
      data-testid="mcp-server-item"
      className="grid grid-cols-[minmax(0,0.22fr)_120px_minmax(0,1fr)_320px] gap-4 items-start border-t border-tertiary"
    >
      <td
        className="p-3 text-sm text-content-2 truncate min-w-0"
        title={serverName}
      >
        {serverName}
      </td>

      <td className="p-3 text-sm text-content-2 whitespace-nowrap">
        {getServerTypeLabel(server.type)}
      </td>

      <td
        className="p-3 text-sm text-content-2 opacity-80 italic min-w-0 truncate"
        title={serverDescription}
      >
        <span className="inline-block max-w-full align-bottom">
          {serverDescription}
        </span>
      </td>

      <td className="p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-end gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${HEALTH_STYLES[preference.health]}`}
            >
              {HEALTH_LABELS[preference.health]}
            </span>
            {preference.lastCheckedAt && (
              <span className="text-[11px] text-content-3">
                {new Date(preference.lastCheckedAt).toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-content-2">
              <input
                type="checkbox"
                checked={preference.enabled}
                onChange={(event) => onToggleEnabled(event.target.checked)}
              />
              启用
            </label>

            <select
              className="rounded border border-tertiary bg-base p-1 text-xs text-content-2"
              value={preference.permission}
              onChange={(event) =>
                onChangePermission(event.target.value as MCPPermissionLevel)
              }
            >
              {PERMISSION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onTestConnection}
              disabled={isTesting}
              className="rounded border border-tertiary px-2 py-1 text-xs hover:border-content-2 disabled:opacity-60"
            >
              {isTesting ? "检测中..." : "测试连接"}
            </button>
          </div>

          {preference.lastError && (
            <p className="text-right text-[11px] text-[#fca5a5]">
              {preference.lastError}
            </p>
          )}

          <div className="flex items-start justify-end gap-4 whitespace-nowrap">
            <button
              data-testid="edit-mcp-server-button"
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${serverName}`}
              className="cursor-pointer hover:text-content-1 transition-colors"
            >
              <FaPencil size={16} />
            </button>
            <button
              data-testid="delete-mcp-server-button"
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${serverName}`}
              className="cursor-pointer hover:text-content-1 transition-colors"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
