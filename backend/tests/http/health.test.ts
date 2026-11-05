import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

describe('GET /api/health', () => {
  it('reports that the API is running in sandbox mode', async () => {
    const response = await request(createApp()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: { status: 'ok', mode: 'sandbox' },
    });
  });
});