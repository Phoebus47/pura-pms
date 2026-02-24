import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });

  it('should call super.canActivate', () => {
    const guard = new JwtAuthGuard();
    const mockContext = {} as ExecutionContext;

    // Mock the inherited canActivate from AuthGuard
    const superCanActivateSpy = vi
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);
  });
});
