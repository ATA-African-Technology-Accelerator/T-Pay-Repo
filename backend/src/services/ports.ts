import type { Language, VaultStatus } from '@tpay/shared/contracts/statuses';
import type { TransactionView } from '@tpay/shared/contracts/api';



export interface Device {
  id: string;
  keyId: string;
  publicKey: string;
  tokenHash: string;
  displayName: string;
  language: Language;
  payoutEmail: string;
  createdAt: Date;
  revokedAt: Date | null;
}


export interface IDeviceRepository {
  findByPublicKey(publicKey: string): Promise<Device | null>;
  findByTokenHash(tokenHash: string): Promise<Device | null>;
  save(device: Device): Promise<Device>;
}



export interface TransactionEvent extends Omit<TransactionView, 'transactionId' | 'occurredAt'> {
  id: string;
  deviceId: string;
  occurredAt: Date;
}

export interface TransactionPage {
  items: TransactionEvent[];
  nextCursor: string | null;
}

export interface ITransactionRepository {
  append(event: TransactionEvent): Promise<void>;
  listForDevice(deviceId: string, cursor: string | null, limit: number): Promise<TransactionPage>;
}


export interface Vault {
  id: string;
  deviceId: string;
  status: VaultStatus;
  amountNgnMinor: number;
  authorisedUsdMinor: number;
  fxRate: string;
  durationHours: number;
  paypalOrderId: string;
  paypalAuthorizationId: string | null;
  spendBy: Date | null;
  settleBy: Date | null;
  createdAt: Date;
}

export interface VaultLock {
  paypalAuthorizationId: string;
  spendBy: Date;
  settleBy: Date;
}

export interface IVaultRepository {
  create(vault: Vault): Promise<boolean>;
  findById(id: string): Promise<Vault | null>;
  findOpenForDevice(deviceId: string): Promise<Vault | null>;
  activate(id: string, lock: VaultLock): Promise<Vault | null>;
  abandon(id: string): Promise<void>;
}


export interface StoredResponse {
  status: number;
  body: unknown;
}

export type IdempotencyClaim =
  | { outcome: 'NEW' }
  | { outcome: 'REPLAY'; response: StoredResponse }
  | { outcome: 'CONFLICT' };

export interface IIdempotencyStore {
  claim(deviceId: string, key: string, requestHash: string): Promise<IdempotencyClaim>;
  complete(deviceId: string, key: string, response: StoredResponse): Promise<void>;
  release(deviceId: string, key: string): Promise<void>;
}


export interface CreateOrderInput {
  requestId: string;
  vaultId: string;
  amountUsdMinor: number;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentOrder {
  orderId: string;
  approvalUrl: string;
}

export interface AuthorizeOrderInput {
  requestId: string;
  orderId: string;
}

export interface PaymentAuthorization {
  authorizationId: string;
  amountUsdMinor: number;
}

export interface IPaymentGateway {
  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;
  authorizeOrder(input: AuthorizeOrderInput): Promise<PaymentAuthorization | null>;
  voidAuthorization(authorizationId: string): Promise<void>;
  isReachable(): Promise<boolean>;
}
