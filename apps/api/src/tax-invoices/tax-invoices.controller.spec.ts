import { Test, TestingModule } from '@nestjs/testing';
import { TaxInvoicesController } from './tax-invoices.controller';
import { TaxInvoicesService } from './tax-invoices.service';

const mockTaxInvoicesService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  issue: vi.fn(),
  void: vi.fn(),
};

describe('TaxInvoicesController', () => {
  let controller: TaxInvoicesController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxInvoicesController],
      providers: [
        {
          provide: TaxInvoicesService,
          useValue: mockTaxInvoicesService,
        },
      ],
    }).compile();
    controller = module.get<TaxInvoicesController>(TaxInvoicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list invoices for a property', async () => {
    const rows = [{ id: 'ti-1' }];
    mockTaxInvoicesService.findAll.mockResolvedValue(rows);

    const result = await controller.findAll({
      propertyId: 'prop-1',
      businessDate: '2026-08-14',
    });

    expect(result).toEqual(rows);
    expect(mockTaxInvoicesService.findAll).toHaveBeenCalledWith(
      'prop-1',
      '2026-08-14',
    );
  });

  it('should return one invoice', async () => {
    const invoice = { id: 'ti-1' };
    mockTaxInvoicesService.findOne.mockResolvedValue(invoice);

    const result = await controller.findOne('ti-1');

    expect(result).toEqual(invoice);
    expect(mockTaxInvoicesService.findOne).toHaveBeenCalledWith('ti-1');
  });

  it('should issue an invoice', async () => {
    const dto = {
      folioId: 'fol-1',
      taxId: '1234567890123',
      issuedBy: 'user-1',
    };
    const created = { id: 'ti-1', ...dto };
    mockTaxInvoicesService.issue.mockResolvedValue(created);

    const result = await controller.issue(dto);

    expect(result).toEqual(created);
    expect(mockTaxInvoicesService.issue).toHaveBeenCalledWith(dto);
  });

  it('should void an invoice', async () => {
    const dto = { reason: 'Wrong tax id', voidedBy: 'user-1' };
    const voided = { id: 'ti-1', status: 'VOID' };
    mockTaxInvoicesService.void.mockResolvedValue(voided);

    const result = await controller.voidInvoice('ti-1', dto);

    expect(result).toEqual(voided);
    expect(mockTaxInvoicesService.void).toHaveBeenCalledWith('ti-1', dto);
  });
});
