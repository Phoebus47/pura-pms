import { Test, TestingModule } from '@nestjs/testing';
import { FoliosController } from './folios.controller';
import { FoliosService } from './folios.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';

const mockFoliosService = {
  create: vi.fn(),
  findOne: vi.fn(),
  findByReservationId: vi.fn(),
  postTransaction: vi.fn(),
  voidTransaction: vi.fn(),
};

describe('FoliosController', () => {
  let controller: FoliosController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoliosController],
      providers: [
        {
          provide: FoliosService,
          useValue: mockFoliosService,
        },
      ],
    }).compile();

    controller = module.get<FoliosController>(FoliosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a folio', async () => {
      const dto: CreateFolioDto = { reservationId: 'res-1' };
      mockFoliosService.create.mockResolvedValue({ id: 'folio-1', ...dto });

      await controller.create(dto);

      expect(mockFoliosService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should find one folio', async () => {
      mockFoliosService.findOne.mockResolvedValue({ id: 'folio-1' });

      await controller.findOne('folio-1');

      expect(mockFoliosService.findOne).toHaveBeenCalledWith('folio-1');
    });
  });

  describe('findByReservationId', () => {
    it('should find folios by reservation', async () => {
      mockFoliosService.findByReservationId.mockResolvedValue([]);

      await controller.findByReservationId('res-1');

      expect(mockFoliosService.findByReservationId).toHaveBeenCalledWith(
        'res-1',
      );
    });
  });

  describe('postTransaction', () => {
    it('should post a transaction', async () => {
      const dto: PostTransactionDto = {
        windowNumber: 1,
        trxCodeId: 'trx-1',
        amountNet: 500,
        userId: 'user-1',
        businessDate: '2025-01-15',
      };
      mockFoliosService.postTransaction.mockResolvedValue({ id: 'txn-1' });

      await controller.postTransaction('folio-1', dto);

      expect(mockFoliosService.postTransaction).toHaveBeenCalledWith(
        'folio-1',
        dto,
      );
    });
  });

  describe('voidTransaction', () => {
    it('should void a transaction', async () => {
      const dto: VoidTransactionDto = {
        userId: 'user-1',
        reasonCodeId: 'reason-1',
      };
      mockFoliosService.voidTransaction.mockResolvedValue({
        id: 'trx-void',
      });

      await controller.voidTransaction('trx-1', dto);

      expect(mockFoliosService.voidTransaction).toHaveBeenCalledWith(
        'trx-1',
        dto,
      );
    });
  });
});
