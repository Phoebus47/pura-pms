import { t } from '@/lib/i18n';
import { calendarNights, isSplitStay } from '@/lib/split-stay';
import type { ReservationStay } from '@/lib/split-stay';

interface SplitStayTableProps {
  readonly stays: readonly ReservationStay[];
}

export function SplitStayTable({ stays }: SplitStayTableProps) {
  if (!isSplitStay({ stays })) {
    return null;
  }

  return (
    <section aria-labelledby="split-stay-segments">
      <h3
        id="split-stay-segments"
        className="font-bold mb-3 text-lg text-pura-blue"
      >
        {t('reservations.splitStay.segments')}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="pb-2 pr-4">
                {t('reservations.splitStay.dates')}
              </th>
              <th scope="col" className="pb-2 pr-4">
                {t('reservations.splitStay.room')}
              </th>
              <th scope="col" className="pb-2 pr-4">
                {t('reservations.splitStay.nights')}
              </th>
              <th scope="col" className="pb-2">
                {t('reservations.splitStay.rate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {stays.map((stay, index) => (
              <tr
                key={stay.id ?? stay.sequence ?? index}
                className="text-foreground"
              >
                <td className="pr-4 py-2">
                  {stay.startDate.slice(0, 10)} → {stay.endDate.slice(0, 10)}
                </td>
                <td className="pr-4 py-2">
                  {stay.room?.number ?? stay.roomId}{' '}
                  {stay.roomType?.name ?? stay.room?.roomType?.name}
                </td>
                <td className="pr-4 py-2">
                  {stay.nights || calendarNights(stay.startDate, stay.endDate)}
                </td>
                <td className="py-2">
                  ฿{Number(stay.roomRate).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
