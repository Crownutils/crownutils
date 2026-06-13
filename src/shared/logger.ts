import pino from 'pino';
import { env } from '@/core/config/index.js';

const isProduction = env.isProduction;

/** Application-wide pino logger; pretty-printed outside production. */
export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
});
