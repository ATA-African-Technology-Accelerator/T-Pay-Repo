import { NodeP256Signer } from '../adapters/crypto/NodeP256Signer';
import { createPool, isDatabaseReachable } from '../adapters/persistence/database';
import { PostgresDeviceRepository } from '../adapters/persistence/PostgresDeviceRepository';
import { PostgresTransactionRepository } from '../adapters/persistence/PostgresTransactionRepository';
import { NodeRandom } from '../adapters/system/NodeRandom';
import { SystemClock } from '../adapters/system/SystemClock';
import type { AppDependencies } from '../app';





function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function createDependencies(env: NodeJS.ProcessEnv): AppDependencies {
  const pool = createPool(required(env, 'DATABASE_URL'));
  return {
    devices: new PostgresDeviceRepository(pool),
    transactions: new PostgresTransactionRepository(pool),
    checkDatabase: () => isDatabaseReachable(pool),
    signer: new NodeP256Signer(),
    random: new NodeRandom(),
    clock: new SystemClock(),
    rootPrivateKey: required(env, 'ROOT_PRIVATE_KEY'),
  };
}