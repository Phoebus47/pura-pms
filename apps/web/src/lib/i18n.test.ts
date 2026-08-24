import th from '@/messages/th.json';
import en from '@/messages/en.json';
import {
  formatMessage,
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

  it('interpolates placeholders in formatMessage', () => {
    expect(
      formatMessage('dashboard.stats.occupancyChange', { rate: 72 }, 'en'),
    ).toBe('72% occupancy');
    setActiveMessages(th);
    expect(formatMessage('dashboard.occupancy', { rate: 72 })).toBe(
      'อัตราเข้าพัก 72%',
    );
  });

  it('provides Thai copy for critical front-office pages', () => {
    setActiveMessages(th);
    expect(t('dashboard.title')).toBe('แดชบอร์ด');
    expect(t('reservations.list.title')).toBe('การจอง');
    expect(t('guests.list.title')).toBe('แขก');
    expect(t('billing.title')).toBe('บิลลิ่ง');
    expect(t('housekeeping.title')).toBe('ตรวจห้องแม่บ้าน');
    expect(t('nightAudit.title')).toBe('ตรวจรอบคืน');
    expect(t('reservations.status.CHECKED_IN')).toBe('เช็คอินแล้ว');
    expect(t('print.documentLabel')).toBe('เอกสารสำหรับพิมพ์');
  });
});
