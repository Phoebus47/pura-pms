import {
  statusToneClass,
  statusToneInk,
  statusToneSurface,
  type StatusTone,
} from './status-tone';

const tones: StatusTone[] = [
  'positive',
  'caution',
  'critical',
  'info',
  'neutral',
  'brand',
];

describe('status tone maps', () => {
  it('covers every tone in all three maps', () => {
    tones.forEach((tone) => {
      expect(statusToneClass[tone]).toBeTruthy();
      expect(statusToneInk[tone]).toBeTruthy();
      expect(statusToneSurface[tone]).toBeTruthy();
    });
  });

  it('never emits a raw Tailwind palette color', () => {
    const all = [
      ...Object.values(statusToneClass),
      ...Object.values(statusToneInk),
      ...Object.values(statusToneSurface),
    ].join(' ');

    expect(all).not.toMatch(
      /\b(?:red|emerald|green|amber|yellow|slate|gray|purple|indigo)-\d{2,3}\b/,
    );
  });

  it('pairs a tint with matching ink for badge tones', () => {
    expect(statusToneClass.critical).toContain('bg-status-critical-tint');
    expect(statusToneClass.critical).toContain('text-status-critical-ink');
  });
});
