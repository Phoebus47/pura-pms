import type {
  GuestRoomRequest,
  HkBoardRoom,
  HkStage,
} from '@/lib/api/housekeeping';
import type { StatusTone } from '@/lib/design/status-tone';

/**
 * Board semantics, not palette: a room a guest can be sent to reads positive,
 * one still needing service reads caution, and a room out of order reads
 * critical regardless of how far through the cleaning cycle it is. Out of
 * service is only temporarily off the board, so it reads neutral rather than
 * competing with maintenance for attention.
 */
export function hkRoomTone(room: HkBoardRoom): StatusTone {
  if (room.status === 'OUT_OF_ORDER') return 'critical';
  if (room.status === 'OUT_OF_SERVICE') return 'neutral';
  if (room.hkStage === 'READY') return 'positive';
  if (room.hkStage === 'DIRTY') return 'caution';
  return 'info';
}

export function hkStageTone(stage: HkStage): StatusTone {
  if (stage === 'READY') return 'positive';
  if (stage === 'DIRTY') return 'caution';
  return 'info';
}

/** DND blocks the room from being serviced at all; MUR is only a reordering. */
export function hkRequestTone(request: GuestRoomRequest): StatusTone {
  if (request === 'DND') return 'critical';
  if (request === 'MUR') return 'info';
  return 'neutral';
}
