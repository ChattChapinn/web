/**
 * Validation Schemas
 * Zod schemas for runtime validation of all inputs
 */

import { z } from 'zod';

// ============================================
// Username Validation
// ============================================

export const usernameSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(
    z.string()
      .min(2, 'El nombre de usuario debe tener al menos 2 caracteres')
      .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
      )
  );

// ============================================
// Room Validation
// ============================================

export const roomSchema = z
  .string()
  .min(1, 'El nombre de la sala es obligatorio')
  .max(50, 'El nombre de la sala no puede tener más de 50 caracteres')
  .regex(
    /^[a-zA-Z0-9_\- ]+$/,
    'El nombre de la sala solo puede contener letras, números, espacios, guiones y guiones bajos'
  )
  .transform((val) => val.trim());

// ============================================
// Message Validation
// ============================================

export const messageSchema = z
  .string()
  .min(1, 'El mensaje no puede estar vacío')
  .max(1000, 'El mensaje no puede tener más de 1000 caracteres')
  .transform((val) => val.trim())
  // Sanitize to prevent XSS
  .transform((val) => 
    val
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  );

// ============================================
// Join Room Payload Validation
// ============================================

export const joinRoomSchema = z.object({
  username: usernameSchema,
  room: roomSchema,
  avatar: z.string().max(20).optional(),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

// ============================================
// Chat Message Payload Validation
// ============================================

export const chatMessageSchema = z.object({
  content: messageSchema,
  timestamp: z.number().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// ============================================
// Validation Helper
// ============================================

import { ValidationError } from '../types/errors';
import { Result, success, failure } from '../types/errors';

export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Result<T, ValidationError> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const issues = result.error.issues;
    const firstError = issues[0];
    return failure(
      new ValidationError(
        firstError?.message ?? 'Error de validación',
        firstError?.path.join('.'),
        { errors: issues }
      )
    );
  }
  
  return success(result.data);
}

// Quick validators that return the data or throw
export const validators = {
  username: (value: unknown) => usernameSchema.parse(value),
  room: (value: unknown) => roomSchema.parse(value),
  message: (value: unknown) => messageSchema.parse(value),
  joinRoom: (value: unknown) => joinRoomSchema.parse(value),
} as const;
