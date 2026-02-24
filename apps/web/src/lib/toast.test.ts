import { toast } from './toast';
import { toast as sonnerToast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    promise: vi.fn(),
  },
}));

describe('Toast Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls success', () => {
    toast.success('test');
    expect(sonnerToast.success).toHaveBeenCalledWith('test');
  });

  it('calls error', () => {
    toast.error('test');
    expect(sonnerToast.error).toHaveBeenCalledWith('test');
  });

  it('calls info', () => {
    toast.info('test');
    expect(sonnerToast.info).toHaveBeenCalledWith('test');
  });

  it('calls warning', () => {
    toast.warning('test');
    expect(sonnerToast.warning).toHaveBeenCalledWith('test');
  });

  it('calls promise', () => {
    const promise = Promise.resolve();
    const config = { loading: 'Loading', success: 'Done', error: 'Error' };
    toast.promise(promise, config);
    expect(sonnerToast.promise).toHaveBeenCalledWith(promise, config);
  });
});
