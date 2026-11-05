import type { DeviceRole, Language } from '@tpay/shared/contracts/statuses';




export interface Device {
  id: string;
  keyId: string;
  publicKey: string;
  tokenHash: string;
  displayName: string;
  role: DeviceRole;
  language: Language;
  payoutEmail: string | null;
  createdAt: Date;
  revokedAt: Date | null;
}


export interface IDeviceRepository {
  findByPublicKey(publicKey: string): Promise<Device | null>;
  findByTokenHash(tokenHash: string): Promise<Device | null>;
  save(device: Device): Promise<void>;
}