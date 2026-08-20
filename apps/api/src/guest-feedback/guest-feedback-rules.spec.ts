import { describe, expect, it } from 'vitest';
import {
  assertCanReview,
  assertValidScore,
  GF_INVALID_SCORE,
  GF_NOT_OPEN_STATUS,
} from './guest-feedback-rules';

describe('guest-feedback-rules', () => {
  it('accepts scores 1 through 5', () => {
    for (const score of [1, 2, 3, 4, 5]) {
      expect(() => assertValidScore(score)).not.toThrow();
    }
  });

  it('rejects invalid scores', () => {
    expect(() => assertValidScore(0)).toThrow(GF_INVALID_SCORE);
    expect(() => assertValidScore(6)).toThrow(GF_INVALID_SCORE);
    expect(() => assertValidScore(3.5)).toThrow(GF_INVALID_SCORE);
  });

  it('allows review only for open feedback', () => {
    expect(() => assertCanReview('OPEN')).not.toThrow();
    expect(() => assertCanReview('REVIEWED')).toThrow(GF_NOT_OPEN_STATUS);
    expect(() => assertCanReview('ARCHIVED')).toThrow(GF_NOT_OPEN_STATUS);
  });
});
