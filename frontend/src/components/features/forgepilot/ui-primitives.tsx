/**
 * ForgePilot UI Kit — Shared Primitives
 *
 * Consistent, composable UI components for the ForgePilot Studio console.
 * All components follow the dark theme with teal accent.
 */

import type { LucideIcon } from "lucide-react";
import { FP_STATUS_MAP, FP_PHASE_META, fpCard, fpPill } from "./ui-kit";
import type { FPStatusVariant, FPPhase } from "./ui-kit";

/* ── StatusPill ──────────────────────────────────── */

export function StatusPill({
  variant,
  label,
}: {
  variant: FPStatusVariant;
  label?: string;
}) {
  const style = FP_STATUS_MAP[variant];
  return (
    <span className={`${fpPill} ${style.border} ${style.bg} ${style.text}`}>
      {label ?? style.label}
    </span>
  );
}

/* ── PhaseBadge ───────────────────────────────────── */

export function PhaseBadge({
  phase,
  size = "md",
}: {
  phase: FPPhase;
  size?: "sm" | "md";
}) {
  const meta = FP_PHASE_META[phase];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 font-medium uppercase tracking-normal ${
        size === "sm" ? "h-5 text-[10px]" : "h-7 text-xs"
      }`}
      style={{
        borderColor: `${meta.color}40`,
        backgroundColor: `${meta.color}15`,
        color: meta.color,
      }}
      data-testid={`phase-badge-${phase}`}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}

/* ── TaskStepCard ─────────────────────────────────── */

export function TaskStepCard({
  title,
  detail,
  phase,
  status,
  icon: Icon,
  children,
}: {
  title: string;
  detail: string;
  phase?: FPPhase;
  status?: FPStatusVariant;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <article className={fpCard}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className="text-[#93a2a8]" />}
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            {phase && <PhaseBadge phase={phase} size="sm" />}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#aebbc0]">{detail}</p>
          {children}
        </div>
        {status && <StatusPill variant={status} />}
      </div>
    </article>
  );
}

/* ── MetricCard ───────────────────────────────────── */

export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-[#101417] px-5 py-5 md:px-8">
      <p className="text-xs uppercase tracking-normal text-[#819097]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-[#aab6bb]">{detail}</p>
    </div>
  );
}

/* ── PageHeader ───────────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  badges,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  badges?: React.ReactNode;
}) {
  return (
    <section className="border-b border-white/10 bg-[#12191b] px-5 py-5 md:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3 text-sm text-[#99f6e4]">
            {Icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2dd4bf]/50 bg-[#2dd4bf]/10">
                <Icon size={19} />
              </span>
            )}
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-2xl font-semibold text-white md:text-[32px]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8c3c7]">
            {description}
          </p>
        </div>
        {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
      </div>
    </section>
  );
}

/* ── SectionPanel ─────────────────────────────────── */

export function SectionPanel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-md border border-white/10 bg-[#151b1f] p-4 ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-normal text-[#dce7eb]">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/* ── EmptyState ───────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-white/10 bg-[#101417] py-12">
      {Icon && <Icon size={32} className="mb-3 text-[#819097]" />}
      <p className="text-sm font-semibold text-[#dce7eb]">{title}</p>
      <p className="mt-1 max-w-sm text-center text-sm text-[#93a2a8]">
        {detail}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
