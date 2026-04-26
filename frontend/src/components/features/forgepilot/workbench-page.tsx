import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  TASK_STATE_STYLES,
  RISK_STYLES,
  workflowBadges,
} from "./workbench-data";
import type { WorkbenchPageConfig } from "./workbench-data";

interface WorkbenchPageProps {
  config: WorkbenchPageConfig;
}

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
        </aside>
      </section>
    </main>
  );
}
