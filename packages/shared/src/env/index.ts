import { z } from "zod";

/**
 * Environment variables schema using Zod for validation.
 * Validates and parses environment variables at startup.
 * Missing required variables will throw immediately with clear error messages.
 */
const EnvSchema = z.object({
  NOVUS_AI_PROVIDER: z
    .enum(["anthropic", "openai", "mock"])
    .default("mock")
    .describe(
      "AI provider to use (anthropic, openai, or mock for development)",
    ),

  NOVUS_AI_API_KEY: z
    .string()
    .optional()
    .describe("API key for the AI provider (required if not using mock)"),

  NOVUS_LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info")
    .describe("Logging level"),

  NOVUS_ENV: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("Deployment environment"),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Parsed and validated environment variables.
 * Throws immediately on startup if validation fails.
 */
let parsedEnv: Env | null = null;

/**
 * Get the parsed environment variables.
 * Validates on first access and caches the result.
 */
export function getEnv(): Env {
  if (!parsedEnv) {
    try {
      parsedEnv = EnvSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Environment validation failed:");
        error.errors.forEach((err) => {
          console.error(`  ${err.path.join(".")}: ${err.message}`);
        });
      }
      throw error;
    }
  }
  return parsedEnv;
}

/**
 * Convenience export for direct destructuring.
 * Usage: import { env } from '@novus/shared'
 */
export const env = getEnv();
