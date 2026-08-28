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
    expect(t('nav.dashboard')).toBe('Shift Ops');
    expect(t('guests.form.new')).toBe('New Guest');
    expect(t('guests.search.title')).toBe('Search Guest');
    expect(t('roomTypes.form.new')).toBe('New Room Type');
    expect(t('properties.selectPlaceholder')).toBe('Select a property');
    expect(t('common.closeDialog')).toBe('Close dialog');
  });

  it('returns Thai messages when active locale messages are set', () => {
    setActiveMessages(th);

    expect(t('nav.dashboard')).toBe('Shift Ops');
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
    expect(t('dashboard.title')).toBe('Shift Ops');
    expect(t('reservations.list.title')).toBe('การจอง');
    expect(t('guests.list.title')).toBe('แขก');
    expect(t('billing.title')).toBe('โฟลิโอ');
    expect(t('housekeeping.title')).toBe('ตรวจห้องแม่บ้าน');
    expect(t('nightAudit.title')).toBe('Night Audit');
    expect(t('nav.lostFound')).toBe('Lost & Found');
    expect(t('nav.rates')).toBe('Rate');
    expect(t('nav.yield')).toBe('Yield');
    expect(t('nav.cardPreauths')).toBe('Pre-auth');
    expect(t('reservations.status.CHECKED_IN')).toBe('เช็คอินแล้ว');
    expect(t('rooms.title')).toBe('ห้องพัก');
    expect(t('guests.form.new')).toBe('เพิ่มแขก');
    expect(t('guests.search.title')).toBe('ค้นหาแขก');
    expect(t('roomTypes.form.new')).toBe('เพิ่มประเภทห้อง');
    expect(t('properties.selectPlaceholder')).toBe('เลือกโรงแรม');
    expect(t('common.closeDialog')).toBe('ปิดหน้าต่าง');
    expect(t('roomTypes.title')).toBe('ประเภทห้อง');
    expect(t('properties.title')).toBe('โรงแรม');
    expect(t('rooms.status.VACANT_CLEAN')).toBe('ว่างสะอาด (VC)');
  });
});
