import type {
  DeviceCertificatePayload, ReceiptPayload,
  SignedEnvelope, SpendStatementPayload,
  VaultCertificatePayload, VoucherPayload,
} from './messages';

import type { DeviceRole, Language, VaultStatus, VoucherStatus } from './statuses';






export interface ApiSuccess<T> {
  data: T;
}

export type SignedDeviceCertificate = SignedEnvelope<DeviceCertificatePayload>;
export type SignedVaultCertificate = SignedEnvelope<VaultCertificatePayload>;

export interface RegisterDeviceRequest {
  publicKey: string;
  displayName: string;
  role: DeviceRole;
  language: Language;
  payoutEmail?: string;
  proof: string;
}

export interface RegisterDeviceResponse {
  deviceId: string;
  keyId: string;
  deviceToken: string;
  deviceCertificate: SignedDeviceCertificate;
  assuranceTier: 'B';
}

export interface CreateVaultRequest {
  amountNgnMinor: number;
  durationHours: number;
}

export interface CreateVaultResponse {
  vaultId: string;
  status: VaultStatus;
  amountNgnMinor: number;
  amountUsdMinor: number;
  fxRate: string;
  approvalUrl: string;
}

export interface VaultView {
  vaultId: string;
  status: VaultStatus;
  amountNgnMinor: number;
  fxRate: string;
  authorisedUsdMinor: number;
  reservedUsdMinor: number;
  settledUsdMinor: number;
  remainingUsdMinor: number;
  spendBy: string;
  settleBy: string;
  paypalAuthorizationId: string;
}

export interface AuthorizeVaultResponse {
  vault: VaultView;
  vaultCertificate: SignedVaultCertificate;
}

export interface CurrentVaultResponse {
  vault: VaultView | null;
}

export interface MeltVaultRequest {
  spendStatement: SignedEnvelope<SpendStatementPayload>;
}

export interface MeltVaultResponse {
  vaultId: string;
  status: VaultStatus;
  releasedAt: string | null;
  releaseScheduledFor: string | null;
  blockingVoucherIds: string[];
}

export interface SubmitVoucherRequest {
  voucher: SignedEnvelope<VoucherPayload>;
  vaultCertificate: SignedVaultCertificate;
  receipt?: SignedEnvelope<ReceiptPayload>;
}

export interface SubmitVoucherResponse {
  voucherId: string;
  status: VoucherStatus;
  paypalCaptureId: string | null;
  replay: boolean;
}

export interface VoucherView {
  voucherId: string;
  vaultId: string;
  sequence: number;
  view: 'PAYER' | 'PAYEE';
  status: VoucherStatus;
  amountNgnMinor: number;
  amountUsdMinor: number;
  counterpartyName: string;
  paypalCaptureId: string | null;
  updatedAt: string;
}

export interface ListVouchersResponse {
  items: VoucherView[];
  nextCursor: string | null;
}

export interface LedgerEntry {
  entryId: string;
  type: 'CREDIT' | 'WITHDRAWAL';
  amountUsdMinor: number;
  voucherId: string | null;
  paypalCaptureId: string | null;
  createdAt: string;
}

export interface MerchantLedgerResponse {
  balanceUsdMinor: number;
  pendingNgnMinor: number;
  entries: LedgerEntry[];
}

export interface WithdrawRequest {
  amountUsdMinor: number;
}

export interface WithdrawResponse {
  withdrawalId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paypalBatchId: string;
}

export type AssistantIntent =
  | 'CREATE_PAYMENT_REQUEST'
  | 'PAY_AMOUNT'
  | 'RECORD_SALE'
  | 'CHECK_BALANCE'
  | 'UNKNOWN';

export interface InterpretRequest {
  text: string | null;
  audioBase64: string | null;
  audioMimeType: string | null;
  language: Language;
  context: {
    role: DeviceRole;
    remainingNgnMinor: number;
  };
}

export interface InterpretResponse {
  proposal: {
    intent: AssistantIntent;
    amountNgnMinor: number | null;
    itemName: string | null;
  };
  transcript: string;
  spokenReply: string;
  needsConfirmation: true;
}