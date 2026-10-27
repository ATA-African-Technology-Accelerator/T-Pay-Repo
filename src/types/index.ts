export type TransitMode = 'metro' | 'brt' | 'ferry' | 'rail' | 'toll';

export interface TransitStation {
  id: string;
  name: string;
  line: string;
  code: string;
  zone: number;
}

export interface TransitRoute {
  id: string;
  origin: TransitStation;
  destination: TransitStation;
  mode: TransitMode;
  durationMinutes: number;
  baseFare: number;
  discountedFare: number;
  distanceKm: number;
  departuresEvery: number; // in minutes
  frequencyPeak: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: 'transit' | 'carrier_topup' | 'p2p_transfer' | 'utility' | 'merchant';
  amount: number; // positive = credit, negative = debit
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'tpay_wallet' | 'carrier_billing' | 'virtual_card' | 'bank_transfer';
  reference: string;
  meta?: {
    station?: string;
    line?: string;
    carrier?: string;
    phoneNumber?: string;
    recipient?: string;
    token?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  tpayHandle: string;
  walletBalance: number;
  carrierAirtimeBalance: number;
  activePass: {
    name: string;
    type: 'monthly_unlimited' | 'day_pass' | 'pay_as_you_go';
    validUntil: string;
    zoneAccess: string;
    tripsToday: number;
    dailyCapReached: boolean;
  };
  card: {
    cardNumber: string;
    holderName: string;
    expiry: string;
    cvv: string;
    isFrozen: boolean;
    contactlessEnabled: boolean;
    dailyLimit: number;
    spentToday: number;
  };
}

export interface CarrierProvider {
  id: string;
  name: string;
  code: string;
  logoColor: string;
  prefix: string[];
  conversionRate: number; // e.g. 1 airtime = 0.90 cash
}

export type ActiveTab = 'transit' | 'wallet' | 'carrier' | 'routes' | 'conductor' | 'pitch';
export type AppViewMode = 'mobile_frame' | 'responsive' | 'pitch_deck';
