import { toast } from './toast';
import { toast as sonnerToast } from 'sonner';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    promise: jest.fn(),
  },
}));

describe('Toast Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
