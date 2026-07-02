import { NovusError } from "./base";

/**
 * Developer-caused errors (e.g., incorrect API usage).
 * These should be caught during development and fixed.
 */
export class DeveloperError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("DEVELOPER_ERROR", message, context);
    Object.setPrototypeOf(this, DeveloperError.prototype);
  }
}

/**
 * Runtime errors that occur during execution (e.g., network failures).
 * These may be transient and could trigger retries.
 */
export class RuntimeError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("RUNTIME_ERROR", message, context);
    Object.setPrototypeOf(this, RuntimeError.prototype);
  }
}

/**
 * Validation errors for invalid input or state.
 */
export class ValidationError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Adapter-related errors (e.g., GitHub, Linear integration failures).
 */
export class AdapterError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("ADAPTER_ERROR", message, context);
    Object.setPrototypeOf(this, AdapterError.prototype);
  }
}

/**
 * AI generation failures (e.g., API errors, timeout).
 */
export class GenerationError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("GENERATION_ERROR", message, context);
    Object.setPrototypeOf(this, GenerationError.prototype);
  }
}

/**
 * Permission/authorization errors (e.g., insufficient scope).
 */
export class PermissionError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("PERMISSION_ERROR", message, context);
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Configuration errors (e.g., missing required env vars).
 */
export class ConfigError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("CONFIG_ERROR", message, context);
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

/**
 * Storage/persistence errors.
 */
export class StorageError extends NovusError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("STORAGE_ERROR", message, context);
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}
