# T-Pay Navigation Architecture: Accounts Swiper & Dashboard Overview

Implementation plan for configuring the top-right hamburger menu navigation where **Accounts** opens the core T-Pay experience (the 3 swipable cards: Checking, Savings, and Offline Checking, along with the center action circle), while **Dashboard** provides executive overview stats, spending health, and quick actions, alongside **Tracker**, **History**, and **Settings**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Phase 1 Clarifications:**
> - **Accounts Option**: Tapping **Accounts** in the hamburger menu opens the core T-Pay page featuring:
>   - The 3 horizontally swipable cards (T-Pay Checking, T-Pay Savings, T-Pay Offline Checking).
>   - The center action circle with the two opposing half-barb arrows and "hold to speak" sub-label.
>   - The quick services grid (Transfer, Offline BLE, Airtime, QR Pay).
>   - The live activity feed synced to the currently active swiped account.
> - **Dashboard Option**: Displays an executive financial overview featuring aggregate net worth across all 3 accounts, inflow/outflow balance trends, quick action shortcuts, and upcoming standing orders/reminders.
> - **Tracker Option**: Spending category breakdown, monthly budget caps, and daily transit limit analytics.
> - **History Option**: Searchable and filterable full transaction ledger with date filters and downloadable e-receipts.
> - **Settings Option**: Security, biometric authentication, and T-Pay Mesh Bluetooth/Wi-Fi discovery visibility.
> - **Codebase Parity**: Configured across both the active web simulator and the Expo React Native app in `/react-native-app/App.tsx`.

---

### 1. Overview & Core Concept

- **What It Does**: Establishes a crystal-clear distinction between high-level executive analytics (**Dashboard**) and the hands-on daily transacting experience (**Accounts**). When users tap "Accounts", they are brought directly to their swipable cards where they can swipe between Checking, Savings, and Offline Checking, tap the center circle to send/receive, or hold to speak to the AI assistant.
- **Target Persona**: Commuters, savers, and daily spenders who want instant access to their physical-like card swiper when managing accounts, and high-level health metrics when on the dashboard.
- **Key Value**: Delivers the exact workflow expected by bank app users: "Accounts" is the home card-swiping hub.

---

### 2. User Experience & Visual Design

- **Navigation Flow via Hamburger Menu**:
  1. User taps the top-right **Hamburger Menu icon** (`Menu`).
  2. The right-side drawer slides in smoothly, displaying the user summary (Malik Olajuwon, Tier 3 Verified).
  3. Menu Options:
     - `Dashboard`: Aggregate net worth card (₦529,500 total assets), monthly trend sparkline, quick pay buttons, and credit score health.
     - `Accounts`: The signature T-Pay page with the 3 swipable cards (Checking, Savings, Offline Checking), the opposing half-barb center circle ("hold to speak"), and the active account transaction ledger.
     - `Tracker`: Categorized spending charts, budget usage meter, and expense distribution.
     - `History`: Full searchable transaction feed with category filters (All, Inflow, Outflow, BLE Mesh).
     - `Settings`: Mesh visibility toggle, Face ID/Fingerprint, notifications, and transfer limits.
  4. Tapping any option closes the drawer and transitions seamlessly to the chosen view.

- **Visual Continuity**:
  - Consistent electric crimson (`#dc2626`) and obsidian (`#0f172a`) visual language across all screens.
  - Active screen title and back-to-accounts navigation breadcrumb on secondary views.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Default Landing Screen**:
  - *Chosen Approach*: Keep **Accounts** as the default landing view when the app loads so users immediately see their swipable cards, balances, and center send/receive button, while making Dashboard, Tracker, History, and Settings accessible via the hamburger menu.
  - *Why*: Directly aligns with the user's primary requirement of engaging with the swipable accounts page.
- **Decision 2: Seamless State Management**:
  - *Chosen Approach*: Use a shared `activeView: 'accounts' | 'dashboard' | 'tracker' | 'history' | 'settings'` state so account balances, transfers, and offline BLE transactions remain instantly updated across every view.
  - *Why*: Eliminates synchronization delay and maintains real-time offline continuity.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        T-PAY MULTI-VIEW ROUTER                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
       ┌─────────────────────┐             ┌─────────────────────┐
       │ TOP-RIGHT HAMBURGER │             │ RIGHT SLIDE DRAWER  │
       │ MENU TRIGGER        │ ──────────► │ - User Card         │
       └─────────────────────┘             │ - 5 Navigation Items│
                                           └──────────┬──────────┘
                                                      │
         ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
         ▼                  ▼                 ▼                  ▼                  ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐
│ 1. ACCOUNTS     │ │ 2. DASHBOARD  │ │ 3. TRACKER    │ │ 4. HISTORY    │ │ 5. SETTINGS     │
│ (CORE HOME)     │ │ - Net Worth   │ │ - Spending    │ │ - Full Filter │ │ - BLE Visibility│
│ - 3 Swipable    │ │   ₦529,500    │ │   Mix Chart   │ │   Ledger      │ │ - Biometrics    │
│   Cards         │ │ - Cash Inflow │ │ - Monthly Cap │ │ - Search Tx   │ │ - Limits        │
│ - Center Circle │ │ - Quick Stats │ │ - Budget Use  │ │ - Receipts    │ │ - Profile Info  │
│   "hold to speak│ └───────────────┘ └───────────────┘ └───────────────┘ └─────────────────┘
└─────────────────┘
```

#### Files to Create / Update:
1. `src/components/views/DashboardView.tsx`: Overview stats view (net worth aggregate, inflow/outflow trends, quick shortcuts).
2. `src/components/NavigationDrawer.tsx`: Update item routing so `accounts` maps to the 3 swipable cards and `dashboard` maps to the overview.
3. `src/App.tsx`: Mount hamburger button in header, manage `activeView` defaulting to `accounts`, and render views.
4. `/react-native-app/App.tsx`: Update React Native Expo code with identical hamburger navigation and views.
