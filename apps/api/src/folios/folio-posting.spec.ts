import { computePostingAmounts } from './folio-posting';

describe('folio-posting', () => {
  it('adds 7% VAT on net plus service when hasTax is true', () => {
    expect(
      computePostingAmounts(1000, {
        type: 'CHARGE',
        hasService: true,
        serviceRate: 10,
        hasTax: true,
      }),
    ).toMatchObject({
      amountNet: 1000,
      amountService: 100,
      amountTax: 77,
      amountTotal: 1177,
    });
  });

  it('skips VAT when the reservation is tax-exempt', () => {
    expect(
      computePostingAmounts(
        1000,
        {
          type: 'CHARGE',
          hasService: true,
          serviceRate: 10,
          hasTax: true,
        },
        { taxExempt: true },
      ),
    ).toMatchObject({
      amountNet: 1000,
      amountService: 100,
      amountTax: 0,
      amountTotal: 1100,
    });
  });
});
