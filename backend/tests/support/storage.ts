import { InMemoryDeviceRepository } from '../../src/adapters/persistence/InMemoryDeviceRepository';
import { InMemoryIdempotencyStore } from '../../src/adapters/persistence/InMemoryIdempotencyStore';
import { InMemoryTransactionRepository } from '../../src/adapters/persistence/InMemoryTransactionRepository';
import { InMemoryVaultRepository } from '../../src/adapters/persistence/InMemoryVaultRepository';
import { InMemoryVoucherRepository } from '../../src/adapters/persistence/InMemoryVoucherRepository';
import { PostgresDeviceRepository } from '../../src/adapters/persistence/PostgresDeviceRepository';
import { PostgresIdempotencyStore } from '../../src/adapters/persistence/PostgresIdempotencyStore';
import { PostgresTransactionRepository } from '../../src/adapters/persistence/PostgresTransactionRepository';
import { PostgresVaultRepository } from '../../src/adapters/persistence/PostgresVaultRepository';
import { PostgresVoucherRepository } from '../../src/adapters/persistence/PostgresVoucherRepository';
import type { AppDependencies } from '../../src/app';
import { createTestDatabase } from './testDatabase';




export type Storage = Pick<AppDependencies, 'devices' | 'transactions' | 'vaults' | 'vouchers' | 'idempotency'>;


export async function inMemoryStorage() {
  const transactions = new InMemoryTransactionRepository();
  const vaults = new InMemoryVaultRepository();
  const storage: Storage = {
    devices: new InMemoryDeviceRepository(),
    transactions,
    vaults,
    vouchers: new InMemoryVoucherRepository(vaults, transactions),
    idempotency: new InMemoryIdempotencyStore(),
  };
  return { storage, close: async () => {} };
}


export async function postgresStorage() {
  const { pool, close } = await createTestDatabase();
  const storage: Storage = {
    devices: new PostgresDeviceRepository(pool),
    transactions: new PostgresTransactionRepository(pool),
    vaults: new PostgresVaultRepository(pool),
    vouchers: new PostgresVoucherRepository(pool),
    idempotency: new PostgresIdempotencyStore(pool),
  };
  return { storage, close };
}
