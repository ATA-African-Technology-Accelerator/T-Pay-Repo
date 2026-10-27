import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Eye,
  EyeOff,
  Smartphone,
  Zap,
  Radio,
  QrCode,
  ShieldCheck,
  CreditCard,
  Send,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { BankAccount, BankTransaction, NearbyPeer } from './types/banking';
import { INITIAL_ACCOUNTS, INITIAL_BANK_TRANSACTIONS } from './data/bankingData';
import { AccountCarousel } from './components/AccountCarousel';
import { CenterSendReceiveButton } from './components/CenterSendReceiveButton';
import { NearbyPeerScannerModal } from './components/NearbyPeerScannerModal';
import { SendReceiveModal } from './components/SendReceiveModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { TransactionList } from './components/TransactionList';
import { soundEffects } from './utils/audio';

export default function App() {
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [transactions, setTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Modals state
  const [isSendReceiveOpen, setIsSendReceiveOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isNearbyScannerOpen, setIsNearbyScannerOpen] = useState(false);
  const [isAirtimeOpen, setIsAirtimeOpen] = useState(false);
  const [isExportDrawerOpen, setIsExportDrawerOpen] = useState(false);
  const [targetPlatform, setTargetPlatform] = useState<'ios' | 'android'>('ios');
  const [airtimePhone, setAirtimePhone] = useState('08034567890');
  const [airtimeAmount, setAirtimeAmount] = useState('2000');
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  const activeAccount = accounts[activeAccountIndex];

  // Transactions filtered to currently active swiped account
  const filteredTransactions = transactions.filter(
    (tx) => tx.accountId === activeAccount.id
  );

  const showAlert = (message: string) => {
    setBannerAlert(message);
    setTimeout(() => setBannerAlert(null), 3500);
  };

  // Handler for standard send transfer
  const handleSendTransfer = (
    fromAccountId: string,
    toName: string,
    toAcct: string,
    amount: number,
    bank: string
  ) => {
    setAccounts((prev) =>
      prev.map((acct) => {
        if (acct.id === fromAccountId) {
          return {
            ...acct,
            availableBalance: Math.max(0, acct.availableBalance - amount),
            ledgerBalance: Math.max(0, acct.ledgerBalance - amount),
          };
        }
        return acct;
      })
    );

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      accountId: fromAccountId,
      title: `Transfer to ${toName}`,
      subtitle: `${bank} · ${toAcct}`,
      category: 'transfer',
      amount: -amount,
      currency: 'NGN',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reference: `ZEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'successful',
      recipient: {
        name: toName,
        accountNumber: toAcct,
        bankName: bank,
        method: 'nip_transfer',
      },
    };

    setTransactions((prev) => [newTx, ...prev]);
    showAlert(`₦${amount.toLocaleString()} sent to ${toName} (${toAcct}) successfully.`);
  };

  // Handler for Offline Peer Transfer (Bluetooth OTP)
  const handleOfflinePeerTransfer = (peer: NearbyPeer, amount: number) => {
    setAccounts((prev) =>
      prev.map((acct) => {
        if (acct.type === 'offline_checking') {
          return {
            ...acct,
            availableBalance: Math.max(0, acct.availableBalance - amount),
            ledgerBalance: Math.max(0, acct.ledgerBalance - amount),
          };
        }
        return acct;
      })
    );

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      accountId: 'acct-offline',
      title: `Offline BLE Transfer to ${peer.name}`,
      subtitle: `Bluetooth Cryptogram · Acct: ${peer.accountNumber}`,
      category: 'offline_peer',
      amount: -amount,
      currency: 'NGN',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reference: `BLE-OTP-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'offline_synced',
      recipient: {
        name: peer.name,
        accountNumber: peer.accountNumber,
        method: 'bluetooth_otp',
      },
    };

    setTransactions((prev) => [newTx, ...prev]);
    showAlert(`Offline BLE transfer of ₦${amount.toLocaleString()} to ${peer.name} synced!`);
  };

  // Handler for Airtime purchase
  const handleBuyAirtime = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(airtimeAmount);
    if (isNaN(num) || num <= 0 || num > activeAccount.availableBalance) return;

    soundEffects.playCoinSound();
    setAccounts((prev) =>
      prev.map((acct) => {
        if (acct.id === activeAccount.id) {
          return {
            ...acct,
            availableBalance: Math.max(0, acct.availableBalance - num),
          };
        }
        return acct;
      })
    );

    const newTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      accountId: activeAccount.id,
      title: `Airtime Top-Up for ${airtimePhone}`,
      subtitle: `Direct Debit · ${activeAccount.name}`,
      category: 'airtime',
      amount: -num,
      currency: 'NGN',
      date: 'Today',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reference: `VTU-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'successful',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsAirtimeOpen(false);
    showAlert(`₦${num.toLocaleString()} airtime recharged for ${airtimePhone}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Toast Alert */}
      <AnimatePresence>
        {bannerAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 inset-x-0 mx-auto w-full max-w-sm z-50 px-4"
          >
            <div className="bg-red-950/95 border border-red-500/80 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between text-xs text-white backdrop-blur-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{bannerAlert}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Switcher & Code Export Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs max-w-xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Device:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTargetPlatform('ios')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                targetPlatform === 'ios'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              iOS (iPhone)
            </button>
            <button
              onClick={() => setTargetPlatform('android')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                targetPlatform === 'android'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Android (Pixel)
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsExportDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] border border-slate-700 transition"
        >
          <span>React Native Code</span>
        </button>
      </div>

      {/* Main Single Page Banking App Viewport Container inside device frame */}
      <div className="flex-1 w-full max-w-md mx-auto my-3 sm:my-6 rounded-[44px] bg-slate-900/90 border-4 border-slate-800 shadow-2xl p-4 sm:p-5 flex flex-col relative overflow-hidden">
        {/* Hardware Notch / Island */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1 pb-3 select-none">
          <span>9:41</span>
          {targetPlatform === 'ios' ? (
            <div className="w-24 h-5 bg-black rounded-full border border-slate-800 flex items-center justify-end px-2">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800" />
          )}
          <span className="font-mono text-[10px]">
            {targetPlatform === 'ios' ? '5G · 100%' : 'LTE · 98%'}
          </span>
        </div>

        {/* Top Header Bar */}
        <header className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-3">
            {/* User Profile Avatar with Online Beacon */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center font-bold text-white shadow-md shadow-red-700/30 border border-red-400/40">
                MO
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Good day,</span>
                <button
                  type="button"
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="text-slate-400 hover:text-white transition"
                  title="Toggle show/hide balances"
                >
                  {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <h1 className="text-sm font-bold text-white tracking-tight">
                Malik Olajuwon
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Voice Assistant"
            >
              <Zap className="w-4 h-4 text-red-500" />
            </button>
            <button
              onClick={() => showAlert('You have no unread security notifications.')}
              className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            </button>
          </div>
        </header>

        {/* 1. ACCOUNTS SECTION: SWIPABLE CHECKING, SAVINGS, AND OFFLINE CHECKING */}
        <div className="mb-4">
          <AccountCarousel
            accounts={accounts}
            activeIndex={activeAccountIndex}
            onSelectAccount={setActiveAccountIndex}
            isBalanceHidden={isBalanceHidden}
            onToggleHideBalance={() => setIsBalanceHidden(!isBalanceHidden)}
            onTriggerNearbyScan={() => setIsNearbyScannerOpen(true)}
          />
        </div>

        {/* 2. CENTER SEND-RECEIVE ACTION CIRCLE (THE SIGNATURE COMPONENT) */}
        {/* "Below the accounts' div, on the bottom of the page, create a circle in the center of the page. In that circle make a send-receive icon which is two half-barb-arrows facing opposite directions, one facing up, the other facing down. Below the circle, indicate 'hold to speak'" */}
        <div className="py-1">
          <CenterSendReceiveButton
            onTap={() => setIsSendReceiveOpen(true)}
            onHoldToSpeak={() => setIsVoiceAssistantOpen(true)}
          />
        </div>

        {/* 3. QUICK BANKING SERVICES STRIP */}
        <div className="grid grid-cols-4 gap-2.5 my-3">
          <button
            onClick={() => setIsSendReceiveOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 active:scale-95 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center mb-1.5 group-hover:bg-red-600 group-hover:text-white transition">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 text-center">Transfer</span>
          </button>

          <button
            onClick={() => setIsNearbyScannerOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 active:scale-95 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center mb-1.5 group-hover:bg-red-600 group-hover:text-white transition">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 text-center">Offline BLE</span>
          </button>

          <button
            onClick={() => setIsAirtimeOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 active:scale-95 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-1.5 group-hover:bg-slate-700 transition">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 text-center">Airtime</span>
          </button>

          <button
            onClick={() => {
              showAlert('T-Pay QR Scanner initialized.');
              setIsSendReceiveOpen(true);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 active:scale-95 transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-1.5 group-hover:bg-slate-700 transition">
              <QrCode className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 text-center">QR Pay</span>
          </button>
        </div>

        {/* 4. ACTIVITY FEED FILTERED TO CURRENTLY SWIPED ACCOUNT */}
        <div className="flex-1 mt-2 mb-6">
          <TransactionList
            transactions={filteredTransactions}
            accountName={activeAccount.name}
          />
        </div>

        {/* Bottom T-Pay Brand Footer */}
        <footer className="text-center text-[10px] text-slate-500 pt-3 border-t border-slate-900">
          <div>T-Pay Global · Decentralized Transit & Smart Banking Ecosystem</div>
          <div className="mt-0.5 text-slate-600">Universal React Native · iOS & Android Ready</div>
        </footer>

        {/* Bottom Hardware Navigation Bar (iOS Home Pill vs Android Navigation) */}
        <div className="pt-3 pb-1 flex items-center justify-center select-none">
          {targetPlatform === 'ios' ? (
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          ) : (
            <div className="flex items-center gap-12 text-slate-500 text-xs">
              <span>◀</span>
              <span className="w-3 h-3 rounded-full border border-slate-500" />
              <span>■</span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 5: REACT NATIVE EXPO PROJECT VIEWER & EXPORT DRAWER */}
      {isExportDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚛️</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Universal React Native (Expo) Project</h3>
                  <p className="text-[11px] text-slate-400">Ready for iOS (iPhone) and Android</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>How to run on your physical phone with Expo Go:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>Download <strong>Expo Go</strong> from the App Store (iOS) or Google Play (Android).</li>
                <li>In your terminal run: <code className="text-red-400 font-mono">cd react-native-app && npx expo start</code></li>
                <li>Scan the terminal QR code with your iPhone Camera or Android Expo Go app.</li>
              </ol>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
              <div className="text-[11px] text-red-400 mb-2 font-bold">// File: /react-native-app/App.tsx</div>
              <pre className="text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
{`import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Pressable, Dimensions,
  FlatList, Modal, TextInput, Vibration, Platform
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// 3 Swipable Accounts: Checking, Savings, and Offline Checking
// Center Button with two opposing half-barb arrows & 'hold to speak'
// Bluetooth & Wi-Fi nearby peer discovery`}
              </pre>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Directory: /react-native-app/</span>
              <button
                onClick={() => {
                  showAlert('React Native Expo project files ready in /react-native-app/');
                  setIsExportDrawerOpen(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 1: Send & Receive Modal Sheet */}
      <SendReceiveModal
        isOpen={isSendReceiveOpen}
        onClose={() => setIsSendReceiveOpen(false)}
        accounts={accounts}
        activeAccountIndex={activeAccountIndex}
        onSendTransfer={handleSendTransfer}
        onOpenNearbyScan={() => setIsNearbyScannerOpen(true)}
      />

      {/* MODAL 2: AI Voice Assistant Sheet ("hold to speak") */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        accounts={accounts}
        onExecuteVoiceTransfer={(fromType, toName, amount) => {
          const acct = accounts.find((a) => a.type === fromType) || accounts[0];
          handleSendTransfer(acct.id, toName, '0129384719', amount, 'Zenith Bank');
        }}
        onOpenNearbyScan={() => setIsNearbyScannerOpen(true)}
      />

      {/* MODAL 3: Nearby Peer Discovery Scanner (Offline Bluetooth & Wi-Fi) */}
      <NearbyPeerScannerModal
        isOpen={isNearbyScannerOpen}
        onClose={() => setIsNearbyScannerOpen(false)}
        senderBalance={
          accounts.find((a) => a.type === 'offline_checking')?.availableBalance || 0
        }
        onCompleteOfflineTransfer={handleOfflinePeerTransfer}
      />

      {/* MODAL 4: Quick Airtime Top-Up Modal */}
      {isAirtimeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl"
          >
            <button
              onClick={() => setIsAirtimeOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white mb-1">Buy Airtime / Data</h3>
            <p className="text-xs text-slate-400 mb-4">
              Debit from {activeAccount.name}
            </p>
            <form onSubmit={handleBuyAirtime} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={airtimePhone}
                  onChange={(e) => setAirtimePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount (NGN)</label>
                <input
                  type="number"
                  required
                  value={airtimeAmount}
                  onChange={(e) => setAirtimeAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs mt-2 transition"
              >
                Recharge ₦{Number(airtimeAmount || 0).toLocaleString()}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
