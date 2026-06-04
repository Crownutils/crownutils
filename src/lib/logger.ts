import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Application-wide logger.
 * In development: pretty, colorized, human-readable output.
 * In production: raw JSON for performance and log aggregation.
 */
export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  // In dev we want debug-level verbosity; in prod, info and above.

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
