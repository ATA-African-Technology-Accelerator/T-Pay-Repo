import type { Device, IDeviceRepository } from '../../services/ports';



export class InMemoryDeviceRepository implements IDeviceRepository {
  private readonly devices = new Map<string, Device>();

  public async findByPublicKey(publicKey: string): Promise<Device | null> {
    return this.findWhere((device) => device.publicKey === publicKey);
  }

  public async findByTokenHash(tokenHash: string): Promise<Device | null> {
    return this.findWhere((device) => device.tokenHash === tokenHash);
  }

  public async save(device: Device): Promise<void> {
    this.devices.set(device.id, device);
  }

  private findWhere(matches: (device: Device) => boolean): Device | null {
    return [...this.devices.values()].find(matches) ?? null;
  }
}