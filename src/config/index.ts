/**
 * Application Configuration
 * Centralized configuration with environment variable validation
 */

import { z } from 'zod';

// Environment schema with validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.union([z.string(), z.number()]).default('3000').transform((v) => {
    const n = Number(v);
    if (!n) return 3000;
    // On Render, respect the assigned PORT
    if (process.env.RENDER) return n;
    // In local dev / AI Studio preview environment, ensure port 3000
    return (n === 8080) ? 3000 : n;
  }),
  
  // Redis configuration for scaling (optional)
  REDIS_URL: z.string().url().optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // Security
  CORS_ORIGIN: z.string().default('*'),
  
  // Timezone
  DEFAULT_TIMEZONE: z.string().default('Asia/Dhaka'),
});

// Parse and validate environment variables
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  
  return result.data;
};

// Configuration shape
const createConfig = () => ({
  env: parseEnv(),
  
  app: {
    name: 'ManiaChat',
    botName: 'Bot de ManiaChat',
    version: '1.0.0',
  } as const,
  
  socket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    maxBufferSize: 5e6, // 5MB for image support
  } as const,
  
  rateLimit: {
    messagesPerMinute: 30,
    joinAttemptsPerMinute: 5,
  } as const,
});

// Immutable configuration object
export const config = Object.freeze(createConfig());

// Type exports
export type Config = typeof config;
export type Environment = z.infer<typeof envSchema>;
