import pino, { Logger as PinoLogger } from "pino";

/**
 * Main logger instance.
 * Configure level based on NOVUS_LOG_LEVEL environment variable.
 */
let logger: PinoLogger;

function getLogger(): PinoLogger {
  if (!logger) {
    // Dynamically import env to avoid circular dependencies
    const logLevel = process.env.NOVUS_LOG_LEVEL || "info";

    logger = pino({
      level: logLevel as pino.LevelWithSilent,
      base: { service: "novus" },
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: false,
          translateTime: "SYS:standard",
        },
      },
    });
  }
  return logger;
}

/**
 * Get the root logger instance.
 */
export function getRootLogger(): PinoLogger {
  return getLogger();
}

/**
 * Create a child logger with a specific package/module name.
 * Use this in all packages: `const logger = createLogger('package-name')`
 */
export function createLogger(name: string): PinoLogger {
  return getLogger().child({ package: name });
}

/**
 * Re-export pino's BaseLogger type for type definitions.
 */
export type { Logger as PinoLogger } from "pino";

export default getRootLogger();
