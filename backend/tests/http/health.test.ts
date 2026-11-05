import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApiFixture } from '../support/apiFixture';



describe('GET /api/health', () => {
  it('reports that the API is running in sandbox mode', async () => {
    const { app } = await createApiFixture();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { status: 'ok', mode: 'sandbox' },
    });
  });
});