---
title: T-Pay
subtitle: Activity and API Contract
tagline: Every endpoint belongs to a screen activity, and every network call is listed here
version: 1.0
date: 4 November 2026
author: T-Pay engineering
status: Binding for frontend and backend work. Derived from PRD v1.1.
compact: true
---

## 1. How this contract works

The PRD says what the product must do. This document says exactly how the app and the backend talk. The [frontend workflow](T-Pay-Frontend-Workflow.md) and [backend workflow](T-Pay-Backend-Workflow.md) are built from it.

| Rule | Meaning |
| :--- | :--- |
| One activity map | Section 2 is the only list of activities. Frontend and backend use the same `ACT` identifiers. |
| No orphan endpoints | An endpoint exists only if an activity or an external system calls it. |
| No hidden calls | The app makes only the calls listed against each activity. |
| Offline means no endpoint | Activities marked offline must work in airplane mode and never wait for the network. |
| Shared types | Request, response and error types live in `shared/src/contracts/`. Neither side redefines them. |
| Pure shared package | `shared/` has no third-party dependencies, so it needs no `node_modules`. Cryptography and validation libraries stay in adapters on each side. |
| Scope guard | Anything not traced to an activity and a PRD requirement waits until after the submission. |
| Contract first | A change here is merged before the code that depends on it, and both engineers approve it. |

## 2. Activity map

P0 must work in the demo. P1 follows only after every P0 activity is verified.

| ID | Activity | Who | Network | Endpoint | PRD | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| ACT-01 | App start and identity check | Both | Offline first | `POST /devices/register` only to renew a certificate | FR-01, FR-05, FR-36 | P0 |
| ACT-02 | Language, role and device registration | Both | Online | `POST /devices/register` | FR-02, FR-36, FR-33 | P0 |
| ACT-03 | Home and vault summary | Both | Offline first | `GET /vaults/current` when online | FR-08, FR-35 | P0 |
| ACT-04 | Choose vault amount and duration | Customer | Online | `POST /vaults` | FR-06, FR-10 | P0 |
| ACT-05 | PayPal approval and return | Customer | Online | `POST /vaults/{id}/authorize` | FR-06, FR-37, FR-43 | P0 |
| ACT-06 | Merchant creates payment request | Merchant | Offline | None | FR-38 | P0 |
| ACT-07 | Customer reviews, signs and presents voucher | Customer | Offline | None | FR-07, FR-11, FR-13, FR-38 | P0 |
| ACT-08 | Merchant verifies voucher and presents receipt | Merchant | Offline | None | FR-36 to FR-39 | P0 |
| ACT-09 | Customer scans receipt | Customer | Offline | None | FR-22, FR-38 | P0 |
| ACT-10 | Background sync and settlement | Both | Reconnect | `POST /vouchers`, `GET /vouchers` | FR-15, FR-23, FR-24, FR-44 | P0 |
| ACT-11 | Transaction list and detail | Both | Offline first | `GET /vouchers/{id}`, `GET /transactions` when online | FR-20, FR-22 | P0 |
| ACT-12 | Melt vault | Customer | Online | `POST /vaults/{id}/melt` | FR-09, FR-39 | P0 |
| ACT-13 | Merchant ledger | Merchant | Online | `GET /merchants/me/ledger` | FR-40 | P0 |
| ACT-14 | Withdraw to PayPal | Merchant | Online | `POST /merchants/me/withdrawals` | FR-41 | P1 |
| ACT-15 | Voice assistant | Both | Online, with offline fallback | `POST /assistant/interpret` | FR-31 to FR-34, FR-46 | P0 |
| ACT-16 | Settings, profile and device trust | Both | Offline first | `GET /profile`, `PATCH /profile` when online | FR-04, FR-33 | P0 |
| ACT-17 | Voice sale and stock | Merchant | Offline | None | FR-26, FR-27 | P1 |

Three endpoints have no screen, and they are the only exceptions:

| Endpoint | Caller | Reason |
| :--- | :--- | :--- |
| `GET /paypal/return` | PayPal browser redirect | Returns the user to the app after ACT-05 approval. |
| `POST /webhooks/paypal` | PayPal | Updates voucher and vault state. |
| `GET /health` | Render and operators | Reports backend health. |

## 3. Conventions

| Topic | Rule |
| :--- | :--- |
| Base path | All endpoints sit under `/api`, for example `POST /api/vouchers`. |
| Authentication | `Authorization: Bearer <deviceToken>`, except registration, PayPal callbacks and health. |
| Idempotency | Mutating app calls send `Idempotency-Key: <uuid>`. Voucher submission is idempotent on vault and sequence instead. |
| Naira | `amountNgnMinor` is an integer in kobo. |
| US dollars | `amountUsdMinor` and related fields are integers in cents. |
| FX rate | `fxRate` is a decimal string of naira per dollar, for example `"1500.00"`. Conversion uses one function in `shared/`. |
| Time | ISO 8601 UTC strings. |
| Identifiers | Strings. Clients never parse their contents. |
| Success body | `{ "data": { ... } }` |
| Error body | `{ "error": { "code": "VAULT_NOT_FOUND", "message": "...", "details": {} } }` |
| Language | Error messages are for logs. The app chooses user-facing text from its catalogue by `code`. |

### 3.1 Shared status values

| Type | Values |
| :--- | :--- |
| `VaultStatus` | `PENDING_APPROVAL`, `ACTIVE`, `SPEND_CLOSED`, `CLOSED`, `BLOCKED` |
| `VoucherStatus` on the phone only | `DRAFT`, `SIGNED`, `DELIVERED` |
| `VoucherStatus` on both sides | `ACKNOWLEDGED`, `SETTLING`, `RETRYABLE_FAILURE` |
| Terminal `VoucherStatus` | `SETTLED`, `SETTLEMENT_BLOCKED`, `REJECTED_CONFLICT`, `REJECTED_OVERSPEND` |
| `DeviceRole` | `CUSTOMER`, `MERCHANT` |
| `Language` | `en`, `pcm`, `yo`, `ig`, `ha` |

## 4. Endpoints

### 4.1 POST /devices/register

Called by ACT-02, and again by ACT-01 when the device certificate is near expiry.

```json
{
  "publicKey": "base64url",
  "displayName": "Mama Nkechi Provisions",
  "role": "MERCHANT",
  "language": "pcm",
  "payoutEmail": "merchant-sandbox@example.com",
  "proof": "base64url signature over the other fields"
}
```

`payoutEmail` is required for merchants. Response `201` for a new key, `200` for a known key:

```json
{
  "data": {
    "deviceId": "dev_123",
    "keyId": "key_123",
    "deviceToken": "secret",
    "deviceCertificate": "signed certificate, section 5",
    "assuranceTier": "B"
  }
}
```

Errors: `INVALID_SIGNATURE`, `VALIDATION_FAILED`.

### 4.2 POST /vaults

Called by ACT-04. Customer only.

```json
{ "amountNgnMinor": 1000000, "durationHours": 24 }
```

Response `201`:

```json
{
  "data": {
    "vaultId": "vlt_123",
    "status": "PENDING_APPROVAL",
    "amountNgnMinor": 1000000,
    "amountUsdMinor": 667,
    "fxRate": "1500.00",
    "approvalUrl": "https://www.sandbox.paypal.com/..."
  }
}
```

Errors: `ACTIVE_VAULT_EXISTS`, `VALIDATION_FAILED`, `PAYPAL_UNAVAILABLE`.

### 4.3 GET /paypal/return

Redirect page used by PayPal after approval or cancellation. It returns `302` to:

```text
tpay://vault/return?vaultId=vlt_123&outcome=approved
tpay://vault/return?vaultId=vlt_123&outcome=cancelled
```

### 4.4 POST /vaults/{id}/authorize

Called by ACT-05 after the deep link returns with `approved`. The body is empty. Response `200`:

```json
{ "data": { "vault": "Vault object", "vaultCertificate": "signed certificate, section 5" } }
```

Errors: `VAULT_NOT_FOUND`, `ORDER_NOT_APPROVED`, `PAYPAL_UNAVAILABLE`.

### 4.5 GET /vaults/current

Called by ACT-03. Response `200`, with `null` when the device has no open vault:

```json
{
  "data": {
    "vault": {
      "vaultId": "vlt_123",
      "status": "ACTIVE",
      "amountNgnMinor": 1000000,
      "fxRate": "1500.00",
      "authorisedUsdMinor": 667,
      "reservedUsdMinor": 133,
      "settledUsdMinor": 0,
      "remainingUsdMinor": 534,
      "spendBy": "2026-11-09T10:00:00Z",
      "settleBy": "2026-11-10T10:00:00Z",
      "paypalAuthorizationId": "SANDBOX-ID"
    }
  }
}
```

The backend sees only submitted vouchers. While offline vouchers exist, the phone's local reserved amount decides what can be signed.

### 4.6 POST /vaults/{id}/melt

Called by ACT-12.

```json
{ "spendStatement": "signed statement, section 5" }
```

Response `200`:

```json
{
  "data": {
    "vaultId": "vlt_123",
    "status": "SPEND_CLOSED",
    "releasedAt": null,
    "releaseScheduledFor": "2026-11-10T10:00:00Z",
    "blockingVoucherIds": ["vch_456"]
  }
}
```

When nothing blocks release, `status` is `CLOSED`, `releasedAt` is set, and `releaseScheduledFor` is null.

Errors: `VAULT_NOT_FOUND`, `INVALID_SIGNATURE`, `PAYPAL_UNAVAILABLE`.

### 4.7 POST /vouchers

Called by ACT-10 from either phone.

```json
{
  "voucher": "signed voucher, section 5",
  "vaultCertificate": "signed certificate, section 5",
  "receipt": "signed receipt when available"
}
```

Response `200` when terminal, `202` while settlement continues:

```json
{
  "data": {
    "voucherId": "vch_456",
    "status": "SETTLED",
    "paypalCaptureId": "SANDBOX-CAPTURE",
    "replay": false
  }
}
```

A repeated identical voucher returns its stored result with `replay: true` and makes no PayPal call. Verification failures return an error. Settlement outcomes such as `REJECTED_OVERSPEND` return `200` with that status.

Errors: `INVALID_SIGNATURE`, `INVALID_CERTIFICATE`, `VOUCHER_EXPIRED`, `NOT_A_PARTY`.

### 4.8 GET /vouchers

Called by ACT-10 after each submission pass. Query: `since` is an optional cursor, and `limit` defaults to 50.

```json
{
  "data": {
    "items": [
      {
        "voucherId": "vch_456",
        "vaultId": "vlt_123",
        "sequence": 1,
        "view": "PAYEE",
        "status": "SETTLED",
        "amountNgnMinor": 200000,
        "amountUsdMinor": 133,
        "counterpartyName": "Customer",
        "paypalCaptureId": "SANDBOX-CAPTURE",
        "updatedAt": "2026-11-08T12:00:00Z"
      }
    ],
    "nextCursor": "cursor"
  }
}
```

### 4.9 GET /vouchers/{id}

Called by ACT-11. Returns one list item. Errors: `VOUCHER_NOT_FOUND`.

### 4.10 GET /merchants/me/ledger

Called by ACT-13. Merchant only.

```json
{
  "data": {
    "balanceUsdMinor": 133,
    "pendingNgnMinor": 0,
    "entries": [
      {
        "entryId": "led_1",
        "type": "CREDIT",
        "amountUsdMinor": 133,
        "voucherId": "vch_456",
        "paypalCaptureId": "SANDBOX-CAPTURE",
        "createdAt": "2026-11-08T12:00:00Z"
      }
    ]
  }
}
```

### 4.11 POST /merchants/me/withdrawals

Called by ACT-14. Merchant only. Priority P1.

```json
{ "amountUsdMinor": 133 }
```

Response `202`:

```json
{ "data": { "withdrawalId": "wdr_1", "status": "PENDING", "paypalBatchId": "SANDBOX-BATCH" } }
```

Errors: `INSUFFICIENT_BALANCE`, `PAYPAL_UNAVAILABLE`.

### 4.12 POST /assistant/interpret

Called by ACT-15. Exactly one of `text` or `audioBase64` is present. The app never sends keys, tokens or signed data.

```json
{
  "text": "Abeg collect one thousand",
  "audioBase64": null,
  "audioMimeType": null,
  "language": "pcm",
  "context": { "role": "MERCHANT", "remainingNgnMinor": 800000 }
}
```

Response `200`:

```json
{
  "data": {
    "proposal": { "intent": "CREATE_PAYMENT_REQUEST", "amountNgnMinor": 100000, "itemName": null },
    "transcript": "Abeg collect one thousand",
    "spokenReply": "You wan collect one thousand naira?",
    "needsConfirmation": true
  }
}
```

Allowed intents are `CREATE_PAYMENT_REQUEST`, `PAY_AMOUNT`, `RECORD_SALE`, `CHECK_BALANCE` and `UNKNOWN`. A proposal only pre-fills a screen. A person must confirm it, and only the normal signing activity can sign.

Errors: `AI_UNAVAILABLE`, `VALIDATION_FAILED`.

### 4.13 POST /webhooks/paypal

Called by PayPal. The handler verifies the signature, stores the event identifier, and applies the event once.

### 4.14 GET /health

Response `200` when dependencies are reachable, `503` otherwise:

```json
{ "data": { "status": "ok", "database": "ok", "paypal": "ok", "mode": "sandbox" } }
```



### 4.15 GET /profile

Called by ACT-16. Response `200`:

```json
{
  "data": {
    "deviceId": "dev_123",
    "displayName": "Mama Nkechi Provisions",
    "role": "MERCHANT",
    "language": "pcm",
    "payoutEmail": "merchant-sandbox@example.com",
    "assuranceTier": "B",
    "createdAt": "2026-11-06T10:00:00Z"
  }
}
```

### 4.16 PATCH /profile

Called by ACT-16. All fields are optional. The role cannot change.

```json
{ "displayName": "Mama Nkechi Stores", "language": "yo", "payoutEmail": "merchant-sandbox@example.com" }
```

Response `200` returns the same object as `GET /profile`. Errors: `VALIDATION_FAILED`.

### 4.17 GET /transactions

Called by ACT-11. Query: `since` is an optional cursor. Returns the permanent history for the calling device.

```json
{
  "data": {
    "items": [
      {
        "transactionId": "txn_1",
        "type": "VOUCHER_SETTLED",
        "amountNgnMinor": 200000,
        "amountUsdMinor": 133,
        "vaultId": "vlt_123",
        "voucherId": "vch_456",
        "paypalReferenceId": "SANDBOX-CAPTURE",
        "occurredAt": "2026-11-08T12:00:00Z"
      }
    ],
    "nextCursor": null
  }
}
```

Types are `VAULT_LOCKED`, `VAULT_RELEASED`, `VOUCHER_SUBMITTED`, `VOUCHER_SETTLED`, `VOUCHER_REJECTED`, `WITHDRAWAL_REQUESTED` and `WITHDRAWAL_COMPLETED`.





## 5. Offline messages

These are signed objects carried between phones and later to the backend. They are created and verified only through `shared/`.

### 5.1 Signing format

| Item | Rule |
| :--- | :--- |
| Signed bytes | Domain prefix plus JCS canonical JSON |
| Algorithm | ECDSA P-256 with SHA-256 |
| Signature | Base64url of raw 64-byte `r‖s` |
| Envelope | `{ "payload": { ... }, "signature": "base64url" }` |
| Wire frame | `TPAY1:<TYPE>:<base64url JSON envelope>` for QR and the copyable code |

### 5.2 Message types

| Type | Signed by | Prefix | Payload fields |
| :--- | :--- | :--- | :--- |
| Device certificate | Backend | `TPAY-DEVICE-CERT-V1` | `deviceId`, `keyId`, `publicKey`, `displayName`, `role`, `expiresAt` |
| Vault certificate | Backend | `TPAY-VAULT-CERT-V1` | `vaultId`, `keyId`, `authorisedUsdMinor`, `amountNgnMinor`, `fxRate`, `spendBy`, `settleBy` |
| Payment request | Merchant | `TPAY-REQUEST-V1` | `requestId`, `merchantKeyId`, `amountNgnMinor`, `nonce`, `expiresAt`, plus the merchant device certificate |
| Voucher | Customer | `TPAY-VOUCHER-V1` | `vaultId`, `keyId`, `deviceId`, `sequence`, `amountNgnMinor`, `amountUsdMinor`, `fxRate`, `payeeKeyId`, `requestNonce`, `issuedAt`, `expiresAt` |
| Receipt | Merchant | `TPAY-RECEIPT-V1` | `vaultId`, `sequence`, `voucherHash`, `merchantKeyId`, `receivedAt` |
| Spend statement | Customer | `TPAY-STATEMENT-V1` | `vaultId`, `lastSequence`, `totalIssuedUsdMinor`, `issuedAt` |

A voucher frame also carries the customer's device certificate and vault certificate.




### 5.3 Offline refusal codes

The app shows translated text for each code. These never come from the backend.

| Code | Meaning |
| :--- | :--- |
| `INVALID_CERTIFICATE` | A certificate is fake, expired or for the wrong device |
| `INVALID_SIGNATURE` | The signed data was changed or forged |
| `REQUEST_EXPIRED` | The merchant's payment request expired |
| `REQUEST_MISMATCH` | The voucher doesn't match this payment request |
| `VAULT_EXPIRED` | The vault can no longer be spent |
| `INSUFFICIENT_VAULT_CAPACITY` | The vault doesn't have enough left |
| `WRONG_PAYEE` | The voucher is for another merchant |
| `DUPLICATE_VOUCHER` | This merchant already accepted this voucher |




## 6. Error codes and required app behaviour

| Code | HTTP | App behaviour |
| :--- | :--- | :--- |
| `VALIDATION_FAILED` | 400 | Show the field problem. This is a bug if the UI allowed it. |
| `UNAUTHENTICATED` | 401 | Re-register, then repeat the action once. |
| `FORBIDDEN_ROLE` | 403 | Hide the action. This is a bug if the UI allowed it. |
| `DEVICE_REVOKED` | 403 | Stop signing and start ACT-02. |
| `VAULT_NOT_FOUND` | 404 | Refresh the home screen. |
| `VOUCHER_NOT_FOUND` | 404 | Keep the local record and show pending. |
| `ACTIVE_VAULT_EXISTS` | 409 | Open the existing vault. |
| `ORDER_NOT_APPROVED` | 409 | Offer to return to PayPal. |
| `NOT_A_PARTY` | 403 | Stop retrying and log the failure. |
| `INVALID_SIGNATURE` | 422 | Stop retrying and show rejected. |
| `INVALID_CERTIFICATE` | 422 | Stop retrying and show rejected. |
| `VOUCHER_EXPIRED` | 422 | Stop retrying and show blocked. |
| `INSUFFICIENT_BALANCE` | 422 | Show the available balance. |
| `RATE_LIMITED` | 429 | Retry with backoff. |
| `PAYPAL_UNAVAILABLE` | 503 | Offer retry and keep local data. |
| `AI_UNAVAILABLE` | 503 | Open the offline assistant path. |
| `ROUTE_NOT_FOUND` | 404 | This is a bug. Log it and show a general error. |
| `INTERNAL_ERROR` | 500 | Offer retry and keep local data. |
## 7. Change control

1. Open a pull request against this document first.
2. Name the activity and PRD requirement.
3. Update `shared/src/contracts/` in the same pull request.
4. Get approval from both the frontend and backend owners.
5. Update the Word version with `npm run docx` in `docs/`.
