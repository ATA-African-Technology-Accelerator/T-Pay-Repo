import { z } from 'zod';
import { ApiError } from '../services/ApiError';




const MAX_VAULT_NGN_MINOR = 1_000_000_000;
const MAX_SPEND_HOURS = 24;

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



export const listTransactionsQuerySchema = z
  .object({ since: z.string().regex(/^\d+$/).optional() })
  .strict();

  
  
export const createVaultSchema = z
  .object({
    amountNgnMinor: z.number().int().positive().max(MAX_VAULT_NGN_MINOR),
    durationHours: z.number().int().min(1).max(MAX_SPEND_HOURS),
  })
  .strict();


export const paypalReturnQuerySchema = z.object({
  vaultId: z.string().min(1),
  outcome: z.enum(['approved', 'cancelled']),
  token: z.string().optional(),
});


export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError('VALIDATION_FAILED', result.error.issues[0]?.message ?? 'Invalid request');
  }
  return result.data;
}