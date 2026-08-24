import th from '@/messages/th.json';
import en from '@/messages/en.json';
import {
  resetMessagesToDefault,
  setActiveMessages,
  t,
  tWithMessages,
} from '@/lib/i18n';

describe('i18n bridge', () => {
  afterEach(() => {
    resetMessagesToDefault();
  });

  it('returns English messages by default', () => {
    expect(t('nav.dashboard')).toBe('Dashboard');
  });

  it('returns Thai messages when active locale messages are set', () => {
    setActiveMessages(th);

    expect(t('nav.dashboard')).toBe('แดชบอร์ด');
  });

  it('falls back to the path when a key is missing', () => {
    expect(t('missing.key')).toBe('missing.key');
  });

  it('resolves messages from an explicit message tree', () => {
    expect(tWithMessages('nav.guests', en)).toBe('Guests');
    expect(tWithMessages('nav.guests', th)).toBe('แขก');
  });
});
