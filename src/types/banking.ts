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
  category: 'transfer' | 'airtime' | 'utility' | 'offline_peer' | 'deposit' | 'merchant_sale' | 'paypal_escrow';
  amount: number; // positive = credit, negative = debit
  currency: string;
  date: string;
  time: string;
  reference: string;
  status: 'successful' | 'pending' | 'offline_synced' | 'paypal_settled';
  paypalOrderId?: string;
  recipient?: {
    name: string;
    accountNumber: string;
    bankName?: string;
    method?: 'bluetooth_otp' | 'nip_transfer' | 'ussd' | 'paypal' | 'offline_escrow';
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

export type SupportedLanguage = 'en' | 'pidgin' | 'yoruba' | 'igbo' | 'hausa';

export interface VoiceCommandResult {
  intent:
    | 'transfer'
    | 'check_balance'
    | 'nearby_pay'
    | 'buy_airtime'
    | 'merchant_sale'
    | 'merchant_inventory'
    | 'user_budget'
    | 'korope_collect'
    | 'unknown';
  targetAccount?: AccountType;
  amount?: number;
  recipientName?: string;
  summary: string;
  data?: Record<string, any>;
}

// Case 1: Merchant Resource Tracker Types
export interface InventoryItem {
  id: string;
  name: string;
  unitPrice: number;
  unitType: 'bottle' | 'pack' | 'bag' | 'piece' | 'can';
  stockQuantity: number;
  category: string;
  lowStockThreshold: number;
  lastUpdated: string;
}

export interface MerchantSaleRecord {
  id: string;
  itemName: string;
  quantitySold: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bluetooth_escrow' | 'paypal';
  timestamp: string;
}

// Case 2: Regular User Budget Tracker Types
export interface BudgetCategory {
  id: 'food' | 'transport' | 'upkeep' | 'other';
  label: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  iconName: string;
}

export interface ExpenseRecord {
  id: string;
  categoryId: 'food' | 'transport' | 'upkeep' | 'other';
  amount: number;
  note: string; // e.g. "for spag", "Danfo to Ikeja"
  timestamp: string;
}

// Case 3: Bus Driver (Korope) Resource Tracker Types
export interface KoropeSeat {
  seatNumber: number;
  passengerName?: string;
  passengerDeviceId?: string;
  fareAmount: number;
  isPaid: boolean;
  paymentMethod?: 'bluetooth_ble' | 'wifi_direct' | 'cash' | 'paypal_escrow';
  paidAt?: string;
}

export interface KoropeRoute {
  id: string;
  driverName: string; // e.g. "Morufu Transport"
  vehicleType: string; // "Korope (7-Seater Mini-Bus)"
  farePerSeat: number;
  totalSeats: number;
  currentRoute: string;
}

// Offline Escrow Token (The Big Gun)
export interface OfflineEscrowToken {
  id: string;
  senderDeviceId: string;
  senderName: string;
  senderAccount: string;
  recipientDeviceId: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  currency: string;
  cryptogram: string; // SHA-256 HMAC digital signature
  createdOfflineAt: string;
  syncedToPayPal: boolean;
  paypalCaptureId?: string;
  paypalOrderStatus?: 'CREATED' | 'SAVED_OFFLINE' | 'DISPATCHED_TO_PAYPAL' | 'COMPLETED';
}
