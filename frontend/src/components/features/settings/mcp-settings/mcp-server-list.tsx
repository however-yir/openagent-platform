import { useTranslation } from "react-i18next";
import { MCPServerListItem } from "./mcp-server-list-item";
import { I18nKey } from "#/i18n/declaration";
import {
  MCPPermissionLevel,
  MCPServerConfig,
  MCPServerPreference,
} from "./types";

interface MCPServerListProps {
  servers: MCPServerConfig[];
  getPreference: (server: MCPServerConfig) => MCPServerPreference;
  onEdit: (server: MCPServerConfig) => void;
  onDelete: (serverId: string) => void;
  onToggleEnabled: (server: MCPServerConfig, enabled: boolean) => void;
  onChangePermission: (
    server: MCPServerConfig,
    permission: MCPPermissionLevel,
  ) => void;
  onTestConnection: (server: MCPServerConfig) => void;
}

export function MCPServerList({
  servers,
  getPreference,
  onEdit,
  onDelete,
  onToggleEnabled,
  onChangePermission,
  onTestConnection,
}: MCPServerListProps) {
  const { t } = useTranslation();

  if (servers.length === 0) {
    return (
      <div className="border border-tertiary rounded-md p-8 text-center">
        <p className="text-content-2 text-sm">
          {t(I18nKey.SETTINGS$MCP_NO_SERVERS)}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-tertiary rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-base-tertiary">
          <tr className="grid grid-cols-[minmax(0,0.22fr)_120px_minmax(0,1fr)_320px] gap-4 items-start">
            <th className="text-left p-3 text-sm font-medium">
              {t(I18nKey.SETTINGS$NAME)}
            </th>
            <th className="text-left p-3 text-sm font-medium">
              {t(I18nKey.SETTINGS$MCP_SERVER_TYPE)}
            </th>
            <th className="text-left p-3 text-sm font-medium">
              {t(I18nKey.SETTINGS$MCP_SERVER_DETAILS)}
            </th>
            <th className="text-right p-3 text-sm font-medium">
              {t(I18nKey.SETTINGS$MCP_REGISTRY_COLUMN)}
            </th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server) => (
            <MCPServerListItem
              key={server.id}
              server={server}
              preference={getPreference(server)}
              onEdit={() => onEdit(server)}
              onDelete={() => onDelete(server.id)}
              onToggleEnabled={(enabled) => onToggleEnabled(server, enabled)}
              onChangePermission={(permission) =>
                onChangePermission(server, permission)
              }
              onTestConnection={() => onTestConnection(server)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
