import { hkRequestTone, hkRoomTone, hkStageTone } from './hk-tone';
import type { HkBoardRoom, HkStage } from '@/lib/api/housekeeping';
import type { RoomStatus } from '@/lib/api/rooms';

function room(status: RoomStatus, hkStage: HkStage): HkBoardRoom {
  return {
    id: 'room-1',
    number: '101',
    status,
    hkStage,
    propertyId: 'prop-1',
  };
}

describe('hkRoomTone', () => {
  it('reads a ready room as positive', () => {
    expect(hkRoomTone(room('VACANT_CLEAN', 'READY'))).toBe('positive');
  });

  it('reads a dirty room as caution', () => {
    expect(hkRoomTone(room('VACANT_DIRTY', 'DIRTY'))).toBe('caution');
  });

  it('reads an out-of-order room as critical whatever its stage', () => {
    expect(hkRoomTone(room('OUT_OF_ORDER', 'READY'))).toBe('critical');
  });

  it('reads an out-of-service room as neutral', () => {
    expect(hkRoomTone(room('OUT_OF_SERVICE', 'DIRTY'))).toBe('neutral');
  });

  it('reads a cleaned but uninspected room as info', () => {
    expect(hkRoomTone(room('VACANT_CLEAN', 'CLEAN'))).toBe('info');
  });
});

describe('hkStageTone', () => {
  it('maps each stage to its column tone', () => {
    expect(hkStageTone('READY')).toBe('positive');
    expect(hkStageTone('DIRTY')).toBe('caution');
    expect(hkStageTone('CLEAN')).toBe('info');
  });
});

describe('hkRequestTone', () => {
  it('treats DND as critical and MUR as info', () => {
    expect(hkRequestTone('DND')).toBe('critical');
    expect(hkRequestTone('MUR')).toBe('info');
    expect(hkRequestTone('NONE')).toBe('neutral');
  });
});
