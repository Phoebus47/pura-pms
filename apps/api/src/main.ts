import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Use 3001 by default to avoid clashing with Next.js dev server (3000)
  await app.listen(process.env.PORT ?? 3001);
  console.log(
    `🚀 API Server running on http://localhost:${process.env.PORT ?? 3001}`,
  );
}

bootstrap().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
