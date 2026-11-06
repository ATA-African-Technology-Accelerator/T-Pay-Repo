import type { CurrentVaultResponse } from '@tpay/shared/contracts/api';
import type { Device, IVaultRepository } from './ports';
import { toVaultView } from './vaultView';

export class GetCurrentVault {
  constructor(private readonly vaults: IVaultRepository) {}

  public async execute(device: Device): Promise<CurrentVaultResponse> {
    const vault = await this.vaults.findOpenForDevice(device.id);
    return { vault: vault && vault.status !== 'PENDING_APPROVAL' ? toVaultView(vault) : null };
  }
}
