import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Store,
  User,
  Bus,
  Sparkles,
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  Radio,
  RefreshCw,
  ShoppingBag,
  Clock,
  Mic,
  CreditCard,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  INITIAL_MERCHANT_INVENTORY,
  INITIAL_MERCHANT_SALES,
  INITIAL_USER_BUDGETS,
  INITIAL_EXPENSE_RECORDS,
  KOROPE_INFO,
  INITIAL_KOROPE_SEATS,
} from '../../data/resourceTrackerData';
import {
  InventoryItem,
  MerchantSaleRecord,
  BudgetCategory,
  ExpenseRecord,
  KoropeSeat,
} from '../../types/banking';
import { soundEffects } from '../../utils/audio';

interface TrackerViewProps {
  onBackToDashboard: () => void;
  onOpenVoiceAssistant?: (suggestedPrompt?: string) => void;
  onOpenPayPalEscrow?: () => void;
}

export function TrackerView({
  onBackToDashboard,
  onOpenVoiceAssistant,
  onOpenPayPalEscrow,
}: TrackerViewProps) {
  // Active demo case: 'merchant' | 'user' | 'driver'
  const [activeCase, setActiveCase] = useState<'merchant' | 'user' | 'driver'>('merchant');

  // Case 1: Merchant State
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_MERCHANT_INVENTORY);
  const [sales, setSales] = useState<MerchantSaleRecord[]>(INITIAL_MERCHANT_SALES);
  const [merchantFeedback, setMerchantFeedback] = useState<string | null>(null);

  // Case 2: Regular User State
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_USER_BUDGETS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSE_RECORDS);
  const [pendingAmbiguity, setPendingAmbiguity] = useState<{
    amount: number;
    description: string;
  } | null>(null);
  const [userFeedback, setUserFeedback] = useState<string | null>(null);

  // Case 3: Bus Driver State
  const [koropeSeats, setKoropeSeats] = useState<KoropeSeat[]>(INITIAL_KOROPE_SEATS);
  const [isCollecting, setIsCollecting] = useState(false);
  const [driverFeedback, setDriverFeedback] = useState<string | null>(null);

  // Case 1 Action: "Collect 1000 for Coke" (Coke is ₦500 -> 2 bottles sold)
  const handleCollectCoke1k = () => {
    soundEffects.playGateSound();
    const coke = inventory.find((i) => i.id === 'item-coke');
    if (!coke) return;

    const bottlesSold = 2; // ₦1,000 / ₦500 per bottle = 2
    if (coke.stockQuantity < bottlesSold) {
      setMerchantFeedback('Insufficient Coke stock!');
      setTimeout(() => setMerchantFeedback(null), 3000);
      return;
    }

    setInventory((prev) =>
      prev.map((item) =>
        item.id === 'item-coke'
          ? {
              ...item,
              stockQuantity: item.stockQuantity - bottlesSold,
              lastUpdated: 'Just now',
            }
          : item
      )
    );

    const newSale: MerchantSaleRecord = {
      id: `sale-${Date.now()}`,
      itemName: 'Coke (50cl Pet)',
      quantitySold: bottlesSold,
      totalAmount: 1000,
      paymentMethod: 'bluetooth_escrow',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setSales((prev) => [newSale, ...prev]);
    setMerchantFeedback('Sold 2 bottles of Coke for ₦1,000. Inventory updated (-2 bottles).');

    // Speech readout for accessibility (no typing required)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Sold 2 bottles of Coke. Remaining in stock: ' + (coke.stockQuantity - bottlesSold));
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => setMerchantFeedback(null), 4000);
  };

  // Case 1 Action: Voice Inventory setup simulation
  const handleSimulateVoiceInventorySetup = () => {
    soundEffects.playSuccess();
    setInventory((prev) => [
      {
        id: `item-sprite-${Date.now()}`,
        name: 'Sprite Pet (50cl)',
        unitPrice: 500,
        unitType: 'bottle',
        stockQuantity: 36,
        category: 'Beverages',
        lowStockThreshold: 8,
        lastUpdated: 'Voice registered just now',
      },
      ...prev,
    ]);
    setMerchantFeedback('Voice registered: Sprite 36 packs @ ₦500 each compiled into spreadsheet!');
    setTimeout(() => setMerchantFeedback(null), 4000);
  };

  // Case 2 Action: "Send 2k for spag" (Golden Penny Spaghetti -> Food Category)
  const handleSendSpag2k = () => {
    soundEffects.playPaymentSuccess();
    const amount = 2000;
    const note = 'for spag (Golden Penny)';

    setBudgets((prev) =>
      prev.map((b) =>
        b.id === 'food'
          ? { ...b, spentAmount: b.spentAmount + amount }
          : b
      )
    );

    const newExp: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      categoryId: 'food',
      amount,
      note,
      timestamp: 'Just now',
    };

    setExpenses((prev) => [newExp, ...prev]);
    setUserFeedback('Deducted ₦2,000 from Food budget (tagged "for spag").');

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Deducted 2,000 naira from your Food budget for spag.');
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => setUserFeedback(null), 4000);
  };

  // Case 2 Action: Trigger Ambiguity Clarification ("Send 5k for sneakers")
  const handleTriggerAmbiguity = () => {
    setPendingAmbiguity({
      amount: 5000,
      description: 'Send 5k for sneakers',
    });
  };

  const handleResolveAmbiguity = (categoryId: 'food' | 'transport' | 'upkeep' | 'other') => {
    if (!pendingAmbiguity) return;
    const { amount, description } = pendingAmbiguity;

    setBudgets((prev) =>
      prev.map((b) =>
        b.id === categoryId
          ? { ...b, spentAmount: b.spentAmount + amount }
          : b
      )
    );

    setExpenses((prev) => [
      {
        id: `exp-${Date.now()}`,
        categoryId,
        amount,
        note: description.replace('Send 5k for ', ''),
        timestamp: 'Just now',
      },
      ...prev,
    ]);

    setPendingAmbiguity(null);
    setUserFeedback(`Allocated ₦${amount.toLocaleString()} to ${categoryId.toUpperCase()} budget.`);
    setTimeout(() => setUserFeedback(null), 3500);
  };

  // Case 3 Action: "Collect money from everybody" (Bluetooth / Wi-Fi Direct sync for Morufu Transport)
  const handleCollectEverybody = () => {
    setIsCollecting(true);
    soundEffects.playGateSound();

    setTimeout(() => {
      setKoropeSeats((prev) =>
        prev.map((seat) => {
          if (!seat.isPaid) {
            return {
              ...seat,
              passengerName: seat.seatNumber === 6 ? 'Dare Lawal' : 'Ngozi Obi',
              passengerDeviceId: `BLE-NODE-0${seat.seatNumber}9`,
              isPaid: true,
              paymentMethod: 'bluetooth_ble',
              paidAt: 'Just now',
            };
          }
          return seat;
        })
      );
      setIsCollecting(false);
      soundEffects.playSuccess();
      setDriverFeedback('All 7 seats collected! Morufu Transport full manifest synced (₦2,100).');

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('All seven passenger fares collected. Full bus paid.');
        window.speechSynthesis.speak(utterance);
      }

      setTimeout(() => setDriverFeedback(null), 4500);
    }, 1400);
  };

  const totalSeats = koropeSeats.length;
  const paidSeats = koropeSeats.filter((s) => s.isPaid).length;
  const remainingSeats = totalSeats - paidSeats;

  return (
    <div className="space-y-4 animate-fade-in text-white select-none">
      {/* Top Navigation & Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Accounts</span>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Smart Resource Tracker
          </h2>
          <div className="text-[10px] text-red-400 font-mono">Hybrid AI & Multi-Use Engine</div>
        </div>
        <button
          onClick={onOpenPayPalEscrow}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 transition"
          title="Open PayPal Offline Escrow Vault"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>PayPal Escrow</span>
        </button>
      </div>

      {/* 3 DEMO CASE SWITCHER TABS */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveCase('merchant')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeCase === 'merchant'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>1. Merchant</span>
        </button>

        <button
          onClick={() => setActiveCase('user')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeCase === 'user'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>2. User Budget</span>
        </button>

        <button
          onClick={() => setActiveCase('driver')}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeCase === 'driver'
              ? 'bg-red-600 text-white shadow-md shadow-red-700/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          <span>3. Korope (7-Seat)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* CASE 1: THE MERCHANT / TRADER (MAMA NKECHI PROVISIONS) */}
      {/* ======================================================== */}
      {activeCase === 'merchant' && (
        <div className="space-y-3">
          {/* Merchant Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mb-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>DEMO CASE 1 · TRADER & GROCERY</span>
                </div>
                <h3 className="text-base font-bold text-white">Mama Nkechi Provisions</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Voice-driven stock updates, Coke deduction logic & end-of-day reconciliation.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Store Open
              </span>
            </div>

            {/* Quick Voice Simulation Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleCollectCoke1k}
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white transition group text-left"
              >
                <div>
                  <div className="text-[10px] text-red-400 group-hover:text-red-100 font-mono">
                    VOICE COMMAND
                  </div>
                  <div className="text-xs font-bold">"Collect 1k for coke"</div>
                  <div className="text-[10px] text-slate-400 group-hover:text-white/80">
                    Coke is ₦500 → deducts 2
                  </div>
                </div>
                <Zap className="w-4 h-4 text-red-400 group-hover:text-white shrink-0 ml-1" />
              </button>

              <button
                onClick={handleSimulateVoiceInventorySetup}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition text-left"
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">VOICE ENROLLMENT</div>
                  <div className="text-xs font-bold">"Sprite, 36 packs..."</div>
                  <div className="text-[10px] text-slate-400">Compiles spreadsheet</div>
                </div>
                <Mic className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {merchantFeedback && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{merchantFeedback}</span>
            </div>
          )}

          {/* Live Inventory Spreadsheet Table */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-white">Live Inventory Spreadsheet</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {inventory.length} items registered
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              {inventory.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.stockQuantity <= item.lowStockThreshold && (
                        <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-mono">
                          LOW STOCK
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ₦{item.unitPrice.toLocaleString()} / {item.unitType} · {item.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-sm">
                      {item.stockQuantity} <span className="text-[11px] text-slate-400">{item.unitType}s</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{item.lastUpdated}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* End-of-Day Stock Review & Reconciliation Strip */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">End-of-Day Reconciliation</span>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
                Auto-Reminder Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI automatically reminds Mama Nkechi to review physical stock against recorded cash, Bluetooth OTP, and PayPal transactions.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Cash Sales</div>
                <div className="font-mono font-bold text-emerald-400">₦600</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">Offline BLE</div>
                <div className="font-mono font-bold text-red-400">₦1,000</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500">PayPal Online</div>
                <div className="font-mono font-bold text-sky-400">₦800</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CASE 2: THE REGULAR USER (SALARY EARNER BUDGETING) */}
      {/* ======================================================== */}
      {activeCase === 'user' && (
        <div className="space-y-3">
          {/* User Budget Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span>DEMO CASE 2 · REGULAR USER BUDGET</span>
                </div>
                <h3 className="text-base font-bold text-white">Monthly Expense Budget</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tracks food, transport, and upkeep with automated item categorization.
                </p>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                Salary Cap
              </span>
            </div>

            {/* Quick Action Simulation Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={handleSendSpag2k}
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white transition group text-left"
              >
                <div>
                  <div className="text-[10px] text-red-400 group-hover:text-red-100 font-mono">
                    VOICE COMMAND
                  </div>
                  <div className="text-xs font-bold">"Send 2k for spag"</div>
                  <div className="text-[10px] text-slate-400 group-hover:text-white/80">
                    Spag → Food budget
                  </div>
                </div>
                <Zap className="w-4 h-4 text-red-400 group-hover:text-white shrink-0 ml-1" />
              </button>

              <button
                onClick={handleTriggerAmbiguity}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition text-left"
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">AMBIGUITY TEST</div>
                  <div className="text-xs font-bold">"Send 5k for sneakers"</div>
                  <div className="text-[10px] text-slate-400">Triggers AI category prompt</div>
                </div>
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 ml-1" />
              </button>
            </div>
          </div>

          {/* Ambiguity Clarification Modal Dialog */}
          {pendingAmbiguity && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-red-950/90 border border-red-600 text-white space-y-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span className="text-xs font-bold">T-Pay AI Clarification</span>
              </div>
              <p className="text-xs text-slate-200">
                You said <span className="font-semibold text-white">"{pendingAmbiguity.description}"</span>. Does this fall under Food, Transport, or Upkeep?
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleResolveAmbiguity('food')}
                  className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold"
                >
                  🍔 Food
                </button>
                <button
                  onClick={() => handleResolveAmbiguity('transport')}
                  className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold"
                >
                  🚌 Transport
                </button>
                <button
                  onClick={() => handleResolveAmbiguity('upkeep')}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-700/30"
                >
                  ✨ Upkeep
                </button>
              </div>
            </motion.div>
          )}

          {/* Feedback Banner */}
          {userFeedback && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{userFeedback}</span>
            </div>
          )}

          {/* Budget Categories Visual Meters */}
          <div className="space-y-2.5">
            {budgets.map((cat) => {
              const percentUsed = Math.min(100, Math.round((cat.spentAmount / cat.allocatedAmount) * 100));
              const remaining = Math.max(0, cat.allocatedAmount - cat.spentAmount);

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{cat.label}</span>
                    <span className="font-mono text-slate-400">
                      ₦{cat.spentAmount.toLocaleString()} / ₦{cat.allocatedAmount.toLocaleString()} ({percentUsed}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentUsed}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Remaining: ₦{remaining.toLocaleString()}</span>
                    <span>Cap: ₦{cat.allocatedAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Budget Expense Spreadsheet Notes */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Recent Budget Deductions</span>
              <span className="text-[10px] text-slate-400 font-mono">{expenses.length} records</span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{exp.note}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">
                      Category: {exp.categoryId} · {exp.timestamp}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-red-400">
                    -₦{exp.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CASE 3: THE BUS DRIVER / KOROPE (MORUFU TRANSPORT) */}
      {/* ======================================================== */}
      {activeCase === 'driver' && (
        <div className="space-y-3">
          {/* Bus Driver Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono mb-1">
                  <Bus className="w-3.5 h-3.5" />
                  <span>DEMO CASE 3 · KOROPE MINI-BUS</span>
                </div>
                <h3 className="text-base font-bold text-white">{KOROPE_INFO.driverName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {KOROPE_INFO.vehicleType} · {KOROPE_INFO.currentRoute}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-mono">
                  ₦{KOROPE_INFO.farePerSeat} / seat
                </span>
              </div>
            </div>

            {/* Driver "Collect money from everybody" Voice Action */}
            <div className="mt-4">
              <button
                onClick={handleCollectEverybody}
                disabled={isCollecting || remainingSeats === 0}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition shadow-lg ${
                  remainingSeats === 0
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-700/30 active:scale-98'
                }`}
              >
                {isCollecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sweeping Bluetooth & Wi-Fi Direct...</span>
                  </>
                ) : remainingSeats === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All 7 Seats Paid! Full Trip Complete</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>"Collect money from everybody" (BLE Broadcast)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Banner */}
          {driverFeedback && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{driverFeedback}</span>
            </div>
          )}

          {/* Status Badge: Seats Paid vs Remaining */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Passenger Manifest</span>
              <span className="font-mono text-slate-400">
                ({paidSeats} of {totalSeats} seats paid)
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold ${
                remainingSeats === 0
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {remainingSeats === 0 ? 'Full (0 Left)' : `${remainingSeats} seats unpaid`}
            </span>
          </div>

          {/* Interactive 7-Seat Korope Mini-Bus Visual Layout */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="text-[11px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Korope Seating Floorplan</span>
              <span className="text-slate-500">Front ➔ Back</span>
            </div>

            {/* Mini-bus cabin representation */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
              {/* Row 1: Driver + Conductor */}
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                    D
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Morufu</div>
                    <div className="text-[9px] text-slate-500">Driver</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                    C
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Conductor</div>
                    <div className="text-[9px] text-slate-500">Doorway</div>
                  </div>
                </div>
              </div>

              {/* Passenger Seats 1 to 7 */}
              <div className="grid grid-cols-2 gap-2">
                {koropeSeats.map((seat) => (
                  <div
                    key={seat.seatNumber}
                    className={`p-2.5 rounded-xl border transition ${
                      seat.isPaid
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                        : 'bg-red-950/30 border-red-800/60 text-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>Seat #{seat.seatNumber}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          seat.isPaid
                            ? 'bg-emerald-900/80 text-emerald-300'
                            : 'bg-red-900/80 text-red-300'
                        }`}
                      >
                        {seat.isPaid ? 'PAID' : 'UNPAID'}
                      </span>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-white truncate">
                      {seat.passengerName || 'Waiting passenger...'}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>₦{seat.fareAmount}</span>
                      <span>{seat.paymentMethod ? seat.paymentMethod.replace('_', ' ') : 'Zero-data'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
