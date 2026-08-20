import { describe, expect, it } from 'vitest';
import {
  assertInAppChannel,
  assertOutboundHasSender,
  GM_CHANNEL_NOT_SUPPORTED,
  GM_OUTBOUND_NEEDS_SENDER,
} from './guest-message-rules';

describe('guest-message-rules', () => {
  it('rejects non-IN_APP channels', () => {
    expect(() => assertInAppChannel('SMS')).toThrow(GM_CHANNEL_NOT_SUPPORTED);
    expect(() => assertInAppChannel('IN_APP')).not.toThrow();
    expect(() => assertInAppChannel(undefined)).not.toThrow();
  });

  it('requires sentBy for outbound', () => {
    expect(() => assertOutboundHasSender('OUTBOUND', undefined)).toThrow(
      GM_OUTBOUND_NEEDS_SENDER,
    );
    expect(() => assertOutboundHasSender('OUTBOUND', 'usr-1')).not.toThrow();
    expect(() => assertOutboundHasSender('INBOUND', undefined)).not.toThrow();
  });
});
