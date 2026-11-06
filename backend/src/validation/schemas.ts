import { z } from 'zod';
import { ApiError } from '../services/ApiError';




const language = z.enum(['en', 'pcm', 'yo', 'ig', 'ha']);
const displayName = z.string().trim().min(1).max(80);
const payoutEmail = z.string().email();


export const registerDeviceSchema = z
  .object({
    publicKey: z.string().min(1),
    displayName,
    language,
    payoutEmail: payoutEmail,
    proof: z.string().min(1),
  })
  .strict();

  
export const updateProfileSchema = z
  .object({
    displayName: displayName.optional(),
    language: language.optional(),
    payoutEmail: payoutEmail.optional(),
  })
  .strict();

  
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError('VALIDATION_FAILED', result.error.issues[0]?.message ?? 'Invalid request');
  }
  return result.data;
}