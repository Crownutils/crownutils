import pino from 'pino';
import { config } from '@/core/config/index.js';

/** App-wide pino logger: pretty `debug` output in development, JSON `info`+ in production. */
export const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  ...(!config.isProduction && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});
