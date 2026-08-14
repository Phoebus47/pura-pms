import { Test, TestingModule } from '@nestjs/testing';
import { ArAccountsController } from './ar-accounts.controller';
import { ArAccountsService } from './ar-accounts.service';

const mockArAccountsService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  aging: vi.fn(),
  getStatement: vi.fn(),
  renderStatementHtml: vi.fn(),
  transfer: vi.fn(),
};

describe('ArAccountsController', () => {
  let controller: ArAccountsController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArAccountsController],
      providers: [
        { provide: ArAccountsService, useValue: mockArAccountsService },
      ],
    }).compile();
    controller = module.get<ArAccountsController>(ArAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list accounts for a property', async () => {
    const rows = [{ id: 'ar-1' }];
    mockArAccountsService.findAll.mockResolvedValue(rows);

    const result = await controller.findAll({ propertyId: 'prop-1' });

    expect(result).toEqual(rows);
    expect(mockArAccountsService.findAll).toHaveBeenCalledWith('prop-1');
  });

  it('should create an account', async () => {
    const dto = {
      propertyId: 'prop-1',
      companyName: 'Acme',
      creditLimit: 50000,
    };
    const created = { id: 'ar-1', ...dto };
    mockArAccountsService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(result).toEqual(created);
    expect(mockArAccountsService.create).toHaveBeenCalledWith(dto);
  });

  it('should return aging and a JSON statement', async () => {
    mockArAccountsService.aging.mockResolvedValue({ current: 10 });
    mockArAccountsService.getStatement.mockResolvedValue({
      asOf: '2026-08-14',
    });

    await controller.aging('ar-1', { asOf: '2026-08-14' });
    await controller.statement('ar-1', { asOf: '2026-08-14' });

    expect(mockArAccountsService.aging).toHaveBeenCalledWith(
      'ar-1',
      '2026-08-14',
    );
    expect(mockArAccountsService.getStatement).toHaveBeenCalledWith(
      'ar-1',
      '2026-08-14',
    );
  });

  it('should return HTML statement markup', async () => {
    mockArAccountsService.getStatement.mockResolvedValue({
      asOf: '2026-08-14',
    });
    mockArAccountsService.renderStatementHtml.mockReturnValue('<html></html>');

    const result = await controller.statementHtml('ar-1', {});

    expect(result).toBe('<html></html>');
  });

  it('should transfer a folio to city ledger', async () => {
    const dto = { folioId: 'fol-1', userId: 'user-1' };
    mockArAccountsService.transfer.mockResolvedValue({ id: 'inv-1' });

    const result = await controller.transfer('ar-1', dto);

    expect(result).toEqual({ id: 'inv-1' });
    expect(mockArAccountsService.transfer).toHaveBeenCalledWith('ar-1', dto);
  });

  it('should update an account', async () => {
    mockArAccountsService.update.mockResolvedValue({ id: 'ar-1' });
    await controller.update('ar-1', { companyName: 'New' });
    expect(mockArAccountsService.update).toHaveBeenCalledWith('ar-1', {
      companyName: 'New',
    });
  });
});
