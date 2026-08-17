import type { StayPurpose } from '@/lib/stay-purpose';
import { isNonRevenueStay } from '@/lib/stay-purpose';
import { t } from '@/lib/i18n';

interface StayPurposeFieldsProps {
  readonly stayPurpose: StayPurpose;
  readonly onStayPurposeChange: (value: StayPurpose) => void;
  readonly approvedBy: string;
  readonly onApprovedByChange: (value: string) => void;
  readonly stayPurposeNote: string;
  readonly onStayPurposeNoteChange: (value: string) => void;
  readonly department: string;
  readonly onDepartmentChange: (value: string) => void;
  readonly showAuthority?: boolean;
}

export function StayPurposeFields({
  stayPurpose,
  onStayPurposeChange,
  approvedBy,
  onApprovedByChange,
  stayPurposeNote,
  onStayPurposeNoteChange,
  department,
  onDepartmentChange,
  showAuthority = false,
}: StayPurposeFieldsProps) {
  const nonRevenue = isNonRevenueStay(stayPurpose);

  if (showAuthority && !nonRevenue) {
    return null;
  }

  if (showAuthority) {
    return (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="approved-by"
            className="block font-semibold mb-2 text-slate-700 text-sm"
          >
            {t('reservations.stayPurpose.approvedBy')} *
          </label>
          <input
            id="approved-by"
            name="approvedBy"
            value={approvedBy}
            onChange={(event) => onApprovedByChange(event.target.value)}
            className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="stay-purpose-note"
            className="block font-semibold mb-2 text-slate-700 text-sm"
          >
            {t('reservations.stayPurpose.purpose')}
          </label>
          <input
            id="stay-purpose-note"
            name="stayPurposeNote"
            value={stayPurposeNote}
            onChange={(event) => onStayPurposeNoteChange(event.target.value)}
            className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
          />
        </div>
        {stayPurpose === 'HOUSE_USE' ? (
          <div>
            <label
              htmlFor="house-department"
              className="block font-semibold mb-2 text-slate-700 text-sm"
            >
              {t('reservations.stayPurpose.department')} *
            </label>
            <input
              id="house-department"
              name="department"
              value={department}
              onChange={(event) => onDepartmentChange(event.target.value)}
              className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
              required
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="stay-purpose"
        className="block font-semibold mb-2 text-slate-700 text-sm"
      >
        {t('reservations.stayPurpose.label')}
      </label>
      <select
        id="stay-purpose"
        name="stayPurpose"
        value={stayPurpose}
        onChange={(event) =>
          onStayPurposeChange(event.target.value as StayPurpose)
        }
        className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
      >
        <option value="STANDARD">
          {t('reservations.stayPurpose.standard')}
        </option>
        <option value="COMPLIMENTARY">
          {t('reservations.stayPurpose.complimentary')}
        </option>
        <option value="HOUSE_USE">
          {t('reservations.stayPurpose.houseUse')}
        </option>
      </select>
      <p className="mt-1 text-slate-500 text-xs">
        {t('reservations.stayPurpose.hint')}
      </p>
    </div>
  );
}
