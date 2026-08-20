export const GM_MISSING_PROPERTY = 'propertyId is required';
export const GM_CHANNEL_NOT_SUPPORTED =
  'Only IN_APP channel is supported in v1';
export const GM_OUTBOUND_NEEDS_SENDER = 'Outbound messages require sentBy';

export function assertInAppChannel(channel?: string): void {
  if (channel && channel !== 'IN_APP') {
    throw new Error(GM_CHANNEL_NOT_SUPPORTED);
  }
}

export function assertOutboundHasSender(
  direction: string,
  sentBy?: string,
): void {
  if (direction === 'OUTBOUND' && !sentBy?.trim()) {
    throw new Error(GM_OUTBOUND_NEEDS_SENDER);
  }
}
