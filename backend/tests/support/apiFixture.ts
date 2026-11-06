import request from 'supertest';
import type { Language } from '@tpay/shared/contracts/statuses';
import { MESSAGE_PREFIX } from '@tpay/shared/contracts/messages';
import type { RegistrationProofPayload } from '@tpay/shared/contracts/messages';
import { signingInput } from '@tpay/shared/domain/canonicalJson';
import { NodeP256Signer } from '../../src/adapters/crypto/NodeP256Signer';
import { InMemoryDeviceRepository } from '../../src/adapters/persistence/InMemoryDeviceRepository';
import { NodeRandom } from '../../src/adapters/system/NodeRandom';
import { createApp } from '../../src/app';
import { InMemoryIdempotencyStore } from '../../src/adapters/persistence/InMemoryIdempotencyStore';
import { InMemoryTransactionRepository } from '../../src/adapters/persistence/InMemoryTransactionRepository';
import { InMemoryVaultRepository } from '../../src/adapters/persistence/InMemoryVaultRepository';
import { FakePaymentGateway } from './FakePaymentGateway';





export const NOW = new Date('2026-11-06T10:00:00.000Z');
const signer = new NodeP256Signer();


export async function createApiFixture({databaseIsUp = true} = {}) {
  const root = await signer.generateKeyPair();
  const transactions = new InMemoryTransactionRepository();
  const vaults = new InMemoryVaultRepository();
  const gateway = new FakePaymentGateway();

  const app = createApp({
    devices: new InMemoryDeviceRepository(),
    transactions,
    vaults,
    idempotency: new InMemoryIdempotencyStore(),
    gateway,
    checkDatabase: async () => databaseIsUp,
    paypalMode: 'sandbox',
    fxRate: '1500.00',
    publicBaseUrl: 'https://tpay.test',
    signer,
    random: new NodeRandom(),
    clock: { now: () => NOW },
    rootPrivateKey: root.privateKey,
  });

  const registration = async (overrides: Partial<RegistrationProofPayload> = {}) => {
    const keys = await signer.generateKeyPair();
    const payload: RegistrationProofPayload = {
      publicKey: keys.publicKey,
      displayName: 'Mama Nkechi Provisions',
      language: 'pcm' as Language,
      payoutEmail: 'merchant-sandbox@example.com',
      ...overrides,
    };
    const proof = await signer.sign(signingInput(MESSAGE_PREFIX.REGISTRATION, payload), keys.privateKey);
    return { ...payload, proof };
  };

  const registerDevice = async () => {
    const response = await request(app).post('/api/devices/register').send(await registration());
    return response.body.data as { deviceId: string; keyId: string; deviceToken: string };
  };

  return { app, root, signer, transactions, vaults, gateway, registration, registerDevice };
}