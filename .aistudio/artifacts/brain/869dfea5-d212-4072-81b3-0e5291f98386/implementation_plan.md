# T-Pay Rebranding: Electric Crimson & Obsidian Smart Banking

Implementation plan for rebranding all instances of "Zenith Bank" to "T-Pay" across the single-page application, swipable card carousel, native Expo React Native codebase, and voice assistant.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1 Clarifications:**
> - **Brand Identity**: Complete transition from Zenith Bank to **T-Pay** with an electric crimson and obsidian visual palette.
> - **Emblem**: High-contrast, bold **'T'** brand emblem styled in crimson with subtle neon/glow borders.
> - **Account Naming**:
>   1. **T-Pay Checking** (Primary Current & Daily Payments, Acct: `2084739102`)
>   2. **T-Pay Savings** (High Yield Vault Savings +6.8% APY, Acct: `0039481920`)
>   3. **T-Pay Offline Checking** (Bluetooth Low Energy & Wi-Fi Direct Mesh Account, Acct: `9102837461`)
> - **Full Codebase Parity**: Update both the live web application and the universal Expo React Native app in `/react-native-app/` (`App.tsx`, `app.json`, `package.json`, `README.md`).

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the application into the official **T-Pay** mobile banking experience. Retains the Zenith-inspired horizontal swiping ergonomics and center opposing half-barb send-receive circle with "hold to speak" while fully adopting T-Pay's electric crimson and obsidian design language.
- **Target Persona**: Urban commuters, unbanked and tech-savvy digital banking users, and merchants using T-Pay for online, in-person, and offline transactions.
- **Key Value**: Distinctive, proprietary T-Pay branding with native iOS and Android readiness.

---

### 2. User Experience & Visual Design

- **Brand Token Updates**:
  - Replace the "Z" emblem with an electric crimson **"T"** badge featuring a drop shadow and metallic border.
  - Wordmark: **"T-PAY"** / **"T-Pay Mobile"**.
  - Footer & Disclaimers: *"T-Pay Global · Decentralized Transit & Smart Banking Ecosystem"*.
  - Voice Assistant: *"T-Pay AI Voice Assistant"* with voice intent processing for transfers and balance inquiries.
  - Peer Scanning: *"T-Pay Mesh Network · Bluetooth Low Energy & Wi-Fi Direct"*.
- **Card Styling Hierarchy**:
  - **T-Pay Checking**: Charcoal obsidian card with electric crimson ribbon, gold EMV chip, and contactless symbol.
  - **T-Pay Savings**: Deep obsidian and ruby card with gold EMV chip and +6.8% APY yield counter.
  - **T-Pay Offline Checking**: Dark crimson glow with live Bluetooth beacon badge and 1-click nearby device discovery.
- **Center Action Circle**:
  - Retains the custom dual half-barb opposing arrows icon (one up, one down) with the `"hold to speak"` label below.
  - Short Tap: Opens T-Pay Send & Receive modal.
  - Hold Down: Activates T-Pay AI Voice Assistant.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Name and Metadata Alignment**:
  - *Chosen Approach*: Update `metadata.json`, `index.html`, and `app.json` so titles, open-graph cards, and app names reflect "T-Pay Mobile".
  - *Why*: Ensures branding consistency across browser tabs, social shares, and mobile installation packages.
- **Decision 2: Synchronization with `/react-native-app/`**:
  - *Chosen Approach*: Update all account labels, titles, and bundle configs in `/react-native-app/App.tsx` and `/react-native-app/app.json` (`com.tpay.mobile`).
  - *Why*: Guarantees that the physical Expo Go testing experience matches the web simulator identically.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        T-PAY SMART BANKING CORE                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│   T-PAY CHECKING    │  │    T-PAY SAVINGS    │  │ T-PAY OFFLINE CHK   │
│ - Acct: 2084739102  │  │ - Acct: 0039481920  │  │ - Acct: 9102837461  │
│ - Available: ₦84.5k │  │ - Available: ₦420k  │  │ - Available: ₦25k   │
│ - Bold 'T' Emblem   │  │ - +6.8% APY Vault   │  │ - BLE Offline Beacon│
└──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │   CENTER OPPOSING HALF-BARB BUTTON & "HOLD TO SPEAK"     │
       │   - Tap: T-Pay Send & Receive Sheet                      │
       │   - Hold: T-Pay AI Voice Assistant                       │
       └──────────────────────────────────────────────────────────┘
```

#### Files to Update:
1. `src/data/bankingData.ts`: Rename accounts to "T-Pay Checking", "T-Pay Savings", "T-Pay Offline Checking" and adjust references.
2. `src/components/AccountCarousel.tsx`: Change brand badge to "T" and title to "T-PAY".
3. `src/components/SendReceiveModal.tsx`: Update recipient bank labels and account details to T-Pay.
4. `src/components/VoiceAssistantModal.tsx`: Rebrand to "T-Pay AI Voice Assistant".
5. `src/App.tsx`: Update headers, footers, notifications, and code export drawer.
6. `/react-native-app/App.tsx`, `app.json`, and `README.md`: Update all native React Native references to T-Pay.
