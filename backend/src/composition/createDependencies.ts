import { NodeP256Signer } from '../adapters/crypto/NodeP256Signer';
import { InMemoryDeviceRepository } from '../adapters/persistence/InMemoryDeviceRepository';
import { NodeRandom } from '../adapters/system/NodeRandom';
import { SystemClock } from '../adapters/system/SystemClock';
import type { AppDependencies } from '../app';




export function createDependencies(env: NodeJS.ProcessEnv): AppDependencies {
  const rootPrivateKey = env.ROOT_PRIVATE_KEY;
  if (!rootPrivateKey) {
    throw new Error('ROOT_PRIVATE_KEY is required');
  }
  return {
    devices: new InMemoryDeviceRepository(),
    signer: new NodeP256Signer(),
    random: new NodeRandom(),
    clock: new SystemClock(),
    rootPrivateKey,
  };
}