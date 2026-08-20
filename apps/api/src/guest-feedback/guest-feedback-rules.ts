export const GF_MISSING_PROPERTY = 'propertyId is required';
export const GF_INVALID_SCORE = 'Score must be between 1 and 5';
export const GF_NOT_OPEN_STATUS = 'Only open feedback can be reviewed';

export function assertValidScore(score: number): void {
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error(GF_INVALID_SCORE);
  }
}

export function assertCanReview(status: string): void {
  if (status !== 'OPEN') {
    throw new Error(GF_NOT_OPEN_STATUS);
  }
}
