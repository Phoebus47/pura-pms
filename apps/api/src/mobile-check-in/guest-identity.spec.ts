import { BadRequestException } from '@nestjs/common';
import { assertLastNameMatches } from './guest-identity';

describe('assertLastNameMatches', () => {
  it('allows lookup when no last name is provided', () => {
    expect(() => assertLastNameMatches('Doe', undefined)).not.toThrow();
    expect(() => assertLastNameMatches('Doe', '')).not.toThrow();
    expect(() => assertLastNameMatches('Doe', '   ')).not.toThrow();
  });

  it('allows lookup when last name matches case-insensitively', () => {
    expect(() => assertLastNameMatches('Doe', 'doe')).not.toThrow();
    expect(() => assertLastNameMatches(' Doe ', 'DOE')).not.toThrow();
  });

  it('rejects lookup when last name does not match', () => {
    expect(() => assertLastNameMatches('Doe', 'Smith')).toThrow(
      BadRequestException,
    );
  });
});
