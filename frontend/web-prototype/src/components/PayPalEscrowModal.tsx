import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Zap,
  Radio,
  FileCode,
  DollarSign,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { INITIAL_OFFLINE_ESCROW_TOKENS } from '../data/resourceTrackerData';
import { OfflineEscrowToken } from '../types/banking';
import { soundEffects } from '../utils/audio';

interface PayPalEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEscrowSettled?: (token: OfflineEscrowToken) => void;
}

export function PayPalEscrowModal({
  isOpen,
  onClose,
  onEscrowSettled,
}: PayPalEscrowModalProps) {
  const [tokens, setTokens] = useState<OfflineEscrowToken[]>(INITIAL_OFFLINE_ESCROW_TOKENS);
  const [isOnline, setIsOnline] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<OfflineEscrowToken | null>(tokens[1]);
  const [paypalCheckoutState, setPaypalCheckoutState] = useState<'idle' | 'processing' | 'approved'>('idle');
  const [activeTab, setActiveTab] = useState<'vault' | 'tokens' | 'direct'>('vault');

  // Time-Locked Market Vault State (Dual-App Local Trust Model)
  const [vaultAllocated, setVaultAllocated] = useState<number>(10000);
  const [vaultSpent, setVaultSpent] = useState<number>(2000);
  const [vaultDurationHours, setVaultDurationHours] = useState<number>(24);
  const [vaultStatus, setVaultStatus] = useState<'LOCKED_ACTIVE' | 'EXPIRED_MELTED'>('LOCKED_ACTIVE');
  const [vaultPreAuthId, setVaultPreAuthId] = useState<string>('PAYPAL-PREAUTH-VAULT-7829');
  const [vaultCryptoHash, setVaultCryptoHash] = useState<string>('HMAC-SHA256:VAULT-0000370a55fe');
  const [selectedLockPreset, setSelectedLockPreset] = useState<number>(10000);

  if (!isOpen) return null;

  const vaultRemaining = Math.max(0, vaultAllocated - vaultSpent);

  // Simulate locking a new budget vault
  const handleLockVault = (amount: number, hours: number) => {
    soundEffects.playGateSound();
    setVaultAllocated(amount);
    setVaultSpent(0);
    setVaultDurationHours(hours);
    setVaultStatus('LOCKED_ACTIVE');
    const newPreAuth = `PAYPAL-PREAUTH-VAULT-${Math.floor(1000 + Math.random() * 9000)}`;
    setVaultPreAuthId(newPreAuth);
    setVaultCryptoHash(`HMAC-SHA256:VAULT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    soundEffects.playPaymentSuccess();
    setSuccessBanner(
      `Market Vault Locked: ₦${amount.toLocaleString()} cryptographically locked on PayPal balance for ${hours} hours. Ready for offline shopping!`
    );
    setTimeout(() => setSuccessBanner(null), 4500);
  };

  // Simulate spending from offline vault
  const handleSpendFromVault = (amount: number = 2000, recipient: string = 'Mama Nkechi Provisions') => {
    if (vaultStatus !== 'LOCKED_ACTIVE' || vaultRemaining < amount) {
      setSuccessBanner(`Cannot spend: insufficient vault balance or vault melted.`);
      setTimeout(() => setSuccessBanner(null), 3000);
      return;
    }

    soundEffects.playGateSound();
    setVaultSpent((prev) => prev + amount);

    // Create an offline escrow token backed by this vault
    const newToken: OfflineEscrowToken = {
      id: `vault-tok-${Date.now().toString().slice(-4)}`,
      senderDeviceId: 'TPAY-USER-VAULT-BLE',
      senderName: 'Malik Olajuwon',
      senderAccount: '9102837461 (Market Vault)',
      recipientDeviceId: 'PAYPAL-MERCHANT-NKECHI',
      recipientName: recipient,
      recipientAccount: 'paypal@nkechimart.ng',
      amount,
      currency: 'NGN',
      cryptogram: `HMAC-SHA256:VAULT-VOUCHER-${Math.random().toString(36).substring(2, 10)}`,
      createdOfflineAt: 'Just now (Zero-Data)',
      syncedToPayPal: false,
    };

    setTokens((prev) => [newToken, ...prev]);
    setSelectedToken(newToken);
    soundEffects.playSuccess();
    setSuccessBanner(
      `Spent ₦${amount.toLocaleString()} offline at ${recipient}. Authorized from locked Market Vault.`
    );
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Simulate timer expiry: unspent funds melt back to primary checking balance
  const handleMeltVault = () => {
    if (vaultStatus === 'EXPIRED_MELTED') return;
    soundEffects.playCoinSound();
    const melted = vaultRemaining;
    setVaultStatus('EXPIRED_MELTED');
    setSuccessBanner(
      `Timer Expired! ₦${melted.toLocaleString()} unspent funds automatically melted back to your primary PayPal Checking balance.`
    );
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  // Simulate network toggle and auto-sync
  const toggleNetwork = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    soundEffects.playGateSound();

    if (nextState) {
      // Automatic PayPal sync triggers when either Device A or B gets internet
      const unsynced = tokens.find((t) => !t.syncedToPayPal);
      if (unsynced) {
        handleSyncToPayPal(unsynced.id);
      }
    }
  };

  const handleSyncToPayPal = (tokenId: string) => {
    setSyncingId(tokenId);
    soundEffects.playGateSound();

    setTimeout(() => {
      const generatedOrderId = `PAYID-ESCROW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      setTokens((prev) =>
        prev.map((t) =>
          t.id === tokenId
            ? {
                ...t,
                syncedToPayPal: true,
                paypalCaptureId: generatedOrderId,
                paypalOrderStatus: 'COMPLETED',
              }
            : t
        )
      );

      const target = tokens.find((t) => t.id === tokenId);
      if (target && onEscrowSettled) {
        onEscrowSettled({
          ...target,
          syncedToPayPal: true,
          paypalCaptureId: generatedOrderId,
          paypalOrderStatus: 'COMPLETED',
        });
      }

      setSyncingId(null);
      soundEffects.playSuccess();
      setSuccessBanner(
        `Token settled! PayPal confirmed Order ${generatedOrderId}. Funds released from escrow.`
      );
      setTimeout(() => setSuccessBanner(null), 4500);
    }, 1800);
  };

  // Direct PayPal Sandbox Checkout Simulation
  const handlePaypalDirectCheckout = () => {
    setPaypalCheckoutState('processing');
    soundEffects.playGateSound();

    setTimeout(() => {
      setPaypalCheckoutState('approved');
      soundEffects.playPaymentSuccess();

      const newToken: OfflineEscrowToken = {
        id: `escrow-tok-${Date.now().toString().slice(-4)}`,
        senderDeviceId: 'TPAY-USER-APP-ONLINE',
        senderName: 'Malik Olajuwon',
        senderAccount: '9102837461 (T-Pay)',
        recipientDeviceId: 'PAYPAL-MERCHANT-NKECHI',
        recipientName: 'Mama Nkechi Provisions',
        recipientAccount: 'paypal@nkechimart.ng',
        amount: 2500,
        currency: 'NGN',
        cryptogram: `HMAC-SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
        createdOfflineAt: 'Instant Online via PayPal',
        syncedToPayPal: true,
        paypalCaptureId: `PAYID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        paypalOrderStatus: 'COMPLETED',
      };

      setTokens((prev) => [newToken, ...prev]);
      setSelectedToken(newToken);
      setTimeout(() => setPaypalCheckoutState('idle'), 3000);
    }, 1500);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-600/30">
              <span className="font-black text-white text-base tracking-tighter">P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  PayPal Offline Escrow
                </h3>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                  The Big Gun
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Zero-Data BLE Cryptogram ➔ Automatic PayPal API Settlement
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0 mt-3">
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Market Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'tokens'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Escrow Tokens</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 rounded-full font-mono">
              {tokens.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>PayPal Direct</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-4 py-4 pr-1">
          {/* Network Simulator Strip (Always present to test online/offline) */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-950/90 text-emerald-400 flex items-center justify-center border border-emerald-800">
                  <Wifi className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-red-950/90 text-red-400 flex items-center justify-center border border-red-800">
                  <WifiOff className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-white">
                  Device Network: {isOnline ? 'Online (Internet Active)' : 'Offline (Zero Data / Blackout)'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isOnline
                    ? 'PayPal webhook sync active. Escrow tokens clear automatically.'
                    : 'T-Pay defaults to offline cryptograms between Device A & B.'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleNetwork}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/30'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isOnline ? 'Simulate Blackout' : 'Restore Network'}</span>
            </button>
          </div>

          {/* Success Banner */}
          {successBanner && (
            <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* TAB 1: THE TIME-LOCKED BUDGET VAULT ("MARKET VAULT") */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              {/* Concept explanation banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/80 to-blue-950/60 border border-sky-800/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-sky-300 font-bold">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>The "Budget-Locked Vault" Dual-App Local Trust Architecture</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Before going to the market where cell reception is zero, you pre-allocate a <strong className="text-white">Market Vault</strong> while online. This places a cryptographic lock on your PayPal balance for a set period (e.g. 24 hours). Merchants accept offline payments with zero fraud risk because funds cannot be double-spent. When the timer expires, unspent funds automatically melt back into your balance!
                </p>
              </div>

              {/* Active Vault Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] text-sky-400 font-mono uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Lock className="w-3 h-3" />
                      <span>PayPal Budget-Locked Vault</span>
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ₦{vaultRemaining.toLocaleString()}
                      <span className="text-xs text-slate-400 font-normal ml-2">remaining</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      ₦{vaultAllocated.toLocaleString()} allocated · ₦{vaultSpent.toLocaleString()} spent offline
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                      vaultStatus === 'LOCKED_ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {vaultStatus === 'LOCKED_ACTIVE' ? 'Active Lock (24h)' : 'Melted / Refunded'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((vaultRemaining / vaultAllocated) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Spent: ₦{vaultSpent.toLocaleString()}</span>
                    <span>Cap: ₦{vaultAllocated.toLocaleString()}</span>
                  </div>
                </div>

                {/* Technical Cryptogram Details */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>PayPal Pre-Auth ID:</span>
                    <span className="text-sky-300 font-semibold">{vaultPreAuthId}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Cryptographic Lock:</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{vaultCryptoHash}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Lock Duration:</span>
                    <span className="text-white">{vaultDurationHours} Hours (Market Window)</span>
                  </div>
                </div>

                {/* Interactive Simulation Controls */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleSpendFromVault(2000, 'Mama Nkechi Provisions')}
                    disabled={vaultStatus !== 'LOCKED_ACTIVE' || vaultRemaining < 2000}
                    className="p-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs flex flex-col items-start transition shadow-md shadow-sky-950/40"
                  >
                    <div className="flex items-center gap-1 text-[10px] opacity-80">
                      <Zap className="w-3 h-3" />
                      <span>OFFLINE SPEND</span>
                    </div>
                    <span className="mt-0.5">Pay ₦2,000 for Coke</span>
                  </button>

                  <button
                    onClick={handleMeltVault}
                    disabled={vaultStatus === 'EXPIRED_MELTED' || vaultRemaining === 0}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white font-bold text-xs flex flex-col items-start transition border border-slate-700"
                  >
                    <div className="flex items-center gap-1 text-[10px] text-amber-400">
                      <Clock className="w-3 h-3" />
                      <span>SIMULATE EXPIRY</span>
                    </div>
                    <span className="mt-0.5">Auto-Melt Unspent</span>
                  </button>
                </div>
              </div>

              {/* Pre-Fund New Vault Options */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Pre-Fund Market Vault</span>
                  <span className="text-[10px] text-slate-400 font-mono">Instant PayPal Lock</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSelectedLockPreset(amt)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        selectedLockPreset === amt
                          ? 'bg-sky-600/30 text-sky-300 border-sky-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLockVault(selectedLockPreset, 5)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition border border-slate-700"
                  >
                    Lock for 5 Hours (Trip)
                  </button>
                  <button
                    onClick={() => handleLockVault(selectedLockPreset, 24)}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition shadow-md shadow-sky-600/30"
                  >
                    Lock for 24 Hours (Day)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFLINE PEER TOKENS & CRYPTOGRAMS */}
          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Opportunistic Clearinghouse Settlement</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Both devices store this encrypted cryptographic voucher. Whichever device reconnects to the network first transmits the payload to PayPal's capture endpoint.
                </p>
              </div>

              {/* Escrow Token Vault Queue */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-white uppercase tracking-wider">
                    Offline Escrow Tokens
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {tokens.filter((t) => !t.syncedToPayPal).length} pending PayPal clearance
                  </span>
                </div>

                <div className="space-y-2">
                  {tokens.map((tok) => {
                    const isSelected = selectedToken?.id === tok.id;
                    const isSyncing = syncingId === tok.id;

                    return (
                      <div
                        key={tok.id}
                        onClick={() => setSelectedToken(tok)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-sky-500 shadow-md shadow-sky-950/40'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                tok.syncedToPayPal
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {tok.syncedToPayPal ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{tok.senderName}</span>
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                                <span>{tok.recipientName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {tok.createdOfflineAt}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-bold text-white text-xs">
                              ₦{tok.amount.toLocaleString()}
                            </div>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                tok.syncedToPayPal
                                  ? 'text-emerald-400 bg-emerald-950/80'
                                  : 'text-amber-400 bg-amber-950/80'
                              }`}
                            >
                              {tok.syncedToPayPal ? 'PayPal Settled' : 'Offline Vault Hold'}
                            </span>
                          </div>
                        </div>

                        {/* Cryptogram preview */}
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-slate-400 truncate max-w-[200px]">
                            {tok.cryptogram}
                          </span>

                          {!tok.syncedToPayPal ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSyncToPayPal(tok.id);
                              }}
                              disabled={isSyncing}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-sm"
                            >
                              {isSyncing ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Zap className="w-3 h-3" />
                              )}
                              <span>{isSyncing ? 'Dispatching...' : 'Sync to PayPal'}</span>
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-mono font-semibold">
                              ID: {tok.paypalCaptureId}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT PAYPAL CHECKOUT */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Direct PayPal Gateway Test</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Sandbox Active</span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Test immediate online payment using the official PayPal Checkout component. Dispatches orders to PayPal API and updates the local ledger.
                </p>

                <button
                  onClick={handlePaypalDirectCheckout}
                  disabled={paypalCheckoutState === 'processing'}
                  className="w-full py-3 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-lg shadow-sky-900/30"
                >
                  {paypalCheckoutState === 'processing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authorizing via PayPal APIs...</span>
                    </>
                  ) : paypalCheckoutState === 'approved' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Payment Approved & Captured via PayPal!</span>
                    </>
                  ) : (
                    <>
                      <span className="font-extrabold italic text-sm text-[#003087] bg-white px-1.5 py-0.5 rounded mr-1">
                        Pay<span className="text-[#0070BA]">Pal</span>
                      </span>
                      <span>Pay ₦2,500 ($1.62 USD) via PayPal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Cryptographic Zero-Knowledge Escrow</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Close Vault
          </button>
        </div>

      </motion.div>
    </div>
  );
}
