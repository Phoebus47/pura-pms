'use client';

import { ArrowRight, BedDouble } from 'lucide-react';
import { type Room } from '@/lib/api';
import { Panel } from '@/components/shared/panel';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionHeading } from '@/components/shared/section-heading';
import { t } from '@/lib/i18n';
import { RoomChoiceList } from './room-choice-list';
import { StepNav } from './step-nav';

interface StepRoomSelectProps {
  readonly availableRooms: Room[];
  readonly selectedRoom: Room | null;
  readonly onSelectRoom: (room: Room) => void;
  readonly isSplitStay: boolean;
  readonly secondRoom: Room | null;
  readonly onSelectSecondRoom: (room: Room) => void;
  readonly onBack: () => void;
  readonly onNext: () => void;
}

export function StepRoomSelect({
  availableRooms,
  selectedRoom,
  onSelectRoom,
  isSplitStay,
  secondRoom,
  onSelectSecondRoom,
  onBack,
  onNext,
}: StepRoomSelectProps) {
  return (
    <Panel
      padding="lg"
      title={
        isSplitStay
          ? t('reservations.splitStay.firstRoom')
          : t('reservations.new.step2Title')
      }
    >
      <div className="space-y-6">
        {availableRooms.length === 0 ? (
          <EmptyState
            icon={<BedDouble className="h-10 w-10" />}
            title={t('reservations.new.noAvailableRooms')}
            description={t('reservations.new.noAvailableRoomsHint')}
          />
        ) : (
          <RoomChoiceList
            rooms={availableRooms}
            selectedRoomId={selectedRoom?.id}
            onSelect={onSelectRoom}
            labelPrefix={t('common.roomLabel')}
            showRate
          />
        )}

        {isSplitStay ? (
          <div className="space-y-4">
            <SectionHeading title={t('reservations.splitStay.secondRoom')} />
            <RoomChoiceList
              rooms={availableRooms.filter(
                (room) => room.id !== selectedRoom?.id,
              )}
              selectedRoomId={secondRoom?.id}
              onSelect={onSelectSecondRoom}
              labelPrefix={t('reservations.splitStay.secondRoom')}
            />
          </div>
        ) : null}

        <StepNav
          nextLabel={t('common.next')}
          nextIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          onBack={onBack}
          onNext={onNext}
        />
      </div>
    </Panel>
  );
}
