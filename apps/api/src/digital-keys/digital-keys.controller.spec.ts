import { Test, TestingModule } from '@nestjs/testing';
import { DigitalKeysController } from './digital-keys.controller';
import { DigitalKeysService } from './digital-keys.service';

const mockService = {
  findAll: vi.fn(),
  findOne: vi.fn(),
  issue: vi.fn(),
  issueByConfirmNumber: vi.fn(),
  revoke: vi.fn(),
};

describe('DigitalKeysController', () => {
  let controller: DigitalKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalKeysController],
      providers: [{ provide: DigitalKeysService, useValue: mockService }],
    }).compile();
    controller = module.get(DigitalKeysController);
    vi.clearAllMocks();
  });

  it('lists digital keys', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll({ reservationId: 'res-1' });
    expect(mockService.findAll).toHaveBeenCalledWith({
      reservationId: 'res-1',
    });
  });

  it('fetches a single digital key', async () => {
    mockService.findOne.mockResolvedValue({ id: 'dk-1' });
    await controller.findOne('dk-1');
    expect(mockService.findOne).toHaveBeenCalledWith('dk-1');
  });

  it('issues a digital key by reservation id', async () => {
    mockService.issue.mockResolvedValue({ id: 'dk-1' });
    await controller.issue({ reservationId: 'res-1', issuedBy: 'usr-1' });
    expect(mockService.issue).toHaveBeenCalledWith({
      reservationId: 'res-1',
      issuedBy: 'usr-1',
    });
  });

  it('issues a digital key by confirmation number', async () => {
    mockService.issueByConfirmNumber.mockResolvedValue({ id: 'dk-1' });
    await controller.issueByConfirmNumber({
      confirmNumber: 'CN-1',
      issuedBy: 'usr-1',
    });
    expect(mockService.issueByConfirmNumber).toHaveBeenCalledWith({
      confirmNumber: 'CN-1',
      issuedBy: 'usr-1',
    });
  });

  it('revokes a digital key', async () => {
    mockService.revoke.mockResolvedValue({ id: 'dk-1', status: 'REVOKED' });
    await controller.revoke('dk-1', { revokedBy: 'usr-1' });
    expect(mockService.revoke).toHaveBeenCalledWith('dk-1', {
      revokedBy: 'usr-1',
    });
  });
});
