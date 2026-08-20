import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  assertCanClose,
  assertCanResolve,
  assertCanStart,
} from './guest-complaints-rules';

describe('guest-complaints-rules', () => {
  it('allows start only while OPEN', () => {
    expect(() => assertCanStart('OPEN')).not.toThrow();
    expect(() => assertCanStart('IN_PROGRESS')).toThrow(BadRequestException);
    expect(() => assertCanStart('RESOLVED')).toThrow(BadRequestException);
  });

  it('allows resolve while OPEN or IN_PROGRESS', () => {
    expect(() => assertCanResolve('OPEN')).not.toThrow();
    expect(() => assertCanResolve('IN_PROGRESS')).not.toThrow();
    expect(() => assertCanResolve('RESOLVED')).toThrow(BadRequestException);
    expect(() => assertCanResolve('CLOSED')).toThrow(BadRequestException);
  });

  it('allows close only while RESOLVED', () => {
    expect(() => assertCanClose('RESOLVED')).not.toThrow();
    expect(() => assertCanClose('OPEN')).toThrow(BadRequestException);
    expect(() => assertCanClose('IN_PROGRESS')).toThrow(BadRequestException);
  });
});
