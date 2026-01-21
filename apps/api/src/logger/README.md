# Logger Module

This module provides structured logging using Pino for the NestJS application.

## Usage

The logger is automatically available in all services and controllers via dependency injection.

### In Services/Controllers

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Info message');
    this.logger.error('Error message', error.stack);
    this.logger.warn('Warning message');
    this.logger.debug('Debug message');
  }
}
```

### Log Levels

- **Development:** `debug` level with pretty-printed output
- **Production:** `info` level with JSON structured output

### Configuration

Logger configuration is in `apps/api/src/logger/logger.module.ts`.
