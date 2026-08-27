export type StatusTone =
  | 'positive'
  | 'caution'
  | 'critical'
  | 'info'
  | 'neutral'
  | 'brand';

/** Tinted surface + readable ink + hairline ring, for badges and chips. */
export const statusToneClass: Record<StatusTone, string> = {
  positive:
    'bg-status-positive-tint text-status-positive-ink ring-status-positive-line/30',
  caution:
    'bg-status-caution-tint text-status-caution-ink ring-status-caution-line/30',
  critical:
    'bg-status-critical-tint text-status-critical-ink ring-status-critical-line/30',
  info: 'bg-status-info-tint text-status-info-ink ring-status-info-line/30',
  neutral: 'bg-surface-inset text-ink-subtle ring-rule-mist',
  brand: 'bg-pura-blue/10 text-pura-blue ring-pura-blue/20',
};

/** Ink-only tone, for figures such as a folio balance. */
export const statusToneInk: Record<StatusTone, string> = {
  positive: 'text-status-positive-ink',
  caution: 'text-status-caution-ink',
  critical: 'text-status-critical-ink',
  info: 'text-status-info-ink',
  neutral: 'text-ink-subtle',
  brand: 'text-pura-blue',
};

/** Tinted callout surface, for inline error and notice panels. */
export const statusToneSurface: Record<StatusTone, string> = {
  positive: 'bg-status-positive-tint border-status-positive-line/30',
  caution: 'bg-status-caution-tint border-status-caution-line/30',
  critical: 'bg-status-critical-tint border-status-critical-line/30',
  info: 'bg-status-info-tint border-status-info-line/30',
  neutral: 'bg-surface-inset border-rule-mist',
  brand: 'bg-pura-blue/5 border-pura-blue/20',
};
