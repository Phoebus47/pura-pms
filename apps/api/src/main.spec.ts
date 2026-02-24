import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
  Mock,
} from 'vitest';

// We don't mock at top level to allow resetModules to work cleanly with doMock
// vi.mock('@nestjs/core');

const mockApp = {
  enableCors: vi.fn(),
  useGlobalPipes: vi.fn(),
  listen: vi.fn(),
};

vi.mock('@nestjs/core', () => ({
  NestFactory: {
    create: vi.fn().mockResolvedValue(mockApp),
  },
}));

describe('Main Bootstrap', () => {
  let initialPort: string | undefined;
  let mockExit: Mock<typeof process.exit>;

  beforeAll(() => {
    initialPort = process.env.PORT;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockExit = vi
      .spyOn(process, 'exit')
      .mockImplementation((() => {}) as never);
  });

  afterAll(() => {
    process.env.PORT = initialPort;
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    // Setup default mock for NestFactory
    // The NestFactory mock is now at the top level, so we don't need doMock here.
    // We still need to mock app.module though.

    vi.doMock('./app.module', () => ({
      AppModule: class {},
    }));

    (mockApp.enableCors as unknown as ReturnType<typeof vi.fn>).mockClear();
    (mockApp.useGlobalPipes as unknown as ReturnType<typeof vi.fn>).mockClear();
    (mockApp.listen as unknown as ReturnType<typeof vi.fn>).mockClear();

    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;
  });

  afterEach(() => {
    vi.doUnmock('./app.module');
  });

  it('should bootstrap the application successfully', async () => {
    await import('./main.js');

    // Get the mocked NestFactory to check calls
    const { NestFactory } = await import('@nestjs/core');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createFn = NestFactory.create;
    expect(
      vi.isMockFunction(createFn) ? createFn : undefined,
    ).toHaveBeenCalled();

    expect(
      vi.isMockFunction(mockApp.enableCors) ? mockApp.enableCors : undefined,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        origin: expect.any(Array),
        credentials: true,
      }),
    );

    expect(
      vi.isMockFunction(mockApp.useGlobalPipes)
        ? mockApp.useGlobalPipes
        : undefined,
    ).toHaveBeenCalled();

    const mockCalls = (
      mockApp.listen as unknown as { mock: { calls: string[][] } }
    ).mock.calls;
    const listenPort = mockCalls[0] ? mockCalls[0][0] : undefined;
    expect(String(listenPort)).toBe('3001');
  }, 30000);

  it('should use PORT from env if defined', async () => {
    process.env.PORT = '4000';

    await import('./main.js');

    expect(mockApp.listen).toHaveBeenCalledWith('4000');
  }, 30000);

  it('should use CORS_ORIGIN from env if defined', async () => {
    process.env.CORS_ORIGIN = 'http://example.com,http://test.com';

    await import('./main.js');

    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: ['http://example.com', 'http://test.com'],
      }),
    );
  }, 30000);

  it('should handle bootstrap errors', async () => {
    const mockError = new Error('Bootstrap failed');

    // Override the mock for this specific test
    vi.doMock('@nestjs/core', () => ({
      NestFactory: {
        create: vi.fn().mockRejectedValue(mockError),
      },
    }));

    const consoleSpy = vi.spyOn(console, 'error');

    try {
      await import('./main.js');
    } catch {
      // ignore
    }

    // Wait for promise rejection handling
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    expect(mockExit).toHaveBeenCalledWith(1);
  }, 30000);
});
