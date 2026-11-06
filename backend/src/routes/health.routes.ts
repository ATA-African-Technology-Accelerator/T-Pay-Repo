import { Router } from 'express';




export function createHealthRouter(checkDatabase: () => Promise<boolean>): Router {
  const router = Router();

  router.get('/health', async (_request, response) => {
    const databaseIsUp = await checkDatabase();
    response.status(databaseIsUp ? 200 : 503).json({
      data: {
        status: databaseIsUp ? 'ok' : 'degraded',
        database: databaseIsUp ? 'ok' : 'down',
        mode: 'sandbox',
      },
    });
  });

  return router;
}