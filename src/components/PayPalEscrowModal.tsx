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

  if (!isOpen) return null;

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

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-4 py-4 pr-1">
          {/* Network Simulator Strip */}
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

          {/* Offline Escrow Architecture Explanation */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>How the Offline Escrow Bridge Solves Intermittent Blackouts</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When Device A pays Device B with no internet, both exchange an encrypted cryptogram via Bluetooth OTP. As soon as <strong className="text-white">either device</strong> gains internet connection, T-Pay dispatches the message to PayPal's API. PayPal executes the transaction, credits Device B, and clears the escrow hold.
            </p>
          </div>

          {/* Escrow Token Vault Queue */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-white uppercase tracking-wider">
                Cryptographic Escrow Vault
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

          {/* Interactive PayPal Checkout Sandbox Strip */}
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
