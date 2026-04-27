/**
 * ForgePilot UI Kit — Design Tokens
 *
 * Centralized design tokens for the ForgePilot Studio console.
 * Colors: dark navy/slate base with teal/emerald accent.
 * Spacing: 4px grid.
 * Typography: system font stack, monospace for code.
 */

/* ── Color Palette ────────────────────────────────── */

export const FORGEPILOT_COLORS = {
  /* Backgrounds */
  bgRoot: "#0d1114",
  bgSurface: "#101417",
  bgCard: "#151b1f",
  bgHeader: "#12191b",
  bgElevated: "#1a2126",

  /* Borders */
  borderDefault: "rgba(255,255,255,0.10)",
  borderAccent: "rgba(45,212,191,0.50)",
  borderAccentLight: "rgba(45,212,191,0.30)",

  /* Accent (teal) */
  accent: "#2dd4bf",
  accentDim: "#5eead4",
  accentBg: "rgba(45,212,191,0.10)",
  accentBgHover: "rgba(45,212,191,0.20)",

  /* Text */
  textPrimary: "#ffffff",
  textSecondary: "#dce7eb",
  textMuted: "#b8c3c7",
  textDim: "#93a2a8",
  textAccent: "#99f6e4",

  /* Status */
  statusGreen: "#34d399",
  statusAmber: "#fbbf24",
  statusRed: "#f87171",
  statusSky: "#38bdf8",
  statusTeal: "#2dd4bf",
} as const;

/* ── Status Variants ─────────────────────────────── */

export type FPStatusVariant =
  | "planned"
  | "running"
  | "blocked"
  | "verified"
  | "shipped"
  | "safe"
  | "review"
  | "danger";

export const FP_STATUS_MAP: Record<
  FPStatusVariant,
  { label: string; border: string; bg: string; text: string }
> = {
  planned: {
    label: "planned",
    border: "border-sky-400/40",
    bg: "bg-sky-400/10",
    text: "text-sky-100",
  },
  running: {
    label: "running",
    border: "border-amber-300/50",
    bg: "bg-amber-300/10",
    text: "text-amber-100",
  },
  blocked: {
    label: "blocked",
    border: "border-red-400/50",
    bg: "bg-red-400/10",
    text: "text-red-100",
  },
  verified: {
    label: "verified",
    border: "border-emerald-400/50",
    bg: "bg-emerald-400/10",
    text: "text-emerald-100",
  },
  shipped: {
    label: "shipped",
    border: "border-teal-300/50",
    bg: "bg-teal-300/10",
    text: "text-teal-100",
  },
  safe: {
    label: "safe",
    border: "border-emerald-400/50",
    bg: "bg-emerald-400/10",
    text: "text-emerald-100",
  },
  review: {
    label: "review",
    border: "border-amber-300/50",
    bg: "bg-amber-300/10",
    text: "text-amber-100",
  },
  danger: {
    label: "danger",
    border: "border-orange-400/50",
    bg: "bg-orange-400/10",
    text: "text-orange-100",
  },
};

/* ── Workflow Phase ───────────────────────────────── */

export type FPPhase = "plan" | "execute" | "verify" | "report";

export const FP_PHASE_META: Record<FPPhase, { label: string; color: string }> =
  {
    plan: { label: "Plan", color: "#38bdf8" },
    execute: { label: "Execute", color: "#fbbf24" },
    verify: { label: "Verify", color: "#34d399" },
    report: { label: "Report", color: "#2dd4bf" },
  };

/* ── Spacing Scale ────────────────────────────────── */

export const FP_SPACE = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const;

/* ── Typography ───────────────────────────────────── */

export const FP_TYPE = {
  heading1: "text-2xl font-semibold md:text-[32px]",
  heading2: "text-sm font-semibold uppercase tracking-normal",
  body: "text-sm leading-6",
  caption: "text-xs",
  mono: "font-mono text-xs",
} as const;

/* ── Component Class Helpers ──────────────────────── */

export const fpCard =
  "rounded-md border border-white/10 bg-[#151b1f] p-4 shadow-sm";
export const fpPill =
  "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium uppercase tracking-normal";
export const fpButton = {
  primary:
    "inline-flex h-9 items-center rounded-md border border-[#2dd4bf]/50 bg-[#2dd4bf]/20 px-3 text-sm text-[#dffdf7] hover:bg-[#2dd4bf]/30",
  secondary:
    "inline-flex h-9 items-center rounded-md border border-white/15 px-3 text-sm text-[#dce7eb] hover:bg-white/10",
  ghost:
    "inline-flex h-9 items-center rounded-md px-3 text-sm text-[#dce7eb] hover:bg-white/5",
} as const;
