import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        serializers: {
          req: (req: {
            id?: string;
            method?: string;
            url?: string;
            query?: unknown;
          }) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
          }),
          res: (res: { statusCode?: number }) => ({
            statusCode: res.statusCode,
          }),
          err: pino.stdSerializers.err,
        },
      },
    }),
  ],
})
export class LoggerModule {}
