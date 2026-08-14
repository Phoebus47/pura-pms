import { Test, TestingModule } from '@nestjs/testing';
import { ArInvoicesController } from './ar-invoices.controller';
import { ArAccountsService } from './ar-accounts.service';

const mockArAccountsService = {
  findInvoices: vi.fn(),
  findInvoice: vi.fn(),
  allocatePayment: vi.fn(),
};

describe('ArInvoicesController', () => {
  let controller: ArInvoicesController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArInvoicesController],
      providers: [
        { provide: ArAccountsService, useValue: mockArAccountsService },
      ],
    }).compile();
    controller = module.get<ArInvoicesController>(ArInvoicesController);
  });

  it('should list invoices', async () => {
    const rows = [{ id: 'inv-1' }];
    mockArAccountsService.findInvoices.mockResolvedValue(rows);

    const result = await controller.findAll({
      propertyId: 'prop-1',
      arAccountId: 'ar-1',
    });

    expect(result).toEqual(rows);
    expect(mockArAccountsService.findInvoices).toHaveBeenCalledWith(
      'prop-1',
      'ar-1',
    );
  });

  it('should return one invoice', async () => {
    mockArAccountsService.findInvoice.mockResolvedValue({ id: 'inv-1' });
    const result = await controller.findOne('inv-1');
    expect(result).toEqual({ id: 'inv-1' });
  });

  it('should allocate a payment', async () => {
    const dto = {
      amount: 50,
      method: 'BANK_TRANSFER',
      paidBy: 'user-1',
      businessDate: '2026-08-14',
    };
    mockArAccountsService.allocatePayment.mockResolvedValue({ id: 'inv-1' });

    const result = await controller.allocate('inv-1', dto);

    expect(result).toEqual({ id: 'inv-1' });
    expect(mockArAccountsService.allocatePayment).toHaveBeenCalledWith(
      'inv-1',
      dto,
    );
  });
});
