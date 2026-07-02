/**
 * Base error class for all Novus errors.
 * Provides structured error handling with code, message, and context.
 */
export class NovusError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "NovusError";
    Object.setPrototypeOf(this, NovusError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}
