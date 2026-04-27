/* eslint-disable i18next/no-literal-string */

import { useMemo, useState } from "react";

type WizardSectionKey = "model" | "database" | "sandbox" | "workspace";

interface WizardState {
  modelProvider: string;
  modelBaseUrl: string;
  modelName: string;
  dbHost: string;
  dbName: string;
  dbUser: string;
  sandboxMode: "docker" | "kubernetes" | "local";
  runtimeNetworkPolicy: "deny" | "review" | "allow";
  workspaceRoot: string;
  workspaceEditablePath: string;
  sectionsDone: Record<WizardSectionKey, boolean>;
}

const STORAGE_KEY = "forgepilot_deployment_wizard_state";
const COMPLETED_KEY = "forgepilot_deployment_wizard_completed";

const defaultWizardState: WizardState = {
  modelProvider: "OpenAI Compatible",
  modelBaseUrl: "https://api.openai.com/v1",
  modelName: "gpt-4.1",
  dbHost: "postgres.forgepilot.local:5432",
  dbName: "forgepilot",
  dbUser: "forgepilot_app",
  sandboxMode: "docker",
  runtimeNetworkPolicy: "review",
  workspaceRoot: "/srv/forgepilot/workspace",
  workspaceEditablePath: "frontend/**,openhands/**,tests/**",
  sectionsDone: {
    model: false,
    database: false,
    sandbox: false,
    workspace: false,
  },
};

function loadWizardState(): WizardState {
  if (typeof window === "undefined") {
    return defaultWizardState;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultWizardState;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return {
      ...defaultWizardState,
      ...parsed,
      sectionsDone: {
        ...defaultWizardState.sectionsDone,
        ...(parsed.sectionsDone ?? {}),
      },
    };
  } catch {
    return defaultWizardState;
  }
}

function saveWizardState(state: WizardState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatConfigSummary(state: WizardState) {
  return [
    "forgepilot:",
    "  model:",
    `    provider: ${state.modelProvider}`,
    `    base_url: ${state.modelBaseUrl}`,
    `    name: ${state.modelName}`,
    "  database:",
    `    host: ${state.dbHost}`,
    `    name: ${state.dbName}`,
    `    user: ${state.dbUser}`,
    "  runtime:",
    `    sandbox: ${state.sandboxMode}`,
    `    network_policy: ${state.runtimeNetworkPolicy}`,
    "  workspace:",
    `    root: ${state.workspaceRoot}`,
    `    editable_scope: ${state.workspaceEditablePath}`,
  ].join("\n");
}

function SectionCard({
  title,
  detail,
  done,
  onToggleDone,
  children,
}: {
  title: string;
  detail: string;
  done: boolean;
  onToggleDone: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-white/10 bg-[#12191b] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#aebbc0]">{detail}</p>
        </div>
        <button
          type="button"
          onClick={onToggleDone}
          className={`rounded-md border px-3 py-1 text-xs ${
            done
              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
              : "border-white/15 bg-white/[0.03] text-[#c8d5da]"
          }`}
        >
          {done ? "已完成" : "标记完成"}
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm text-[#dce7eb]">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-white/15 bg-[#0d1315] px-3 text-sm text-white outline-none focus:border-[#2dd4bf]/60"
      />
    </label>
  );
}

export default function DeploymentWizardRoute() {
  const [state, setState] = useState<WizardState>(loadWizardState);
  const [copied, setCopied] = useState(false);

  const completedCount = useMemo(
    () => Object.values(state.sectionsDone).filter(Boolean).length,
    [state.sectionsDone],
  );

  const updateState = (updater: (current: WizardState) => WizardState) => {
    setState((current) => {
      const next = updater(current);
      saveWizardState(next);
      return next;
    });
  };

  const setSectionDone = (section: WizardSectionKey) => {
    updateState((current) => {
      const nextDone = !current.sectionsDone[section];
      const next = {
        ...current,
        sectionsDone: {
          ...current.sectionsDone,
          [section]: nextDone,
        },
      };
      const allDone = Object.values(next.sectionsDone).every(Boolean);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          COMPLETED_KEY,
          allDone ? "done" : "pending",
        );
      }
      return next;
    });
  };

  const summary = useMemo(() => formatConfigSummary(state), [state]);

  const copySummary = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <main className="min-h-full overflow-y-auto bg-[#101417] px-5 py-6 text-content md:px-8">
      <header className="rounded-md border border-white/10 bg-[#12191b] p-5">
        <p className="text-xs uppercase tracking-normal text-[#9cf0e2]">
          Private Deployment Wizard
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">
          私有化部署向导
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-[#aebbc0]">
          首次启动建议先完成模型、数据库、沙箱和工作区四段配置。完成后可直接复制配置摘要，落地到
          `.env` 或 Helm values。
        </p>
        <div className="mt-4 inline-flex rounded-md border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 px-3 py-1 text-xs text-[#dffdf7]">
          完成进度：{completedCount}/4
        </div>
      </header>

      <div className="mt-5 grid gap-4">
        <SectionCard
          title="1) 模型网关"
          detail="配置 provider、base_url 和默认模型，确保任务编排与验证链路可用。"
          done={state.sectionsDone.model}
          onToggleDone={() => setSectionDone("model")}
        >
          <LabeledInput
            label="Provider"
            value={state.modelProvider}
            onChange={(value) =>
              updateState((current) => ({ ...current, modelProvider: value }))
            }
          />
          <LabeledInput
            label="Base URL"
            value={state.modelBaseUrl}
            onChange={(value) =>
              updateState((current) => ({ ...current, modelBaseUrl: value }))
            }
          />
          <LabeledInput
            label="Default Model"
            value={state.modelName}
            onChange={(value) =>
              updateState((current) => ({ ...current, modelName: value }))
            }
          />
        </SectionCard>

        <SectionCard
          title="2) 数据库"
          detail="推荐 PostgreSQL，确保审计回放、任务状态和成本数据可持久化。"
          done={state.sectionsDone.database}
          onToggleDone={() => setSectionDone("database")}
        >
          <LabeledInput
            label="Host"
            value={state.dbHost}
            onChange={(value) =>
              updateState((current) => ({ ...current, dbHost: value }))
            }
          />
          <LabeledInput
            label="Database"
            value={state.dbName}
            onChange={(value) =>
              updateState((current) => ({ ...current, dbName: value }))
            }
          />
          <LabeledInput
            label="User"
            value={state.dbUser}
            onChange={(value) =>
              updateState((current) => ({ ...current, dbUser: value }))
            }
          />
        </SectionCard>

        <SectionCard
          title="3) 沙箱运行时"
          detail="选择 Docker / Kubernetes / Local，并确定网络策略。"
          done={state.sectionsDone.sandbox}
          onToggleDone={() => setSectionDone("sandbox")}
        >
          <label className="grid gap-1 text-sm text-[#dce7eb]">
            <span>Sandbox</span>
            <select
              value={state.sandboxMode}
              onChange={(event) =>
                updateState((current) => ({
                  ...current,
                  sandboxMode: event.target.value as WizardState["sandboxMode"],
                }))
              }
              className="h-10 rounded-md border border-white/15 bg-[#0d1315] px-3 text-sm text-white outline-none focus:border-[#2dd4bf]/60"
            >
              <option value="docker">docker</option>
              <option value="kubernetes">kubernetes</option>
              <option value="local">local</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm text-[#dce7eb]">
            <span>Network Policy</span>
            <select
              value={state.runtimeNetworkPolicy}
              onChange={(event) =>
                updateState((current) => ({
                  ...current,
                  runtimeNetworkPolicy: event.target
                    .value as WizardState["runtimeNetworkPolicy"],
                }))
              }
              className="h-10 rounded-md border border-white/15 bg-[#0d1315] px-3 text-sm text-white outline-none focus:border-[#2dd4bf]/60"
            >
              <option value="deny">deny</option>
              <option value="review">review</option>
              <option value="allow">allow</option>
            </select>
          </label>
        </SectionCard>

        <SectionCard
          title="4) 工作区"
          detail="定义工作区根目录和可写范围，避免越界修改。"
          done={state.sectionsDone.workspace}
          onToggleDone={() => setSectionDone("workspace")}
        >
          <LabeledInput
            label="Workspace Root"
            value={state.workspaceRoot}
            onChange={(value) =>
              updateState((current) => ({ ...current, workspaceRoot: value }))
            }
          />
          <LabeledInput
            label="Editable Scope"
            value={state.workspaceEditablePath}
            onChange={(value) =>
              updateState((current) => ({
                ...current,
                workspaceEditablePath: value,
              }))
            }
          />
        </SectionCard>
      </div>

      <section className="mt-5 rounded-md border border-white/10 bg-[#12191b] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">配置摘要</h2>
          <button
            type="button"
            onClick={copySummary}
            className="rounded-md border border-white/20 bg-white/[0.04] px-3 py-1 text-xs text-[#dce7eb] hover:bg-white/[0.1]"
          >
            {copied ? "已复制" : "复制摘要"}
          </button>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md bg-[#0b1012] p-3 text-xs text-[#b8c3c7]">
          {summary}
        </pre>
      </section>
    </main>
  );
}
