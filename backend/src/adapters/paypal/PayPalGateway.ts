import { ApiError } from '../../services/ApiError';
import type {
  AuthorizeOrderInput, CreateOrderInput, IPaymentGateway, PaymentAuthorization, PaymentOrder,
} from '../../services/ports';

const REQUEST_TIMEOUT_MS = 15_000;
const TOKEN_EXPIRY_MARGIN_MS = 60_000;
const CENTS_PER_DOLLAR = 100;
const USD_VALUE_PATTERN = /^\d+\.\d{2}$/;
const ALREADY_VOIDED_ISSUES = ['PREVIOUSLY_VOIDED', 'AUTHORIZATION_VOIDED'];

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

interface PayPalReply {
  ok: boolean;
  status: number;
  // PayPal's JSON is checked field by field where it is read.
  body: any;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  body?: unknown;
  requestId?: string;
}

const toUsdValue = (cents: number) => {
  const dollars = Math.floor(cents / CENTS_PER_DOLLAR);
  return `${dollars}.${String(cents % CENTS_PER_DOLLAR).padStart(2, '0')}`;
};

const unavailable = (detail: string) => {
  console.error(`PayPal request failed: ${detail}`);
  return new ApiError('PAYPAL_UNAVAILABLE', 'PayPal could not complete the request');
};

const firstIssue = (reply: PayPalReply): string | undefined => reply.body?.details?.[0]?.issue;

export class PayPalGateway implements IPaymentGateway {
  private token: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly config: PayPalConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  public async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    const reply = await this.request('/v2/checkout/orders', {
      method: 'POST',
      requestId: input.requestId,
      body: {
        intent: 'AUTHORIZE',
        purchase_units: [
          {
            reference_id: input.vaultId,
            custom_id: input.vaultId,
            amount: { currency_code: 'USD', value: toUsdValue(input.amountUsdMinor) },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'T-Pay',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: input.returnUrl,
              cancel_url: input.cancelUrl,
            },
          },
        },
      },
    });
    this.assertOk(reply, 'create order');

    const link = reply.body.links?.find(({ rel }: { rel: string }) => rel === 'payer-action' || rel === 'approve');
    if (!reply.body.id || !link?.href) {
      throw unavailable('create order returned no approval link');
    }
    return { orderId: reply.body.id, approvalUrl: link.href };
  }

  public async authorizeOrder({ orderId, requestId }: AuthorizeOrderInput): Promise<PaymentAuthorization | null> {
    const path = `/v2/checkout/orders/${encodeURIComponent(orderId)}`;
    const reply = await this.request(`${path}/authorize`, { method: 'POST', requestId, body: {} });

    if (firstIssue(reply) === 'ORDER_NOT_APPROVED') {
      return null;
    }
    if (firstIssue(reply) === 'ORDER_ALREADY_AUTHORIZED') {
      const order = await this.request(path, { method: 'GET' });
      this.assertOk(order, 'read order');
      return this.readAuthorization(order);
    }
    this.assertOk(reply, 'authorize order');
    return this.readAuthorization(reply);
  }

  public async voidAuthorization(authorizationId: string): Promise<void> {
    const reply = await this.request(
      `/v2/payments/authorizations/${encodeURIComponent(authorizationId)}/void`,
      { method: 'POST', requestId: `${authorizationId}-void` },
    );
    if (!ALREADY_VOIDED_ISSUES.includes(firstIssue(reply) ?? '')) {
      this.assertOk(reply, 'void authorization');
    }
  }

  public async isReachable(): Promise<boolean> {
    try {
      await this.accessToken();
      return true;
    } catch {
      return false;
    }
  }

  private readAuthorization(reply: PayPalReply): PaymentAuthorization | null {
    const authorization = reply.body.purchase_units?.[0]?.payments?.authorizations?.[0];
    const value: unknown = authorization?.amount?.value;
    if (!authorization?.id || typeof value !== 'string' || !USD_VALUE_PATTERN.test(value)) {
      throw unavailable('authorization is missing from the PayPal reply');
    }
    if (authorization.status !== 'CREATED') {
      return null;
    }
    return { authorizationId: authorization.id, amountUsdMinor: Number(value.replace('.', '')) };
  }

  private assertOk(reply: PayPalReply, action: string): void {
    if (!reply.ok) {
      throw unavailable(
        `${action} returned ${reply.status} ${reply.body?.name ?? ''} ${firstIssue(reply) ?? ''} ${reply.body?.debug_id ?? ''}`,
      );
    }
  }

  private async request(path: string, { method, body, requestId }: RequestOptions): Promise<PayPalReply> {
    return this.send(`${this.config.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${await this.accessToken()}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }

  private async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token.value;
    }
    const { clientId, clientSecret, baseUrl } = this.config;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const reply = await this.send(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!reply.ok || !reply.body?.access_token) {
      throw unavailable(`login returned ${reply.status}`);
    }
    this.token = {
      value: reply.body.access_token,
      expiresAt: Date.now() + Number(reply.body.expires_in) * 1000 - TOKEN_EXPIRY_MARGIN_MS,
    };
    return this.token.value;
  }

  private async send(url: string, init: RequestInit): Promise<PayPalReply> {
    try {
      const response = await this.fetcher(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      const text = await response.text();
      return { ok: response.ok, status: response.status, body: text ? JSON.parse(text) : null };
    } catch (error) {
      throw unavailable(error instanceof Error ? error.message : 'unknown error');
    }
  }
}
