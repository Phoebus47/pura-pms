import { describe, expect, it } from 'vitest';
import {
  complaintSeverityLabel,
  complaintStatusLabel,
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
});
