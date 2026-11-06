import type { Language } from '@tpay/shared/contracts/statuses';
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