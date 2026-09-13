/**
 * Chart palette — the design system's `--chart-*` ramp (see DESIGN.md §1).
 *
 * Recharts takes colours as SVG attributes/props, not class names, so the
 * tokens are referenced as `var()` strings. Both presentation attributes
 * (`fill="var(--chart-3)"`) and inline `style` values resolve them.
 */

/** Categorical ramp for multi-series charts, in priority order. */
export const CHART_PALETTE = Array.from({ length: 10 }, (_, i) => `var(--chart-${i + 1})`);

/** Chart grid lines and axis strokes are chrome, never a data hue. */
export const CHART_GRID_STROKE = "var(--border)";
export const CHART_AXIS_COLOR = "var(--muted-foreground)";

/**
 * Nominal series always use the same slot, so a colour keeps its meaning
 * across screens: paid/on-time, unpaid/late, pending, informational.
 */
export const CHART_SERIES = {
  positive: "var(--success)",
  warning: "var(--warning)",
  negative: "var(--destructive)",
  info: "var(--info)",
  neutral: "var(--tertiary)",
} as const;
