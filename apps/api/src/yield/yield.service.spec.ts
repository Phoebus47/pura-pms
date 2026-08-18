import { YieldService } from './yield.service';
import { PrismaService } from '../prisma/prisma.service';
import * as ops from './yield-ops';

vi.mock('./yield-ops', () => ({
  getPace: vi.fn(),
  generateRecommendations: vi.fn(),
  listRecommendations: vi.fn(),
  applyRecommendation: vi.fn(),
  dismissRecommendation: vi.fn(),
  createCompetitorRate: vi.fn(),
  listCompetitorRates: vi.fn(),
  updateCompetitorRate: vi.fn(),
}));

describe('YieldService', () => {
  const prisma = {} as PrismaService;
  const service = new YieldService(prisma);

  it('delegates pace and generate to ops', async () => {
    vi.mocked(ops.getPace).mockResolvedValue({
      from: '2026-08-18',
      to: '2026-08-31',
      days: [],
    });
    await service.getPace('prop-1');
    expect(ops.getPace).toHaveBeenCalledWith(
      prisma,
      'prop-1',
      undefined,
      undefined,
    );
    await service.generateRecommendations('prop-1');
    expect(ops.generateRecommendations).toHaveBeenCalledWith(prisma, 'prop-1');
  });
});
