import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

type MockApp = Partial<NestExpressApplication>;

const mockApp: MockApp = {
  enableCors: jest.fn(),
  useGlobalPipes: jest.fn(),
  listen: jest.fn(),
};

describe('Main Bootstrap', () => {
  let initialPort: string | undefined;

  let mockExit: jest.SpyInstance<never, any>;

  beforeAll(() => {
    initialPort = process.env.PORT;
    // Suppress console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock process.exit globally to prevent exit

    mockExit = jest
      .spyOn(process, 'exit')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      .mockImplementation((() => {}) as any);
  });

  afterAll(() => {
    process.env.PORT = initialPort;
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (mockApp.enableCors as jest.Mock).mockClear();
    (mockApp.useGlobalPipes as jest.Mock).mockClear();
    (mockApp.listen as jest.Mock).mockClear();
    (NestFactory.create as jest.Mock).mockClear().mockResolvedValue(mockApp);
    // Ensure mock exit is cleared but implementation remains
    mockExit.mockClear();
    delete process.env.PORT;
  });

  it('should bootstrap the application successfully', async () => {
    // We import main here to trigger execution
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./main');
    });

    // Allow async import to complete
    await new Promise((resolve) => setImmediate(resolve));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        origin: expect.any(Array),
        credentials: true,
      }),
    );

    expect(mockApp.enableCors).toHaveBeenCalledTimes(1);
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({ isTransformEnabled: true }),
    );

    // Check validation pipe options
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const validationPipe =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (mockApp.useGlobalPipes as jest.Mock).mock.calls[0][0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(validationPipe.isTransformEnabled).toBe(true);

    // Verify listen called with 3001 (string or number)
    // Verify listen called with 3001 (string or number)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const listenPort = (mockApp.listen as jest.Mock).mock.calls[0][0];
    expect(String(listenPort)).toBe('3001');
  });

  it('should use PORT from env if defined', async () => {
    jest.resetModules();
    process.env.PORT = '4000';

    // Re-import NestFactory to configure the mock for this module run
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const { NestFactory } = require('@nestjs/core');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./main');
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockApp.listen).toHaveBeenCalledWith('4000');
  });

  it('should use CORS_ORIGIN from env if defined', async () => {
    jest.resetModules();
    process.env.CORS_ORIGIN = 'http://example.com,http://test.com';

    // Re-import NestFactory
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const { NestFactory } = require('@nestjs/core');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./main');
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: ['http://example.com', 'http://test.com'],
      }),
    );
    delete process.env.CORS_ORIGIN;
  });

  it('should handle bootstrap errors', async () => {
    jest.resetModules();
    // Re-import NestFactory
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
    const { NestFactory } = require('@nestjs/core');
    const mockError = new Error('Bootstrap failed');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (NestFactory.create as jest.Mock).mockRejectedValueOnce(mockError);

    const consoleSpy = jest.spyOn(console, 'error');

    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./main');
      });
      await new Promise((resolve) => setImmediate(resolve));
    } catch {
      // ignore
    }

    // Wait for the promise rejection handeld in main.ts
    await new Promise((resolve) => process.nextTick(resolve));

    expect(consoleSpy).toHaveBeenCalledWith(mockError);

    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
