import { ApiError } from '../../src/services/ApiError';
import type {
  AuthorizeOrderInput, CreateOrderInput, IPaymentGateway, PaymentAuthorization, PaymentOrder,
} from '../../src/services/ports';

export class FakePaymentGateway implements IPaymentGateway {
  public readonly orders: CreateOrderInput[] = [];
  public readonly authorizeCalls: AuthorizeOrderInput[] = [];
  public readonly voidedAuthorizations: string[] = [];
  public unavailable = false;
  private readonly approved = new Set<string>();

  public approve(orderId: string): void {
    this.approved.add(orderId);
  }

  public async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    this.assertAvailable();
    this.orders.push(input);
    const orderId = `ORDER-${this.orders.length}`;
    return { orderId, approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}` };
  }

  public async authorizeOrder(input: AuthorizeOrderInput): Promise<PaymentAuthorization | null> {
    this.assertAvailable();
    this.authorizeCalls.push(input);
    if (!this.approved.has(input.orderId)) {
      return null;
    }
    const position = Number(input.orderId.replace('ORDER-', '')) - 1;
    return {
      authorizationId: `AUTH-${input.orderId}`,
      amountUsdMinor: (this.orders[position] as CreateOrderInput).amountUsdMinor,
    };
  }

  public async voidAuthorization(authorizationId: string): Promise<void> {
    this.assertAvailable();
    this.voidedAuthorizations.push(authorizationId);
  }

  public async isReachable(): Promise<boolean> {
    return !this.unavailable;
  }

  private assertAvailable(): void {
    if (this.unavailable) {
      throw new ApiError('PAYPAL_UNAVAILABLE', 'PayPal could not be reached');
    }
  }
}
