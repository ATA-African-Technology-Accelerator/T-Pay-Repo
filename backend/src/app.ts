import express, { type Express } from 'express';
import { DeviceController } from './controllers/DeviceController';
import { ProfileController } from './controllers/ProfileController';
import { authenticate } from './middleware/authenticate';
import { errorHandler, notFound } from './middleware/errorHandler';
import { createDeviceRouter } from './routes/device.routes';
import { healthRouter } from './routes/health.routes';
import { RegisterDevice, type RegisterDeviceDependencies } from './services/RegisterDevice';






export type AppDependencies = RegisterDeviceDependencies;

export function createApp(dependencies: AppDependencies): Express {
  const app = express();
  const { devices, signer } = dependencies;

  app.use(express.json());
  app.use('/api', healthRouter);
  app.use(
    '/api',
    createDeviceRouter(
      new DeviceController(new RegisterDevice(dependencies)),
      new ProfileController(devices),
      authenticate(devices, signer),
    ),
  );
  app.use(notFound);
  app.use(errorHandler);

  return app;
}