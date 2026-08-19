import { describe, expect, it } from 'vitest';
import {
  HK_CHECKLIST_MESSAGE,
  HK_NOT_CLEAN_MESSAGE,
  hasFullChecklist,
  hkStageForStatusChange,
  inspectionPassed,
  isGuestRoomRequest,
  toCleanRoomStatus,
  toDirtyRoomStatus,
} from './hk-rules';

describe('hk-rules', () => {
  it('maps occupied and vacant dirty or clean statuses', () => {
    expect(toCleanRoomStatus('VACANT_DIRTY')).toBe('VACANT_CLEAN');
    expect(toCleanRoomStatus('OCCUPIED_DIRTY')).toBe('OCCUPIED_CLEAN');
    expect(toDirtyRoomStatus('VACANT_CLEAN')).toBe('VACANT_DIRTY');
    expect(toDirtyRoomStatus('OCCUPIED_CLEAN')).toBe('OCCUPIED_DIRTY');
  });

  it('resets stage to dirty when the room becomes dirty', () => {
    expect(hkStageForStatusChange('VACANT_DIRTY', 'READY')).toBe('DIRTY');
    expect(hkStageForStatusChange('OCCUPIED_CLEAN', 'DIRTY')).toBe('CLEAN');
    expect(hkStageForStatusChange('OCCUPIED_CLEAN', 'READY')).toBe('READY');
  });

  it('requires every checklist code and all required passes', () => {
    const lines = [
      { itemCode: 'BED', passed: true },
      { itemCode: 'BATH', passed: true },
      { itemCode: 'LINEN', passed: true },
      { itemCode: 'AMENITIES', passed: true },
      { itemCode: 'MINIBAR', passed: false },
    ];
    expect(hasFullChecklist(lines)).toBe(true);
    expect(inspectionPassed(lines)).toBe(true);
    expect(inspectionPassed([{ itemCode: 'BED', passed: false }])).toBe(false);
    expect(hasFullChecklist([{ itemCode: 'BED' }])).toBe(false);
    expect(HK_CHECKLIST_MESSAGE.length).toBeGreaterThan(0);
    expect(HK_NOT_CLEAN_MESSAGE.length).toBeGreaterThan(0);
  });

  it('validates guest room request values', () => {
    expect(isGuestRoomRequest('DND')).toBe(true);
    expect(isGuestRoomRequest('MUR')).toBe(true);
    expect(isGuestRoomRequest('NONE')).toBe(true);
    expect(isGuestRoomRequest('VIP')).toBe(false);
  });
});
