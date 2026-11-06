import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { PayPalGateway } from '../src/adapters/paypal/PayPalGateway';

const PROOF_AMOUNT_USD_MINOR = 100;

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing from backend/.env`);
  }
  return value;
}

const baseUrl = required('PAYPAL_BASE_URL');
if (!baseUrl.includes('sandbox')) {
  throw new Error('This proof only runs against the PayPal sandbox');
}

const gateway = new PayPalGateway({
  clientId: required('PAYPAL_CLIENT_ID'),
  clientSecret: required('PAYPAL_CLIENT_SECRET'),
  baseUrl,
});

const proofId = `proof_${randomUUID()}`;
const order = await gateway.createOrder({
  requestId: `${proofId}-order`,
  vaultId: proofId,
  amountUsdMinor: PROOF_AMOUNT_USD_MINOR,
  returnUrl: 'https://example.com/approved',
  cancelUrl: 'https://example.com/cancelled',
});
console.log(`1. Order created: ${order.orderId}`);
console.log(`2. Approve it with your sandbox PERSONAL account:\n\n${order.approvalUrl}\n`);

const prompt = createInterface({ input: process.stdin, output: process.stdout });
await prompt.question('Press Enter after you approve it... ');
prompt.close();

const authorization = await gateway.authorizeOrder({
  requestId: `${proofId}-authorize`,
  orderId: order.orderId,
});
if (!authorization) {
  throw new Error('PayPal says the order is not approved yet');
}
console.log(`3. Funds held: ${authorization.authorizationId} for ${authorization.amountUsdMinor} cents`);

await gateway.voidAuthorization(authorization.authorizationId);
console.log('4. Hold released. The sandbox proof passed.');
