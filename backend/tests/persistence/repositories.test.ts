import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { InMemoryDeviceRepository } from '../../src/adapters/persistence/InMemoryDeviceRepository';
import { InMemoryTransactionRepository } from '../../src/adapters/persistence/InMemoryTransactionRepository';
import { PostgresDeviceRepository } from '../../src/adapters/persistence/PostgresDeviceRepository';
import { PostgresTransactionRepository } from '../../src/adapters/persistence/PostgresTransactionRepository';
import type { IDeviceRepository, ITransactionRepository } from '../../src/services/ports';
import { device, transaction } from '../support/deviceFactory';
import { createTestDatabase, testDatabaseUrl } from '../support/testDatabase';





interface Repositories {
  devices: IDeviceRepository;
  transactions: ITransactionRepository;
  close(): Promise<void>;
}

const inMemory = async (): Promise<Repositories> => ({
  devices: new InMemoryDeviceRepository(),
  transactions: new InMemoryTransactionRepository(),
  close: async () => {},
});

const postgres = async (): Promise<Repositories> => {
  const { pool, close } = await createTestDatabase();
  return {
    devices: new PostgresDeviceRepository(pool),
    transactions: new PostgresTransactionRepository(pool),
    close,
  };
};

const implementations = [
  { name: 'in memory', create: inMemory },
  ...(testDatabaseUrl ? [{ name: 'Postgres', create: postgres }] : []),
];

describe.each(implementations)('$name repositories', ({ create }) => {
  let repositories: Repositories;

  beforeAll(async () => {
    repositories = await create();
  });

  afterAll(async () => {
    await repositories.close();
  });

  describe('devices', () => {
    it('finds a saved device by public key and token hash', async () => {
      const saved = device('find');
      await repositories.devices.save(saved);

      expect(await repositories.devices.findByPublicKey(saved.publicKey)).toEqual(saved);
      expect(await repositories.devices.findByTokenHash(saved.tokenHash)).toEqual(saved);
    });

    it('returns null for an unknown device', async () => {
      expect(await repositories.devices.findByPublicKey('unknown')).toBeNull();
      expect(await repositories.devices.findByTokenHash('unknown')).toBeNull();
    });

    it('updates a device that already exists', async () => {
      await repositories.devices.save(device('update'));
      const changed = device('update', { displayName: 'Mama Nkechi Stores', language: 'yo' });

      expect(await repositories.devices.save(changed)).toEqual(changed);
      expect(await repositories.devices.findByPublicKey(changed.publicKey)).toEqual(changed);
    });

    it('keeps one identity when two saves race on the same key', async () => {
      const first = device('race');
      const second = device('race', { id: 'dev_other', keyId: 'key_other', tokenHash: 'hash_new' });
      await repositories.devices.save(first);

      expect(await repositories.devices.save(second)).toEqual({ ...first, tokenHash: 'hash_new' });
    });

    it('never clears a revocation', async () => {
      const revokedAt = new Date('2026-11-07T10:00:00.000Z');
      await repositories.devices.save(device('revoked', { revokedAt }));

      const saved = await repositories.devices.save(device('revoked'));

      expect(saved.revokedAt).toEqual(revokedAt);
    });
  });

  describe('transactions', () => {
    const page = (deviceId: string, cursor: string | null = null, limit = 10) =>
      repositories.transactions.listForDevice(deviceId, cursor, limit);

    beforeAll(async () => {
      await repositories.devices.save(device('a'));
      await repositories.devices.save(device('b'));
      await repositories.devices.save(device('paged'));
    });

    it('lists only the events of one device, newest first', async () => {
      await repositories.transactions.append(transaction('txn_a1', 'dev_a'));
      await repositories.transactions.append(transaction('txn_a2', 'dev_a'));
      await repositories.transactions.append(transaction('txn_b1', 'dev_b'));

      const { items } = await page('dev_a');

      expect(items.map((item) => item.id)).toEqual(['txn_a2', 'txn_a1']);
      expect(items[0]).toEqual(transaction('txn_a2', 'dev_a'));
    });

    it('keeps empty optional fields as null', async () => {
      const event = transaction('txn_null', 'dev_b', {
        type: 'VAULT_LOCKED',
        amountNgnMinor: null,
        amountUsdMinor: null,
        vaultId: null,
        voucherId: null,
        paypalReferenceId: null,
      });
      await repositories.transactions.append(event);

      expect((await page('dev_b')).items[0]).toEqual(event);
    });

    it('records a repeated event only once', async () => {
      await repositories.transactions.append(transaction('txn_once', 'dev_b'));
      await repositories.transactions.append(transaction('txn_once', 'dev_b'));

      const ids = (await page('dev_b')).items.map((item) => item.id);

      expect(ids.filter((id) => id === 'txn_once')).toHaveLength(1);
    });

    it('pages through history with a cursor', async () => {
      for (const id of ['txn_1', 'txn_2', 'txn_3']) {
        await repositories.transactions.append(transaction(id, 'dev_paged'));
      }

      const first = await page('dev_paged', null, 2);
      const second = await page('dev_paged', first.nextCursor, 2);

      expect(first.items.map((item) => item.id)).toEqual(['txn_3', 'txn_2']);
      expect(second.items.map((item) => item.id)).toEqual(['txn_1']);
      expect(second.nextCursor).toBeNull();
    });
  });
});