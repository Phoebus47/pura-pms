import { t } from '@/lib/i18n';
import type { TaxExemptReason } from '@/lib/tax-exemption';
import { TAX_EXEMPT_REASONS } from '@/lib/tax-exemption';

interface TaxExemptFieldsProps {
  readonly taxExempt: boolean;
  readonly onTaxExemptChange: (value: boolean) => void;
  readonly taxExemptReason: TaxExemptReason;
  readonly onTaxExemptReasonChange: (value: TaxExemptReason) => void;
  readonly taxExemptDocumentRef: string;
  readonly onTaxExemptDocumentRefChange: (value: string) => void;
  readonly taxExemptApprovedBy: string;
  readonly onTaxExemptApprovedByChange: (value: string) => void;
  readonly showDetails?: boolean;
}

export function TaxExemptFields({
  taxExempt,
  onTaxExemptChange,
  taxExemptReason,
  onTaxExemptReasonChange,
  taxExemptDocumentRef,
  onTaxExemptDocumentRefChange,
  taxExemptApprovedBy,
  onTaxExemptApprovedByChange,
  showDetails = false,
}: TaxExemptFieldsProps) {
  if (showDetails && !taxExempt) {
    return null;
  }

  if (showDetails) {
    return (
      <div className="space-y-4">
        <div>
          <label
            htmlFor="tax-exempt-reason"
            className="block font-semibold mb-2 text-foreground text-sm"
          >
            {t('reservations.taxExempt.reason')} *
          </label>
          <select
            id="tax-exempt-reason"
            name="taxExemptReason"
            value={taxExemptReason}
            onChange={(event) =>
              onTaxExemptReasonChange(event.target.value as TaxExemptReason)
            }
            className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
            required
          >
            {TAX_EXEMPT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {t(`reservations.taxExempt.${reasonKey(reason)}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="tax-exempt-document"
            className="block font-semibold mb-2 text-foreground text-sm"
          >
            {t('reservations.taxExempt.documentRef')} *
          </label>
          <input
            id="tax-exempt-document"
            name="taxExemptDocumentRef"
            value={taxExemptDocumentRef}
            onChange={(event) =>
              onTaxExemptDocumentRefChange(event.target.value)
            }
            className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
            required
          />
        </div>
        <div>
          <label
            htmlFor="tax-exempt-approved-by"
            className="block font-semibold mb-2 text-foreground text-sm"
          >
            {t('reservations.taxExempt.approvedBy')} *
          </label>
          <input
            id="tax-exempt-approved-by"
            name="taxExemptApprovedBy"
            value={taxExemptApprovedBy}
            onChange={(event) =>
              onTaxExemptApprovedByChange(event.target.value)
            }
            className="border border-slate-300 focus:border-pura-blue focus:ring-4 focus:ring-pura-blue/10 outline-none px-4 py-3 rounded-xl transition-all w-full"
            required
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="cursor-pointer flex gap-3 items-start min-h-11">
        <input
          id="tax-exempt"
          name="taxExempt"
          type="checkbox"
          checked={taxExempt}
          onChange={(event) => onTaxExemptChange(event.target.checked)}
          className="border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pura-blue h-4 mt-1 rounded text-pura-blue w-4"
        />
        <span>
          <span className="block font-semibold text-foreground text-sm">
            {t('reservations.taxExempt.checkbox')}
          </span>
          <span className="block mt-1 text-muted-foreground text-xs">
            {t('reservations.taxExempt.hint')}
          </span>
        </span>
      </label>
    </div>
  );
}

function reasonKey(reason: TaxExemptReason): string {
  if (reason === 'INTERNATIONAL_ORG') {
    return 'internationalOrg';
  }
  if (reason === 'DIPLOMATIC') {
    return 'diplomatic';
  }
  if (reason === 'GOVERNMENT') {
    return 'government';
  }
  return 'other';
}
