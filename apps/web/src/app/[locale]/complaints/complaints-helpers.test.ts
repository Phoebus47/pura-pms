import { describe, expect, it } from 'vitest';
import {
  complaintSeverityLabel,
  complaintSeverityTone,
  complaintStatusLabel,
  complaintStatusTone,
} from './complaints-helpers';

describe('complaints-helpers', () => {
  it('maps status to labels', () => {
    expect(complaintStatusLabel('OPEN')).toBeTruthy();
    expect(complaintStatusLabel('IN_PROGRESS')).toBeTruthy();
    expect(complaintStatusLabel('RESOLVED')).toBeTruthy();
    expect(complaintStatusLabel('CLOSED')).toBeTruthy();
  });

  it('maps severity to labels', () => {
    expect(complaintSeverityLabel('LOW')).toBeTruthy();
    expect(complaintSeverityLabel('MEDIUM')).toBeTruthy();
    expect(complaintSeverityLabel('HIGH')).toBeTruthy();
    expect(complaintSeverityLabel('CRITICAL')).toBeTruthy();
  });

  it('maps status to a design-system tone', () => {
    expect(complaintStatusTone('OPEN')).toBe('caution');
    expect(complaintStatusTone('IN_PROGRESS')).toBe('info');
    expect(complaintStatusTone('RESOLVED')).toBe('positive');
    expect(complaintStatusTone('CLOSED')).toBe('neutral');
  });

  it('maps severity to a design-system tone', () => {
    expect(complaintSeverityTone('LOW')).toBe('neutral');
    expect(complaintSeverityTone('MEDIUM')).toBe('info');
    expect(complaintSeverityTone('HIGH')).toBe('caution');
    expect(complaintSeverityTone('CRITICAL')).toBe('critical');
  });
});
