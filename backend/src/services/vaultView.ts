import type { VaultView } from '@tpay/shared/contracts/api';
import type { Vault } from './ports';

export function toVaultView(vault: Vault): VaultView {
  return {
    vaultId: vault.id,
    status: vault.status,
    amountNgnMinor: vault.amountNgnMinor,
    fxRate: vault.fxRate,
    authorisedUsdMinor: vault.authorisedUsdMinor,
    reservedUsdMinor: 0,
    settledUsdMinor: 0,
    remainingUsdMinor: vault.authorisedUsdMinor,
    spendBy: (vault.spendBy as Date).toISOString(),
    settleBy: (vault.settleBy as Date).toISOString(),
    paypalAuthorizationId: vault.paypalAuthorizationId as string,
  };
}
