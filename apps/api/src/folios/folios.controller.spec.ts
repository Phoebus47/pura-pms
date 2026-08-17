import { Test, TestingModule } from '@nestjs/testing';
import { FoliosController } from './folios.controller';
import { FoliosService } from './folios.service';
import { FolioStatus } from '@pura/database';
import { CreateFolioDto } from './dto/create-folio.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';

const mockFoliosService = {
  create: vi.fn(),
  findMany: vi.fn(),
  findOne: vi.fn(),
  findByReservationId: vi.fn(),
  postTransaction: vi.fn(),
  voidTransaction: vi.fn(),
  checkout: vi.fn(),
  reopen: vi.fn(),
  setCreditLimit: vi.fn(),
  setArAccount: vi.fn(),
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

  describe('findMany', () => {
    it('should list folios by query', async () => {
      mockFoliosService.findMany.mockResolvedValue([]);

      await controller.findMany({
        propertyId: 'prop-1',
        status: FolioStatus.OPEN,
      });

      expect(mockFoliosService.findMany).toHaveBeenCalledWith({
        propertyId: 'prop-1',
        status: FolioStatus.OPEN,
      });
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

  describe('checkout', () => {
    it('should checkout a folio', async () => {
      mockFoliosService.checkout.mockResolvedValue({ id: 'folio-1' });

      await controller.checkout('folio-1', { userId: 'user-1' });

      expect(mockFoliosService.checkout).toHaveBeenCalledWith(
        'folio-1',
        'user-1',
      );
    });
  });

  describe('reopen', () => {
    it('should reopen a folio', async () => {
      mockFoliosService.reopen.mockResolvedValue({
        id: 'folio-1',
        status: FolioStatus.OPEN,
      });

      await controller.reopen('folio-1');

      expect(mockFoliosService.reopen).toHaveBeenCalledWith('folio-1');
    });
  });

  describe('setCreditLimit', () => {
    it('should patch the folio credit limit', async () => {
      mockFoliosService.setCreditLimit.mockResolvedValue({
        id: 'folio-1',
        creditLimit: 2000,
      });

      await controller.setCreditLimit('folio-1', { creditLimit: 2000 });

      expect(mockFoliosService.setCreditLimit).toHaveBeenCalledWith(
        'folio-1',
        2000,
      );
    });
  });

  describe('setArAccount', () => {
    it('should patch the folio AR account', async () => {
      mockFoliosService.setArAccount.mockResolvedValue({
        id: 'folio-1',
        arAccountId: 'ar-1',
      });

      await controller.setArAccount('folio-1', { arAccountId: 'ar-1' });

      expect(mockFoliosService.setArAccount).toHaveBeenCalledWith(
        'folio-1',
        'ar-1',
      );
    });
  });
});
