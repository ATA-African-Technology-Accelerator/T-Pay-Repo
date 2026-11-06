import express, { type Express } from 'express';
import { DeviceController } from './controllers/DeviceController';
import { ProfileController } from './controllers/ProfileController';
import { TransactionController } from './controllers/TransactionController';
import { authenticate } from './middleware/authenticate';
import { errorHandler, notFound } from './middleware/errorHandler';
import { createDeviceRouter } from './routes/device.routes';
import { createHealthRouter } from './routes/health.routes';
import { createTransactionRouter } from './routes/transaction.routes';
import type { ITransactionRepository } from './services/ports';
import { RegisterDevice, type RegisterDeviceDependencies } from './services/RegisterDevice';






export interface AppDependencies extends RegisterDeviceDependencies {
  transactions: ITransactionRepository;
  checkDatabase(): Promise<boolean>;
}


export function createApp(dependencies: AppDependencies): Express {
  const app = express();
  const { checkDatabase, devices, signer, transactions } = dependencies;
  const requireDevice = authenticate(devices, signer);

  app.use(express.json());
  app.use('/api', createHealthRouter(checkDatabase));
  app.use(
    '/api',
    createDeviceRouter(
      new DeviceController(new RegisterDevice(dependencies)),
      new ProfileController(devices),
      requireDevice,
    ),
  );
  app.use('/api', createTransactionRouter(new TransactionController(transactions), requireDevice));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}