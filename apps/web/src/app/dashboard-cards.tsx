import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/lib/api';

export type GlowTone = 'blue' | 'orange' | 'sky' | 'blueDark';

export interface StatCardItem {
  name: string;
  value: string;
  icon: LucideIcon;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  tone: GlowTone;
}

const TONE_CLASSES: Record<GlowTone, { glow: string; icon: string }> = {
  blue: {
    glow: 'bg-[radial-gradient(circle_at_center,var(--color-pura-blue)_0%,transparent_70%)]',
    icon: 'bg-pura-blue',
  },
  orange: {
    glow: 'bg-[radial-gradient(circle_at_center,var(--color-pura-orange)_0%,transparent_70%)]',
    icon: 'bg-pura-orange',
  },
  sky: {
    glow: 'bg-[radial-gradient(circle_at_center,var(--color-pura-sky)_0%,transparent_70%)]',
    icon: 'bg-pura-sky',
  },
  blueDark: {
    glow: 'bg-[radial-gradient(circle_at_center,var(--color-pura-blue-dark)_0%,transparent_70%)]',
    icon: 'bg-pura-blue-dark',
  },
};

interface StatCardProps {
  readonly stat: StatCardItem;
}

export function StatCard({ stat }: StatCardProps) {
  const tones = TONE_CLASSES[stat.tone];
  const Icon = stat.icon;

  return (
    <div className="bg-white border border-slate-200 group hover:border-slate-300 p-6 relative rounded-xl shadow-sm transition-colors">
      <div
        aria-hidden="true"
        className="[clip-path:inset(0_round_0.875rem)] absolute inset-0 isolate overflow-hidden pointer-events-none rounded-xl"
      >
        <div
          className={cn(
            'absolute -right-4 -top-4 h-32 w-32 opacity-10 group-hover:opacity-20',
            tones.glow,
          )}
        />
      </div>
      <div className="relative z-10">
        <div
          className={cn('inline-flex p-3.5 rounded-lg text-white', tones.icon)}
        >
          <Icon className="h-6 w-6" />
        </div>
        <p className="font-semibold mt-4 text-slate-600 text-sm">{stat.name}</p>
        <div className="flex gap-3 items-end justify-between mt-2">
          <p className="font-black sm:text-4xl text-3xl text-pura-blue tracking-tight">
            {stat.value}
          </p>
          <p
            className={cn(
              'pb-1 text-right text-xs whitespace-nowrap',
              getChangeTypeColor(stat.changeType),
            )}
          >
            {stat.change}
          </p>
        </div>
      </div>
    </div>
  );
}

interface RecentReservationRowProps {
  readonly reservation: Reservation;
}

export function RecentReservationRow({
  reservation,
}: RecentReservationRowProps) {
  const guestName =
    `${reservation.guest?.firstName ?? ''} ${reservation.guest?.lastName ?? ''}`.trim();

  return (
    <div className="bg-white border border-slate-200 flex flex-col gap-3 hover:border-slate-300 p-4 rounded-lg sm:flex-row sm:items-center sm:justify-between transition-colors">
      <div className="flex gap-4 items-center min-w-0">
        <Avatar className="h-10 shrink-0 w-10">
          <AvatarImage
            src={`https://ui-avatars.com/api/?name=${reservation.guest?.firstName}+${reservation.guest?.lastName}`}
            alt={`${guestName} avatar`}
          />
          <AvatarFallback>
            {reservation.guest?.firstName?.[0]}
            {reservation.guest?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{guestName}</p>
          <p className="text-slate-500 text-sm truncate">
            Room {reservation.room?.number} • {reservation.confirmNumber}
          </p>
        </div>
      </div>
      <div className="sm:text-right">
        <p className="font-semibold text-pura-blue">
          ฿{Number(reservation.totalAmount).toLocaleString()}
        </p>
        <p className="text-slate-500 text-sm">
          {new Date(reservation.checkIn).toLocaleDateString()} -{' '}
          {new Date(reservation.checkOut).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function getChangeTypeColor(type: 'positive' | 'negative' | 'neutral') {
  switch (type) {
    case 'positive':
      return 'text-emerald-600 font-medium';
    case 'negative':
      return 'text-red-600 font-medium';
    default:
      return 'text-slate-500 font-medium';
  }
}
