export type AccountType = 'checking' | 'savings' | 'offline_checking';

export interface BankAccount {
  id: string;
  type: AccountType;
  name: string;
  accountNumber: string;
  availableBalance: number;
  ledgerBalance: number;
  currency: string;
  cardColor: string;
  accentColor: string;
  badge: string;
  statsLabel: string;
  statsValue: string;
  details: {
    bvnMasked: string;
    branch: string;
    tier: string;
    status: 'active' | 'offline_beacon';
  };
}

export interface BankTransaction {
  id: string;
  accountId: string;
  title: string;
  subtitle: string;
  category: 'transfer' | 'airtime' | 'utility' | 'offline_peer' | 'deposit';
  amount: number; // positive = credit, negative = debit
  currency: string;
  date: string;
  time: string;
  reference: string;
  status: 'successful' | 'pending' | 'offline_synced';
  recipient?: {
    name: string;
    accountNumber: string;
    bankName?: string;
    method?: 'bluetooth_otp' | 'nip_transfer' | 'ussd';
  };
}

export interface NearbyPeer {
  id: string;
  name: string;
  accountNumber: string;
  distance: string;
  signalStrength: number; // 1 to 5
  protocol: 'bluetooth' | 'wifi_direct';
  avatarColor: string;
  deviceModel: string;
  isVerified: boolean;
}

export interface VoiceCommandResult {
  intent: 'transfer' | 'check_balance' | 'nearby_pay' | 'buy_airtime' | 'unknown';
  targetAccount?: AccountType;
  amount?: number;
  recipientName?: string;
  summary: string;
}
