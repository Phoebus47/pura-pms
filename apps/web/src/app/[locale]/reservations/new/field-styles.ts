const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring';

export const FIELD_LABEL_CLASS =
  'block font-semibold mb-2 text-ink-strong text-sm';

export const FIELD_CLASS = `${FOCUS_RING} bg-surface-desk border border-input disabled:cursor-not-allowed disabled:opacity-50 h-(--field-h) px-3 rounded-md text-foreground text-sm w-full`;

export const CHECKBOX_CLASS = `${FOCUS_RING} accent-pura-blue h-4 mt-1 w-4`;
