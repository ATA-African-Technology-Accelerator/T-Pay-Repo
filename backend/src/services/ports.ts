import type { Language } from '@tpay/shared/contracts/statuses';




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
  save(device: Device): Promise<void>;
}