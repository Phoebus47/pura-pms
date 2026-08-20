import { Test, TestingModule } from '@nestjs/testing';
import { Tm30ReportsController } from './tm30-reports.controller';
import { Tm30ReportsService } from './tm30-reports.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  generate: vi.fn(),
  exportTsv: vi.fn(),
  submit: vi.fn(),
  confirm: vi.fn(),
  fail: vi.fn(),
};

describe('Tm30ReportsController', () => {
  let controller: Tm30ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Tm30ReportsController],
      providers: [{ provide: Tm30ReportsService, useValue: mockService }],
    }).compile();
    controller = module.get(Tm30ReportsController);
    vi.clearAllMocks();
  });

  it('lists reports', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ propertyId: 'prop-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({ propertyId: 'prop-1' });
  });

  it('generates reports', async () => {
    mockService.generate.mockResolvedValue({ created: [], skipped: [] });
    await controller.generate({
      propertyId: 'prop-1',
      generatedBy: 'user-1',
    });
    expect(mockService.generate).toHaveBeenCalled();
  });

  it('submits a report', async () => {
    await controller.submit('tm-1', { submittedBy: 'user-1' });
    expect(mockService.submit).toHaveBeenCalledWith('tm-1', {
      submittedBy: 'user-1',
    });
  });
});
