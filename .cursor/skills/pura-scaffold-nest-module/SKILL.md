---
name: pura-scaffold-nest-module
description: Scaffolds a new NestJS module in PURA with consistent structure (module/controller/service/dtos/specs) and registers it in AppModule when needed. Use when creating a new API domain (e.g., housekeeping, rates, shift management endpoints) under apps/api/src/**.
---

# PURA Scaffold — NestJS Module

Goal: create a **new API module** quickly while matching repo conventions.

## Output (expected files)

For a module name `<domain>` (kebab folder, e.g. `housekeeping`, `rate-plans`):

- `apps/api/src/<domain>/<domain>.module.ts`
- `apps/api/src/<domain>/<domain>.controller.ts`
- `apps/api/src/<domain>/<domain>.service.ts`
- `apps/api/src/<domain>/dto/create-<domain>.dto.ts`
- `apps/api/src/<domain>/dto/update-<domain>.dto.ts`
- `apps/api/src/<domain>/<domain>.controller.spec.ts`
- `apps/api/src/<domain>/<domain>.service.spec.ts`

Optional:

- `apps/api/src/<domain>/entities/<domain>.entity.ts` (only if you maintain explicit API entities; otherwise rely on Prisma types)
- `apps/api/src/<domain>/processors/<domain>.processor.ts` (BullMQ jobs)
- `apps/api/src/<domain>/processors/<domain>.processor.spec.ts`

## Step-by-step workflow

### 1) Decide the contract

- Controller base route: `@Controller('<domain>')`
- Auth: determine if routes require `JwtAuthGuard`
- DTOs: define create/update/filter DTOs with `class-validator`
- Status codes: pick 201 for create, 200 for reads/updates, 409 for domain conflicts

### 2) Implement the module wiring

Use the standard pattern:

- `controller` calls service
- `service` injects `PrismaService`
- keep business logic in service

### 3) Add tests (minimum baseline)

Service spec should cover:

- happy path
- not found
- conflict (if any)
- validation edge case (if service does parsing or assumptions)

Controller spec should cover:

- route method wiring + status codes (mock service)

### 4) Register the module

- If this is a top-level module, add it to `apps/api/src/app.module.ts` `imports: []`.
- If it belongs under another module, import it there instead.

## Templates (copy and adapt)

### `<domain>.module.ts`

```ts
import { Module } from '@nestjs/common';
import { <Domain>Controller } from './<domain>.controller';
import { <Domain>Service } from './<domain>.service';

@Module({
  controllers: [<Domain>Controller],
  providers: [<Domain>Service],
  exports: [<Domain>Service],
})
export class <Domain>Module {}
```

### `<domain>.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class <Domain>Service {
  constructor(private readonly prisma: PrismaService) {}
}
```

### `<domain>.controller.ts`

```ts
import { Controller } from '@nestjs/common';
import { <Domain>Service } from './<domain>.service';

@Controller('<domain>')
export class <Domain>Controller {
  constructor(private readonly service: <Domain>Service) {}
}
```

### DTOs

```ts
import { IsOptional, IsString } from 'class-validator';

export class Create<Domain>Dto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
```

## Done checklist

- [ ] New module compiles
- [ ] DTOs validate via global ValidationPipe
- [ ] Controllers are thin; service owns logic
- [ ] Specs exist and pass for new module
- [ ] Module is registered (AppModule or parent module)
