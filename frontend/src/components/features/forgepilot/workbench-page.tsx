/* eslint-disable i18next/no-literal-string */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  TASK_STATE_STYLES,
  RISK_STYLES,
  workflowBadges,
  type WorkbenchPageConfig,
  type WorkflowStage,
} from "./workbench-data";

interface WorkbenchPageProps {
  config: WorkbenchPageConfig;
}

const STAGE_ORDER: WorkflowStage[] = ["plan", "execute", "verify", "report"];

const STAGE_LABELS: Record<WorkflowStage, string> = {
  plan: "Plan",
  execute: "Execute",
  verify: "Verify",
  report: "Report",
};

function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium uppercase tracking-normal ${className}`}
    >
      {label}
    </span>
  );
}

export function WorkbenchPage({ config }: WorkbenchPageProps) {
  const { t } = useTranslation();
  const PageIcon = config.icon;
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState<WorkflowStage[]>([]);
  const [showOnboardingNotice, setShowOnboardingNotice] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [demoTaskStarted, setDemoTaskStarted] = useState(false);
  const [verifyStarted, setVerifyStarted] = useState(false);

  const isTaskConsole = config.title === "任务台";
  const isAuditReplay = config.title === "审计回放";

  useEffect(() => {
    if (!config.onboardingNotice || typeof window === "undefined") {
      setShowOnboardingNotice(false);
      return;
    }
    const completed =
      window.localStorage.getItem(config.onboardingNotice.storageKey) ===
      "done";
    setShowOnboardingNotice(!completed);
  }, [config.onboardingNotice]);

  const filteredItems = useMemo(
    () =>
      config.primaryItems.filter((item) =>
        showFailedOnly ? item.failed : true,
      ),
    [config.primaryItems, showFailedOnly],
  );

  const groupedItems = useMemo(
    () =>
      filteredItems.reduce<Record<WorkflowStage, typeof filteredItems>>(
        (groups, item) => {
          const stage = item.stage ?? "execute";
          groups[stage].push(item);
          return groups;
        },
        {
          plan: [],
          execute: [],
          verify: [],
          report: [],
        },
      ),
    [filteredItems],
  );

  const toggleStageCollapse = (stage: WorkflowStage) => {
    setCollapsedStages((previous) =>
      previous.includes(stage)
        ? previous.filter((value) => value !== stage)
        : [...previous, stage],
    );
  };

  const dismissOnboardingNotice = () => {
    if (config.onboardingNotice && typeof window !== "undefined") {
      window.localStorage.setItem(config.onboardingNotice.storageKey, "done");
    }
    setShowOnboardingNotice(false);
  };

  const startDemoTask = () => {
    setShowTaskForm(false);
    setDemoTaskStarted(true);
    setVerifyStarted(false);
    window.setTimeout(() => setVerifyStarted(true), 900);
  };

  return (
    <main className="min-h-full overflow-y-auto bg-[#101417] text-content custom-scrollbar">
      <section className="border-b border-white/10 bg-[#12191b] px-5 py-5 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-3 text-sm text-[#99f6e4]">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2dd4bf]/50 bg-[#2dd4bf]/10">
                <PageIcon size={19} />
              </span>
              <span>{config.eyebrow}</span>
            </div>
            <h1 className="text-2xl font-semibold text-white md:text-[32px]">
              {config.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8c3c7]">
              {config.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {workflowBadges.map(({ label, icon: Icon }) => (
              <span
                key={label}
                data-testid={`workflow-badge-${label.toLowerCase()}`}
                className="inline-flex h-8 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 text-xs text-[#d7e0e4]"
              >
                <Icon size={14} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric) => (
          <div key={metric.label} className="bg-[#101417] px-5 py-5 md:px-8">
            <p className="text-xs uppercase tracking-normal text-[#819097]">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-[#aab6bb]">{metric.detail}</p>
          </div>
        ))}
      </section>

      {showOnboardingNotice && config.onboardingNotice ? (
        <section className="border-b border-white/10 bg-[#0f181b] px-5 py-4 md:px-8">
          <div className="flex flex-col gap-3 rounded-md border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {config.onboardingNotice.title}
              </h2>
              <p className="mt-1 text-sm text-[#b8c3c7]">
                {config.onboardingNotice.detail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={config.onboardingNotice.actionTo}
                className="inline-flex h-9 items-center rounded-md border border-[#2dd4bf]/50 bg-[#2dd4bf]/20 px-3 text-sm text-[#dffdf7] hover:bg-[#2dd4bf]/30"
              >
                {config.onboardingNotice.actionLabel}
              </Link>
              <button
                type="button"
                onClick={dismissOnboardingNotice}
                className="inline-flex h-9 items-center rounded-md border border-white/15 px-3 text-sm text-[#dce7eb] hover:bg-white/10"
              >
                稍后处理
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isTaskConsole ? (
        <section className="border-b border-white/10 bg-[#101417] px-5 py-5 md:px-8">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-normal text-[#dce7eb]">
                任务演示
              </h2>
              <p className="mt-1 text-sm text-[#93a2a8]">
                用固定样例展示新建任务、计划、执行、验证和审计回放链路。
              </p>
            </div>
            <button
              type="button"
              data-testid="new-task-button"
              onClick={() => setShowTaskForm((previous) => !previous)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#2dd4bf]/50 bg-[#2dd4bf]/15 px-4 text-sm font-semibold text-[#dffdf7] hover:bg-[#2dd4bf]/25"
            >
              新建任务
            </button>
          </div>

          {showTaskForm ? (
            <form
              data-testid="new-task-form"
              className="mb-4 grid gap-3 rounded-md border border-white/10 bg-[#151b1f] p-4"
              onSubmit={(event) => {
                event.preventDefault();
                startDemoTask();
              }}
            >
              <label className="grid gap-1 text-sm text-[#c8d5da]">
                任务目标
                <input
                  name="goal"
                  defaultValue="修复 login 模块空指针异常"
                  className="rounded-md border border-white/10 bg-[#0f1518] px-3 py-2 text-white outline-none focus:border-[#2dd4bf]/60"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1 text-sm text-[#c8d5da]">
                  验收标准
                  <input
                    name="acceptance"
                    defaultValue="登录单测全部通过，错误态有提示"
                    className="rounded-md border border-white/10 bg-[#0f1518] px-3 py-2 text-white outline-none focus:border-[#2dd4bf]/60"
                  />
                </label>
                <label className="grid gap-1 text-sm text-[#c8d5da]">
                  变更边界
                  <input
                    name="scope"
                    defaultValue="auth/login 服务与对应测试"
                    className="rounded-md border border-white/10 bg-[#0f1518] px-3 py-2 text-white outline-none focus:border-[#2dd4bf]/60"
                  />
                </label>
                <label className="grid gap-1 text-sm text-[#c8d5da]">
                  预算上限
                  <input
                    name="budget"
                    defaultValue="$8"
                    className="rounded-md border border-white/10 bg-[#0f1518] px-3 py-2 text-white outline-none focus:border-[#2dd4bf]/60"
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm text-[#c8d5da]">
                模型
                <select
                  name="model"
                  defaultValue="OpenAI-compatible gateway"
                  className="rounded-md border border-white/10 bg-[#0f1518] px-3 py-2 text-white outline-none focus:border-[#2dd4bf]/60"
                >
                  <option>OpenAI-compatible gateway</option>
                  <option>Ollama local</option>
                  <option>Team private gateway</option>
                </select>
              </label>
              <div className="flex justify-end">
                <button
                  type="submit"
                  data-testid="submit-task-button"
                  className="inline-flex h-10 items-center rounded-md bg-[#2dd4bf] px-4 text-sm font-semibold text-[#062522] hover:bg-[#5eead4]"
                >
                  提交任务
                </button>
              </div>
            </form>
          ) : null}

          {demoTaskStarted ? (
            <div
              data-testid="demo-task-detail"
              className="grid gap-4 rounded-md border border-[#2dd4bf]/30 bg-[#11191c] p-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]"
            >
              <div className="grid gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      修复 login 模块空指针异常
                    </h3>
                    <p className="mt-1 text-sm text-[#aebbc0]">
                      验收标准：登录单测全部通过，错误态有提示；变更边界：auth/login
                      服务与对应测试。
                    </p>
                  </div>
                  <StatusPill
                    label={verifyStarted ? "Verify" : "Execute"}
                    className={
                      verifyStarted
                        ? TASK_STATE_STYLES.verified
                        : TASK_STATE_STYLES.running
                    }
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <article className="rounded-md border border-emerald-400/40 bg-emerald-400/10 p-3">
                    <p className="text-sm font-semibold text-emerald-100">
                      Plan 完成
                    </p>
                    <p className="mt-1 text-xs text-emerald-50/80">
                      已拆解根因、风险和最小修改范围。
                    </p>
                  </article>
                  <article className="rounded-md border border-sky-400/40 bg-sky-400/10 p-3">
                    <p className="text-sm font-semibold text-sky-100">
                      Execute {verifyStarted ? "完成" : "进行中"}
                    </p>
                    <p className="mt-1 text-xs text-sky-50/80">
                      正在执行命令、编辑文件并记录工具调用。
                    </p>
                  </article>
                </div>
                <div className="rounded-md border border-white/10 bg-[#0c1113] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-[#8ee8d9]">
                    命令输出
                  </p>
                  <pre className="whitespace-pre-wrap text-xs leading-6 text-[#dce7eb]">
                    {`$ git checkout -b fix/login-npe
Switched to a new branch 'fix/login-npe'

$ pytest tests/unit/test_login.py
${verifyStarted ? "12 passed / 0 failed / 1 skipped" : "collecting ... running tests/unit/test_login.py::test_empty_profile"}`}
                  </pre>
                </div>
              </div>
              <aside className="grid gap-3">
                <div className="rounded-md border border-white/10 bg-[#0c1113] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-[#8ee8d9]">
                    文件 Diff
                  </p>
                  <div className="grid gap-2 text-xs text-[#c8d5da]">
                    <span>auth/login_service.py · +12 / -3</span>
                    <span>tests/unit/test_login.py · +28 / -0</span>
                    <span className="text-emerald-200">
                      + if user.profile is None: return LoginError(...)
                    </span>
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-[#0c1113] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-[#8ee8d9]">
                    工具调用记录
                  </p>
                  <div className="grid gap-2 text-xs text-[#c8d5da]">
                    <span>bash · git checkout -b fix/login-npe · success</span>
                    <span>file_edit · auth/login_service.py · success</span>
                    <span>
                      bash · pytest tests/unit/test_login.py ·{" "}
                      {verifyStarted ? "success" : "running"}
                    </span>
                  </div>
                </div>
                <div className="rounded-md border border-white/10 bg-[#0c1113] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-[#8ee8d9]">
                    Verify
                  </p>
                  <p className="text-sm text-white">
                    {verifyStarted
                      ? "12 passed / 0 failed / 1 skipped"
                      : "等待 Execute 完成后自动开始"}
                  </p>
                </div>
                <Link
                  to="/audit"
                  data-testid="audit-link"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] text-sm font-semibold text-[#dce7eb] hover:bg-white/10"
                >
                  打开审计回放
                </Link>
              </aside>
            </div>
          ) : null}
        </section>
      ) : null}

      {isAuditReplay ? (
        <section className="border-b border-white/10 bg-[#101417] px-5 py-5 md:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-normal text-[#dce7eb]">
            login 修复任务时间线
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              ["模型响应", "识别 login 模块空指针来自 user.profile 未初始化。"],
              ["命令执行", "git checkout -b fix/login-npe"],
              ["文件修改", "auth/login_service.py +12 / -3"],
              ["工具调用", "bash, file_edit, bash"],
              ["验证结果", "12 passed / 0 failed / 1 skipped"],
            ].map(([title, detail], index) => (
              <details
                key={title}
                open={index === 0 || index === 4}
                className="rounded-md border border-white/10 bg-[#151b1f] p-3"
              >
                <summary className="cursor-pointer text-sm font-semibold text-white">
                  {title}
                  {" -> "}
                  {detail}
                </summary>
                <pre className="mt-3 overflow-x-auto rounded bg-[#0c1113] p-3 text-xs leading-6 text-[#c8d5da]">
                  {JSON.stringify(
                    {
                      event: title,
                      task: "修复 login 模块空指针异常",
                      status: index === 4 ? "verified" : "recorded",
                      input: detail,
                      output:
                        index === 4
                          ? "pytest tests/unit/test_login.py: 12 passed / 0 failed / 1 skipped"
                          : "recorded in audit timeline",
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 px-5 py-6 md:px-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-normal text-[#dce7eb]">
              {t(I18nKey.FORGEPILOT$WORKBENCH_CURRENT_QUEUE)}
            </h2>
            <StatusPill
              label="operator-ready"
              className="border-[#fbbf24]/50 bg-[#fbbf24]/10 text-[#fde68a]"
            />
          </div>
          {config.enableTaskFilters ? (
            <>
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid="task-filter-failed"
                  onClick={() => setShowFailedOnly((previous) => !previous)}
                  className={`rounded-md border px-3 py-1 text-xs ${
                    showFailedOnly
                      ? "border-red-300/60 bg-red-300/10 text-red-100"
                      : "border-white/15 bg-white/[0.03] text-[#c3d0d5]"
                  }`}
                >
                  只看失败步骤
                </button>
                {STAGE_ORDER.map((stage) => {
                  const collapsed = collapsedStages.includes(stage);
                  return (
                    <button
                      key={stage}
                      type="button"
                      data-testid={`stage-toggle-${stage}`}
                      onClick={() => toggleStageCollapse(stage)}
                      className={`rounded-md border px-3 py-1 text-xs ${
                        collapsed
                          ? "border-white/15 bg-white/[0.03] text-[#93a2a8]"
                          : "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#9cf0e2]"
                      }`}
                    >
                      {collapsed ? "展开" : "折叠"} {STAGE_LABELS[stage]}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4">
                {STAGE_ORDER.map((stage) => {
                  const items = groupedItems[stage];
                  if (!items.length) {
                    return null;
                  }

                  const collapsed = collapsedStages.includes(stage);
                  return (
                    <section
                      key={stage}
                      className="rounded-md border border-white/10 bg-[#12181b] p-3"
                    >
                      <button
                        type="button"
                        onClick={() => toggleStageCollapse(stage)}
                        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#dce7eb]"
                      >
                        <span>{STAGE_LABELS[stage]}</span>
                        <span className="text-xs text-[#93a2a8]">
                          {items.length} steps
                        </span>
                      </button>
                      {!collapsed && (
                        <div className="mt-3 grid gap-3">
                          {items.map((item) => (
                            <article
                              key={item.title}
                              className="rounded-md border border-white/10 bg-[#151b1f] p-4 shadow-sm"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold text-white">
                                    {item.title}
                                  </h3>
                                  <p className="mt-2 text-sm leading-6 text-[#aebbc0]">
                                    {item.detail}
                                  </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                  {item.state && (
                                    <StatusPill
                                      label={item.state}
                                      className={TASK_STATE_STYLES[item.state]}
                                    />
                                  )}
                                  {item.risk && (
                                    <StatusPill
                                      label={item.risk}
                                      className={RISK_STYLES[item.risk]}
                                    />
                                  )}
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
                {!filteredItems.length && (
                  <div className="rounded-md border border-white/10 bg-[#12181b] p-4 text-sm text-[#93a2a8]">
                    当前筛选条件下没有步骤。
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid gap-3">
              {config.primaryItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-md border border-white/10 bg-[#151b1f] p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#aebbc0]">
                        {item.detail}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {item.state && (
                        <StatusPill
                          label={item.state}
                          className={TASK_STATE_STYLES[item.state]}
                        />
                      )}
                      {item.risk && (
                        <StatusPill
                          label={item.risk}
                          className={RISK_STYLES[item.risk]}
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-md border border-white/10 bg-[#151b1f] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-normal text-[#dce7eb]">
            {config.secondaryTitle}
          </h2>
          <div className="mt-4 grid gap-3">
            {config.secondaryItems.map((item) => (
              <div
                key={item.title}
                className="border-l-2 border-[#2dd4bf] pl-3"
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#aebbc0]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
          {config.toolCalls?.length ? (
            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-xs font-semibold uppercase tracking-normal text-[#dce7eb]">
                MCP 调用卡片
              </h3>
              <div className="mt-3 grid gap-3">
                {config.toolCalls.map((card) => (
                  <article
                    key={card.id}
                    data-testid={`tool-call-card-${card.id}`}
                    className="rounded-md border border-white/10 bg-[#101417] p-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-xs text-[#9ab0b8]">
                      <span className="font-medium text-white">
                        {card.toolName}
                      </span>
                      <span>{card.durationMs} ms</span>
                    </div>
                    <p className="mt-2 text-xs text-[#8ea4ac]">
                      参数: {card.parameters}
                    </p>
                    <p className="mt-2 text-xs text-[#aebbc0]">
                      摘要: {card.summary}
                    </p>
                    {card.error ? (
                      <p className="mt-2 rounded border border-red-400/40 bg-red-400/10 px-2 py-1 text-xs text-red-100">
                        错误: {card.error}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
