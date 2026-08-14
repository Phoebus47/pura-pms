import { snapshotFolioCharges } from './folio-snapshot';

describe('snapshotFolioCharges', () => {
  it('should sum non-void charge lines only', () => {
    const snapshot = snapshotFolioCharges([
      {
        isVoid: false,
        sign: 1,
        amountNet: 1000,
        amountTax: 70,
        amountTotal: 1070,
      },
      {
        isVoid: false,
        sign: 1,
        amountNet: 500,
        amountTax: 35,
        amountTotal: 535,
      },
      {
        isVoid: false,
        sign: -1,
        amountNet: 200,
        amountTax: 0,
        amountTotal: 200,
      },
      {
        isVoid: true,
        sign: 1,
        amountNet: 80,
        amountTax: 6,
        amountTotal: 86,
      },
    ]);

    expect(snapshot).toEqual({
      amountNet: 1500,
      amountTax: 105,
      amountTotal: 1605,
    });
  });
});
