# T-Pay Domain-Driven Design (DDD) Architecture Specification

This document provides a comprehensive blueprint of the **Domain-Driven Design (DDD)** scaffold implemented for **T-Pay** based on the technical specification.

---

## 1. Strategic Design & Context Map

T-Pay is architected around four distinct Bounded Contexts with clear responsibilities and decoupled communication through an in-memory Domain Event Bus.

```mermaid
flowchart TD
    subgraph Client["Presentation & Client Layer"]
        UI["React Mobile/Web Shell"]
        Hooks["React Domain Hooks\n(useMerchantDomain, useBudgetDomain,\nuseTransitDomain, useEscrowDomain)"]
        UI --> Hooks
    end

    subgraph Container["Composition Root"]
        TPayContainer["TPayContainer (DI Container)"]
    end

    subgraph BoundedContexts["Bounded Contexts"]
        direction TB
        subgraph EscrowContext["Bounded Context: Offline Escrow & Settlement"]
            EscrowRoot["OfflineEscrowToken (Aggregate Root)"]
            CryptoSvc["CryptographicExchangeService"]
            PayPalAdapter["PayPalSdkGatewayAdapter"]
            ProximityAdapter["MockProximityTransportAdapter"]
        end

        subgraph ResourceContext["Bounded Context: Smart Resource Tracker"]
            direction LR
            subgraph MerchantSub["Merchant Sub-domain"]
                InventoryItem["InventoryItem (Aggregate)"]
                PriceCalc["PriceToQuantityCalculator"]
                VoiceParser["SpokenInventoryParser"]
            end
            subgraph BudgetSub["Personal Budget Sub-domain"]
                BudgetPlan["BudgetPlan (Aggregate)"]
                Categorizer["ExpenseCategorizerService"]
            end
            subgraph TransitSub["Transit / Korope Sub-domain"]
                KoropeTrip["KoropeTrip (Aggregate)"]
                Manifest["PassengerSeat Manifest"]
            end
        end

        subgraph AssistantContext["Bounded Context: Hybrid AI & Multilingual Voice"]
            LocalSLM["LocalSLMAdapter (Zero-Data Mobile Model)"]
            VoiceService["MultilingualVoiceService (Pidgin, Yoruba, Igbo, Hausa)"]
            TTS["WebSpeechSynthesisAdapter (Audio Readout)"]
        end
    end

    subgraph SharedKernel["Shared Kernel"]
        Entity["Entity<T>"]
        ValueObject["ValueObject<T>"]
        AggregateRoot["AggregateRoot<T>"]
        Money["Money Value Object (₦)"]
        EventBus["DomainEventBus (Pub/Sub)"]
    end

    Hooks --> TPayContainer
    TPayContainer --> EscrowContext
    TPayContainer --> ResourceContext
    TPayContainer --> AssistantContext

    EscrowContext -.-> EventBus
    ResourceContext -.-> EventBus
    AssistantContext -.-> EventBus

    EscrowContext --- SharedKernel
    ResourceContext --- SharedKernel
    AssistantContext --- SharedKernel
```

---

## 2. Ubiquitous Language

| Term | Domain Definition |
| :--- | :--- |
| **Offline Escrow Token** | A cryptographically signed promise-to-pay exchanged peer-to-peer between Device A and Device B in zero-connectivity blackout mode. |
| **Zero-Data Cryptogram** | A tamper-resistant `HMAC-SHA256` token with unique nonce and cryptographic signature verifying mutual agreement without an active server connection. |
| **Opportunistic Settlement** | The architectural rule where whichever device reconnects to the internet first automatically submits the cached token to PayPal's servers to debit the sender and credit the receiver. |
| **Price-to-Quantity Calculation** | Autonomous derivation of physical item deduction from currency amount (e.g., "collect ₦1,000 for coke" -> ₦1,000 ÷ ₦500 unit price = 2 bottles deducted). |
| **Spoken Inventory Spreadsheet** | Natural language entity parsing of unstructured speech (e.g., *"Coke, 42 packs, 500 naira for 1; Maltina, 56 packs, 600 for 1"*) directly into structured inventory catalog records. |
| **Korope Manifest** | A 7-seater transit mini-bus occupancy and payment aggregate that tracks peer BLE passenger fares and notifies the driver ("Morufu Transport") of remaining seats. |
| **Audio Readout (Literacy Bridge)** | Multilingual voice feedback (Pidgin, Yoruba, Igbo, Hausa, English) that speaks confirmation and stock status aloud so non-literate merchants do not need to read or type. |
| **Daily Stock Reconciliation** | An end-of-day voice prompt and ledger summary detailing all transactions across cash, proximity escrow, and PayPal with restock alerts. |

---

## 3. Detailed Bounded Context Breakdown

### 3.1 Bounded Context: Offline Escrow & PayPal Settlement (`core/escrow/`)
- **Aggregate Root**: `OfflineEscrowToken`
  - Enforces default offline blackout invariant.
  - States: `OFFLINE_CREATED` → `PEER_ACKNOWLEDGED` → `SYNCING_TO_PAYPAL` → `PAYPAL_SETTLED` (or `FAILED`).
- **Value Objects**:
  - `Cryptogram`: Hash, algorithm (`HMAC-SHA256`), nonce, digital signature, ISO timestamp.
  - `DeviceIdentity`: Device UUID, friendly name, account number, optional public key.
  - `EscrowStatus`: Status enumeration.
- **Domain Services**:
  - `CryptographicExchangeService`: Generates deterministic cryptographic handshake payloads.
- **Application Use Cases**:
  - `CreateOfflineEscrowUseCase`: Initiates offline payment, broadcasts via BLE proximity transport, and stores locally.
  - `SyncEscrowsToPayPalUseCase`: Opportunistic background worker that detects network restoration and executes PayPal Capture REST API.
- **Infrastructure Adapters**:
  - `PayPalSdkGatewayAdapter`: Implements `IPayPalGateway` for payment settlement.
  - `MockProximityTransportAdapter`: Implements `IProximityTransport` for BLE/Wi-Fi Direct peer mesh.
  - `LocalStorageEscrowRepository`: Persists offline tokens with zero-data guarantees.

---

### 3.2 Bounded Context: Smart Resource Tracker (`core/resource-tracking/`)

#### Sub-domain A: Merchant / Trader
- **Aggregate Root**: `InventoryItem`
  - Invariants: Non-negative stock quantity; automated low-stock warnings when `stock <= lowStockThreshold`.
- **Entities & Value Objects**:
  - `MerchantSale`: Record of completed sale with payment method (`bluetooth_escrow`, `cash`, `paypal`).
  - `StockQuantity`: Packaging units (`bottle`, `can`, `pack`, `piece`, `bag`, `carton`).
- **Domain Services**:
  - `PriceToQuantityCalculator`: Executes dynamic division of currency by registered unit price (`1000 / 500 = 2 bottles`).
  - `SpokenInventoryParser`: Converts spoken speech into catalog rows for non-literate shop owners.
- **Application Use Cases**:
  - `ProcessVoiceSaleUseCase`: Executes "collect 1,000 for coke", deducts stock, records sale, emits domain event.
  - `BulkImportVoiceInventoryUseCase`: Ingests multi-item spoken registration streams.
  - `GenerateDailyReconciliationUseCase`: Assembles end-of-day review and restock alert readout.

#### Sub-domain B: Personal Budget
- **Aggregate Root**: `BudgetPlan`
  - Encapsulates budget categories and historical expense ledger.
- **Entities**:
  - `BudgetCategory`: `food`, `transport`, `upkeep`, `other` with allocated and spent balances.
  - `ExpenseRecord`: Timestamped item expense with note (e.g., *"for spag (Golden Penny)"*).
- **Domain Services**:
  - `ExpenseCategorizerService`: Semantic dictionary for colloquial items (spag, garri, danfo, salon) and conversational fallback for unknown items.
- **Application Use Cases**:
  - `DeductBudgetExpenseUseCase`: Auto-deducts expenses; returns `AMBIGUITY_DETECTED` if item is unknown.
  - `ResolveCategoryAmbiguityUseCase`: Clarifies category according to user voice response.

#### Sub-domain C: Transit / Korope Fleet
- **Aggregate Root**: `KoropeTrip`
  - Invariants: 7 seats maximum; prevents overbooking; tracks passenger BLE device IDs and payment method.
- **Entities**:
  - `PassengerSeat`: Seat number (1..7), fare amount (₦300), passenger name, payment timestamp.
- **Application Use Cases**:
  - `CollectPassengerFaresUseCase`: Scans nearby peers, assigns payments, and speaks status to driver Morufu.

---

### 3.3 Bounded Context: Hybrid AI Assistant (`core/hybrid-assistant/`)
- **Intent Parsing & Zero-Data SLM**:
  - `LocalSLMAdapter`: Lightweight mobile intent tokenizer capable of full offline execution.
  - Recognizes `COLLECT_MERCHANT_PAYMENT`, `BULK_SETUP_INVENTORY`, `DEDUCT_BUDGET_EXPENSE`, `COLLECT_TRANSIT_FARES`, `DAILY_RECONCILIATION`.
- **Multilingual Support**:
  - `MultilingualVoiceService`: Real-time localization into Nigerian Pidgin, Yoruba, Igbo, Hausa, and English.
- **Accessibility & Literacy Bridge**:
  - `WebSpeechSynthesisAdapter`: Native speech readout ensuring users who cannot read or write receive spoken confirmation.

---

## 4. Verification Suite

All domain models, invariant rules, and use cases are verified with an executable test suite in [`core/__tests__/domain-verification.ts`](file:///home/gamp/Desktop/T-Pay-Repo/core/__tests__/domain-verification.ts).

Run verification:
```bash
node --experimental-strip-types --loader ./ts-loader.mjs core/__tests__/domain-verification.ts
```

Output:
```
================================================================
🚀 T-PAY DOMAIN-DRIVEN DESIGN (DDD) ARCHITECTURAL VERIFICATION
================================================================

--- TEST 1: Money Value Object Invariants ---
✓ 500 NGN + 1000 NGN = ₦1,500

--- TEST 2: Merchant Case 1 ("collect 1,000 for coke") ---
   [EVENT] 📦 InventoryStockDeductedEvent fired: Coke (50cl Pet) (-2 units, remaining: 40)
✓ Spoken Confirmation: "Sold 2 bottles of Coke (50cl Pet) for ₦1,000. Remaining in stock: 40."
✓ Units Sold: 2 (Expected: 2 bottles at ₦500 each)
✓ Remaining Coke Stock: 40 bottles

--- TEST 3: Merchant Voice Inventory Sheet Builder ---
✓ Imported Items Count: 3
✓ Generated Summary: "Recorded 3 items in your inventory sheet: Coke: 42 packs at ₦500 each, Maltina: 56 packs at ₦600 each, Agege Bread: 18 pieces at ₦800 each."

--- TEST 4: Regular User Case 2 ("send 2k for spag") ---
   [EVENT] 💰 ExpenseRecordedEvent fired: ₦2,000 for spag (Category: food)
✓ Categorization Status: SUCCESS
✓ Category Assigned: Food & Groceries (ID: food)
✓ Spoken Confirmation: "Deducted ₦2,000 from your Food & Groceries budget for spag. Remaining: ₦34,000."

--- TEST 5: Regular User Ambiguity Fallback ("send 1500 for gizmo") ---
✓ Ambiguity Detected: true
✓ Clarification Question: "Does "gizmo" fall under food, transport, or upkeep?"
   [EVENT] 💰 ExpenseRecordedEvent fired: ₦1,500 for gizmo (Category: upkeep)
✓ Ambiguity Resolved: "Noted! Deducted ₦1,500 from Upkeep & Personal Care for gizmo. Remaining balance: ₦15,000."

--- TEST 6: Bus Driver Case 3 ("collect money from everybody") ---
✓ Driver: Morufu Transport
✓ Seats: 5 / 7 paid
✓ Driver Spoken Alert: "5 passengers have paid. You have 2 seats left."

--- TEST 7: Offline Escrow Token & PayPal Settlement ---
   [EVENT] 💳 EscrowSettledViaPayPalEvent fired: PAYPAL-ORD-I4H1H6HE
✓ Escrow Token Created: ID 1a6a2f63-01cd-4b16-afaf-e0997cfe7f35
✓ Zero-Data Cryptogram: HMAC-SHA256:0000000013c1710f1a...
✓ Status: PAYPAL_SETTLED
   Simulating opportunistic PayPal sync when Device reconnects to network...
✓ PayPal Sync Result: All offline escrow transactions are already synchronized with PayPal.

--- TEST 8: Hybrid Assistant Multilingual Voice Command (Pidgin) ---
   [EVENT] 📦 InventoryStockDeductedEvent fired: Coke (50cl Pet) (-2 units, remaining: 38)
✓ Intent Recognized: COLLECT_MERCHANT_PAYMENT
✓ Execution Mode: offline_slm
✓ Regional Language: pidgin
✓ Localized Speech Readout: "Sold 2 bottles of Coke (50cl Pet) for ₦1,000. E remain 38 for store."

================================================================
🎉 ALL DOMAIN-DRIVEN DESIGN (DDD) SPECIFICATIONS VERIFIED 100%!
================================================================
```

