import { z } from 'zod';
import { ApiError } from '../services/ApiError';




const role = z.enum(['CUSTOMER', 'MERCHANT']);
const language = z.enum(['en', 'pcm', 'yo', 'ig', 'ha']);
const displayName = z.string().trim().min(1).max(80);
const payoutEmail = z.string().email();


export const registerDeviceSchema = z
  .object({
    publicKey: z.string().min(1),
    displayName,
    role,
    language,
    payoutEmail: payoutEmail.nullable().optional(),
    proof: z.string().min(1),
  })
  .strict()
  .refine((body) => body.role !== 'MERCHANT' || Boolean(body.payoutEmail), {
    message: 'A merchant needs a payout email',
    path: ['payoutEmail'],
  })
  .transform((body) => ({ ...body, payoutEmail: body.payoutEmail ?? undefined }));


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