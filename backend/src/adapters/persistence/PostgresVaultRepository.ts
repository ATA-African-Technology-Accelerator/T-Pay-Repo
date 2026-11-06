import type pg from 'pg';
import type { VaultStatus } from '@tpay/shared/contracts/statuses';
import type { IVaultRepository, Vault, VaultLock } from '../../services/ports';

interface VaultRow {
  id: string;
  device_id: string;
  status: VaultStatus;
  amount_ngn_minor: string;
  authorised_usd_minor: string;
  fx_rate: string;
  duration_hours: number;
  paypal_order_id: string;
  paypal_authorization_id: string | null;
  spend_by: Date | null;
  settle_by: Date | null;
  created_at: Date;
}

const toVault = (row: VaultRow): Vault => ({
  id: row.id,
  deviceId: row.device_id,
  status: row.status,
  amountNgnMinor: Number(row.amount_ngn_minor),
  authorisedUsdMinor: Number(row.authorised_usd_minor),
  fxRate: row.fx_rate,
  durationHours: row.duration_hours,
  paypalOrderId: row.paypal_order_id,
  paypalAuthorizationId: row.paypal_authorization_id,
  spendBy: row.spend_by,
  settleBy: row.settle_by,
  createdAt: row.created_at,
});

export class PostgresVaultRepository implements IVaultRepository {
  constructor(private readonly pool: pg.Pool) {}

  public async create(vault: Vault): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `INSERT INTO vaults
         (id, device_id, status, amount_ngn_minor, authorised_usd_minor, fx_rate, duration_hours,
          paypal_order_id, paypal_authorization_id, spend_by, settle_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (device_id) WHERE status <> 'CLOSED' DO NOTHING`,
      [
        vault.id,
        vault.deviceId,
        vault.status,
        vault.amountNgnMinor,
        vault.authorisedUsdMinor,
        vault.fxRate,
        vault.durationHours,
        vault.paypalOrderId,
        vault.paypalAuthorizationId,
        vault.spendBy,
        vault.settleBy,
        vault.createdAt,
      ],
    );
    return rowCount === 1;
  }

  public async findById(id: string): Promise<Vault | null> {
    const { rows } = await this.pool.query<VaultRow>('SELECT * FROM vaults WHERE id = $1', [id]);
    return rows[0] ? toVault(rows[0]) : null;
  }

  public async findOpenForDevice(deviceId: string): Promise<Vault | null> {
    const { rows } = await this.pool.query<VaultRow>(
      "SELECT * FROM vaults WHERE device_id = $1 AND status <> 'CLOSED'",
      [deviceId],
    );
    return rows[0] ? toVault(rows[0]) : null;
  }

  public async activate(id: string, lock: VaultLock): Promise<Vault | null> {
    const { rows } = await this.pool.query<VaultRow>(
      `UPDATE vaults
       SET status = 'ACTIVE', paypal_authorization_id = $2, spend_by = $3, settle_by = $4
       WHERE id = $1 AND status = 'PENDING_APPROVAL'
       RETURNING *`,
      [id, lock.paypalAuthorizationId, lock.spendBy, lock.settleBy],
    );
    return rows[0] ? toVault(rows[0]) : null;
  }

  public async abandon(id: string): Promise<void> {
    await this.pool.query(
      "UPDATE vaults SET status = 'CLOSED' WHERE id = $1 AND status = 'PENDING_APPROVAL'",
      [id],
    );
  }
}
