import { CarrierProvider, TransitRoute, TransitStation, Transaction, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Malik Olajuwon',
  email: 'olajuwonmalik2020@gmail.com',
  phone: '+234 803 456 7890',
  tpayHandle: '@malik.tpay',
  walletBalance: 14850, // ₦14,850 (~$9.90 USD)
  carrierAirtimeBalance: 4500, // ₦4,500 on MTN SIM
  activePass: {
    name: 'Metropolitan FastPass Pro',
    type: 'monthly_unlimited',
    validUntil: 'Nov 30, 2026',
    zoneAccess: 'Zone 1 - 4 (All Transit)',
    tripsToday: 2,
    dailyCapReached: false,
  },
  card: {
    cardNumber: '5399 •••• •••• 8821',
    holderName: 'MALIK OLAJUWON',
    expiry: '08/29',
    cvv: '849',
    isFrozen: false,
    contactlessEnabled: true,
    dailyLimit: 50000,
    spentToday: 3200,
  },
};

export const TRANSIT_STATIONS: TransitStation[] = [
  { id: 'st-1', name: 'Marina Central Terminal', line: 'Blue Line Metro', code: 'MAR', zone: 1 },
  { id: 'st-2', name: 'National Theatre Arts', line: 'Blue Line Metro', code: 'NTA', zone: 1 },
  { id: 'st-3', name: 'Mile 2 Interchange', line: 'Blue Line / BRT', code: 'ML2', zone: 2 },
  { id: 'st-4', name: 'Ikeja Capital Station', line: 'Red Line Metro', code: 'IKJ', zone: 2 },
  { id: 'st-5', name: 'Lekki Phase 1 Gate', line: 'BRT Express 01', code: 'LKK', zone: 2 },
  { id: 'st-6', name: 'Victoria Island CBD', line: 'BRT Express 04', code: 'VIC', zone: 1 },
  { id: 'st-7', name: 'Murtala Muhammed Airport Link', line: 'Airport Rail', code: 'LOS', zone: 3 },
  { id: 'st-8', name: 'Ikorodu Waterfront Ferry', line: 'Electric Ferry Link', code: 'IKR', zone: 4 },
];

export const TRANSIT_ROUTES: TransitRoute[] = [
  {
    id: 'rt-1',
    origin: TRANSIT_STATIONS[0], // Marina
    destination: TRANSIT_STATIONS[2], // Mile 2
    mode: 'metro',
    durationMinutes: 14,
    baseFare: 750,
    discountedFare: 500,
    distanceKm: 13.5,
    departuresEvery: 6,
    frequencyPeak: 'Every 4 mins',
  },
  {
    id: 'rt-2',
    origin: TRANSIT_STATIONS[5], // Victoria Island
    destination: TRANSIT_STATIONS[4], // Lekki
    mode: 'brt',
    durationMinutes: 20,
    baseFare: 450,
    discountedFare: 300,
    distanceKm: 8.2,
    departuresEvery: 5,
    frequencyPeak: 'Every 3 mins',
  },
  {
    id: 'rt-3',
    origin: TRANSIT_STATIONS[3], // Ikeja
    destination: TRANSIT_STATIONS[6], // Airport
    mode: 'rail',
    durationMinutes: 11,
    baseFare: 1200,
    discountedFare: 850,
    distanceKm: 7.8,
    departuresEvery: 10,
    frequencyPeak: 'Every 8 mins',
  },
  {
    id: 'rt-4',
    origin: TRANSIT_STATIONS[7], // Ikorodu
    destination: TRANSIT_STATIONS[0], // Marina
    mode: 'ferry',
    durationMinutes: 25,
    baseFare: 1500,
    discountedFare: 1100,
    distanceKm: 21.0,
    departuresEvery: 15,
    frequencyPeak: 'Every 12 mins',
  },
];

export const CARRIER_PROVIDERS: CarrierProvider[] = [
  {
    id: 'mtn',
    name: 'MTN Direct Billing',
    code: 'MTN-NG',
    logoColor: '#FFCC00',
    prefix: ['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906'],
    conversionRate: 1.0,
  },
  {
    id: 'airtel',
    name: 'Airtel Money & Billing',
    code: 'AIRTEL-NG',
    logoColor: '#E60000',
    prefix: ['0802', '0808', '0708', '0812', '0701', '0902', '0901', '0904'],
    conversionRate: 1.0,
  },
  {
    id: 'glo',
    name: 'Glo Direct Carrier',
    code: 'GLO-NG',
    logoColor: '#2EB82E',
    prefix: ['0805', '0807', '0705', '0815', '0811', '0905'],
    conversionRate: 1.0,
  },
  {
    id: '9mobile',
    name: '9mobile MicroPay',
    code: '9MOB-NG',
    logoColor: '#006633',
    prefix: ['0809', '0817', '0818', '0909', '0908'],
    conversionRate: 1.0,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    title: 'Marina Metro Turnstile Tap-In',
    category: 'transit',
    amount: -500,
    currency: 'NGN',
    timestamp: 'Today, 08:42 AM',
    status: 'completed',
    paymentMethod: 'tpay_wallet',
    reference: 'TP-METRO-9831',
    meta: {
      station: 'Marina Central Terminal',
      line: 'Blue Line Metro',
    },
  },
  {
    id: 'tx-102',
    title: 'MTN Airtime Direct Carrier Reload',
    category: 'carrier_topup',
    amount: 3000,
    currency: 'NGN',
    timestamp: 'Yesterday, 07:15 PM',
    status: 'completed',
    paymentMethod: 'carrier_billing',
    reference: 'DCB-MTN-44910',
    meta: {
      carrier: 'MTN Nigeria',
      phoneNumber: '+234 803 456 7890',
    },
  },
  {
    id: 'tx-103',
    title: 'BRT Express 04 Bus Tap',
    category: 'transit',
    amount: -300,
    currency: 'NGN',
    timestamp: 'Yesterday, 05:30 PM',
    status: 'completed',
    paymentMethod: 'tpay_wallet',
    reference: 'TP-BRT-1142',
    meta: {
      station: 'Victoria Island CBD',
      line: 'BRT Express 04',
    },
  },
  {
    id: 'tx-104',
    title: 'Received from @amara.pay',
    category: 'p2p_transfer',
    amount: 5000,
    currency: 'NGN',
    timestamp: 'Oct 23, 02:18 PM',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'P2P-883921',
    meta: {
      recipient: 'Amara Okafor',
    },
  },
  {
    id: 'tx-105',
    title: 'Electric Ferry Terminal Tap',
    category: 'transit',
    amount: -1100,
    currency: 'NGN',
    timestamp: 'Oct 22, 09:12 AM',
    status: 'completed',
    paymentMethod: 'tpay_wallet',
    reference: 'TP-FERRY-7701',
    meta: {
      station: 'Ikorodu Waterfront',
      line: 'Electric Ferry',
    },
  },
];

export interface HackathonSlide {
  id: string;
  badge: string;
  title: string;
  headline: string;
  content: string[];
  metrics: { label: string; value: string; detail: string }[];
}

export const HACKATHON_DECK: HackathonSlide[] = [
  {
    id: 'problem',
    badge: 'Problem: The Blackout Crisis',
    title: 'Connectivity Blackouts & Cash Friction in Emerging Commerce',
    headline: 'Asymmetric connectivity and network dead zones break everyday payments for traders, commuters, and salary earners.',
    content: [
      'The Asymmetric Network Trap: One person has internet while the recipient does not, leading to payment timeouts, unverified transfers, and customer-merchant disputes.',
      'Non-Literate Merchant Gap: Over 54 million market women and traders struggle with complex banking apps, typing ledgers, or manual spreadsheet inputs.',
      'Double-Spend Fraud Barrier: Previous offline payment concepts failed because malicious actors could duplicate tokens without central server verification.',
    ],
    metrics: [
      { label: 'Network Failure Rate', value: '38%', detail: 'During peak open-air market hours' },
      { label: 'Informal Commerce', value: '$120B', detail: 'Transacted primarily in cash' },
      { label: 'Non-Literate Traders', value: '54M+', detail: 'Needing voice-first AI interfaces' },
    ],
  },
  {
    id: 'solution',
    badge: 'Solution: 3 Smart Tracker Cases',
    title: 'Smart Resource Tracker & Multilingual Hybrid AI',
    headline: 'Zero-data AI that tracks dynamic resources across Merchants, Regular Users, and Transit Fleets.',
    content: [
      'Case 1 · The Merchant: "Collect 1k for coke" -> auto-deducts 2 bottles (at ₦500), compiles spoken inventory spreadsheets ("Sprite 36 packs"), and runs end-of-day audio stock audits.',
      'Case 2 · The Regular User: Monthly Food, Transport, and Upkeep budget. Colloquial commands like "Send 2k for spag" auto-classify under Food with conversational ambiguity resolution.',
      'Case 3 · The Bus Driver: 7-seat Korope mini-bus manifest. "Collect money from everybody" receives passenger fares via Bluetooth/Wi-Fi mesh and speaks occupancy alerts to Morufu.',
    ],
    metrics: [
      { label: 'Languages Supported', value: '5', detail: 'Pidgin, Yoruba, Igbo, Hausa, English' },
      { label: 'Offline SLM Latency', value: '<80ms', detail: 'Zero cloud latency on mobile' },
      { label: 'Literacy Gap Closed', value: '100%', detail: 'Full hands-free audio readout' },
    ],
  },
  {
    id: 'architecture',
    badge: 'Architecture: The Big Gun',
    title: 'Dual-App Local Trust & The Budget-Locked Vault',
    headline: 'Pre-funded cryptographic lock on PayPal balance + opportunistic multi-hop clearinghouse settlement.',
    content: [
      'Budget-Locked Market Vault: User pre-allocates an Offline Vault while online (e.g. ₦10,000 for 24h), placing a cryptographic pre-auth lock on their PayPal balance.',
      'Eliminates Double-Spend Fraud: Because funds are pre-locked on PayPal servers, merchants accept offline HMAC-SHA256 tokens with 100% guarantee that funds exist.',
      'Opportunistic Clearinghouse: Whichever device gets internet first transmits the cryptogram to PayPal APIs for settlement and instant funds disbursement.',
      'Auto-Melt Guarantee: Any unspent funds automatically melt back into the user primary balance when the 5h or 24h timer expires.',
    ],
    metrics: [
      { label: 'Double-Spend Fraud', value: '0%', detail: 'Guaranteed by PayPal pre-lock' },
      { label: 'Lock Window', value: '5h / 24h', detail: 'Customizable market trip duration' },
      { label: 'Auto-Melt Refund', value: '100%', detail: 'Instant return of unspent funds' },
    ],
  },
  {
    id: 'strategy',
    badge: 'Business: Closed-Loop vs API',
    title: 'Hackathon Launch to Universal Offline Payment Rail',
    headline: 'Launch as Closed-Loop Wallet first to establish network density; scale to B2B Infrastructure API.',
    content: [
      'Hackathon & Launch Phase: Closed-Loop T-Pay Wallet. Total control over cryptographic ledger, zero fraud, maximum user loyalty, and exclusive access to the Secure Budget Vault.',
      'B2B API Scaling Phase: License the offline escrow protocol to Tier-1 banks (Moniepoint, OPay, PalmPay) to solve POS terminal bloat and hardware costs.',
      'Interoperable Standard: T-Pay becomes the NIBSS / Interswitch of offline payment tokens across African commerce.',
    ],
    metrics: [
      { label: 'Hackathon Focus', value: 'Closed-Loop', detail: 'Exclusive T-Pay Budget Vault' },
      { label: 'B2B Market Size', value: '$8.4B', detail: 'Terminal interoperability flow' },
      { label: 'Merchant Retention', value: '96%', detail: 'Daily inventory lock-in' },
    ],
  },
];

