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
    badge: 'The Problem Statement',
    title: 'Transit Chaos & Cash Friction in Emerging Megacities',
    headline: '92% of everyday transit riders in Africa & META depend on slow cash, loose change disputes, and vulnerable paper tickets.',
    content: [
      'Cash handling delays average bus boarding times by 4.8x compared to contactless NFC.',
      '350 Million adults lack international debit cards (Visa/Mastercard) and are locked out of modern app wallets.',
      'Massive revenue leakages: transit operators lose 18–25% of gross collections to informal handling and fake tickets.',
    ],
    metrics: [
      { label: 'Boarding Delay', value: '4.8x', detail: 'Slower with paper cash' },
      { label: 'Unbanked Commuters', value: '350M+', detail: 'In META & Sub-Saharan Africa' },
      { label: 'Revenue Leakage', value: '22%', detail: 'Lost in informal transit operations' },
    ],
  },
  {
    id: 'solution',
    badge: 'The T-Pay Solution',
    title: 'Unified Tap-to-Pay + Direct Carrier Billing Rail',
    headline: 'Zero-friction contactless turnstile entry backed by instant telco airtime micro-billing.',
    content: [
      'Dual Protocol: Works via offline NFC tap or dynamic cryptographic rotating QR (works underground with 0 cellular data).',
      'Direct Carrier Billing (DCB): Commuters with zero bank balance can charge fares directly to their phone SIM credit (MTN, Airtel, Glo).',
      'Turn Any Phone into a Conductor POS: Bus drivers and ferry marshals accept payments with zero dedicated POS hardware.',
    ],
    metrics: [
      { label: 'Tap Latency', value: '<120ms', detail: 'Instant turnstile authorization' },
      { label: 'Offline Resilient', value: '100%', detail: 'Cryptographic offline verification' },
      { label: 'Zero POS Cost', value: '$0', detail: 'Drivers use standard Android phones' },
    ],
  },
  {
    id: 'architecture',
    badge: 'Engineering Architecture',
    title: 'Agentic & Distributed Edge Validation Engine',
    headline: 'Built with sub-second cryptograms, dual-ledger settlement, and automated fare cap optimization.',
    content: [
      'Edge Cryptogram: QR codes contain HMAC-SHA256 signatures rotated every 15s to eliminate screenshot sharing fraud.',
      'Asynchronous Batch Settlement: Turnstiles validate offline and sync with the clearinghouse ledger whenever backhaul connectivity resumes.',
      'AI Transit Copilot: Automatically computes multimodal transfer discounts, daily fare caps, and off-peak incentives.',
    ],
    metrics: [
      { label: 'Cryptogram Window', value: '15s', detail: 'Rotating fraud-proof QR token' },
      { label: 'Throughput', value: '4,200', detail: 'Taps per minute per station cluster' },
      { label: 'Settlement Engine', value: 'T+0', detail: 'Real-time operator reconciliation' },
    ],
  },
  {
    id: 'market',
    badge: 'Market & Unit Economics',
    title: 'Capturing a $48 Billion Addressable Transit Flow',
    headline: 'High-frequency micro-transactions with carrier margin sharing and municipal B2B SaaS.',
    content: [
      '1.5% interchange on wallet transactions + 4% convenience revenue on Direct Carrier Billing conversion.',
      'B2B SaaS licensing for municipal transit authorities (BRT, commuter rail, state ferry networks).',
      'Expansion into micro-utility bills: Pay power tokens, water, and toll gates via the same unified T-Pay token.',
    ],
    metrics: [
      { label: 'Annual Transit TAM', value: '$48B', detail: 'Daily commuter flow in top 15 African hubs' },
      { label: 'Blended Take Rate', value: '2.4%', detail: 'Across wallet & carrier billing' },
      { label: 'Retention Rate', value: '94%', detail: 'Daily habitual commuter lock-in' },
    ],
  },
];
