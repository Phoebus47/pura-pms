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
  blue: { glow: 'bg-pura-blue', icon: 'bg-pura-blue' },
  orange: { glow: 'bg-pura-orange', icon: 'bg-pura-orange' },
  sky: { glow: 'bg-pura-sky', icon: 'bg-pura-sky' },
  blueDark: { glow: 'bg-pura-blue-dark', icon: 'bg-pura-blue-dark' },
};

interface StatCardProps {
  readonly stat: StatCardItem;
}

export function StatCard({ stat }: StatCardProps) {
  const tones = TONE_CLASSES[stat.tone];
  const Icon = stat.icon;

  return (
    <div className="backdrop-blur-2xl bg-white/40 border border-white/50 duration-300 group hover:-translate-y-2 hover:bg-white/50 hover:border-white/70 hover:shadow-2xl hover:shadow-black/10 motion-reduce:hover:translate-y-0 p-6 relative rounded-3xl shadow-black/5 shadow-xl transition-all">
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]"
      >
        <div
          className={cn(
            '-right-4 -top-4 absolute blur-2xl duration-500 group-hover:opacity-30 group-hover:scale-150 h-32 motion-reduce:transform-none opacity-20 rounded-full transition-all w-32',
            tones.glow,
          )}
        />
      </div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex gap-3 items-center">
          <div
            className={cn(
              'backdrop-blur-sm border border-white/30 duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:shadow-xl motion-reduce:transform-none p-3.5 rounded-2xl shadow-2xl text-white transition-all',
              tones.icon,
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className={cn(getChangeTypeColor(stat.changeType))}>
          {stat.change}
        </div>
      </div>
      <div className="mt-4 relative z-10">
        <p className="font-semibold text-slate-600 text-sm">{stat.name}</p>
        <p className="font-black mt-2 sm:text-4xl text-3xl text-pura-blue tracking-tight">
          {stat.value}
        </p>
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
    <div className="bg-white/50 border border-white/60 flex flex-col gap-3 hover:bg-white/70 p-4 rounded-2xl sm:flex-row sm:items-center sm:justify-between transition-colors">
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
