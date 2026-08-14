import { isOpenHold, PREAUTH_NOT_HOLDABLE } from './preauth-rules';
import { CardPreauthStatus } from '@pura/database';

describe('preauth-rules', () => {
  it('treats held and incremental as open holds', () => {
    expect(isOpenHold(CardPreauthStatus.HELD)).toBe(true);
    expect(isOpenHold(CardPreauthStatus.INCREMENTAL)).toBe(true);
    expect(isOpenHold(CardPreauthStatus.CAPTURED)).toBe(false);
    expect(PREAUTH_NOT_HOLDABLE).toContain('incremented');
  });
});
