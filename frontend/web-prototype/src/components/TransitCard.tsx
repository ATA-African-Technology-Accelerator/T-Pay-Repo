import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, QrCode, CreditCard, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { soundEffects } from '../utils/audio';
import { DynamicQR } from './DynamicQR';

interface TransitCardProps {
  user: UserProfile;
  onTapTurnstile: (fare?: number) => void;
  onOpenCarrierTopUp: () => void;
  isProcessingTap?: boolean;
}

export function TransitCard({
  user,
  onTapTurnstile,
  onOpenCarrierTopUp,
  isProcessingTap = false,
}: TransitCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [isNfcActive, setIsNfcActive] = useState(false);

  const handleNfcTrigger = () => {
    setIsNfcActive(true);
    soundEffects.playTransitTapSound();
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }
    onTapTurnstile();
    setTimeout(() => {
      setIsNfcActive(false);
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* The Physical Card Canvas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 text-white shadow-xl border border-indigo-500/20">
        {/* Subtle background circuit / transit grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center font-bold text-base shadow-md">
              T
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight leading-tight">T-PAY TRANSIT</div>
              <div className="text-[11px] text-indigo-300 font-mono">ALL-ZONE MULTIMODAL</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-indigo-400 rotate-90" />
            <span className="text-[11px] font-mono uppercase text-indigo-200">Contactless NFC</span>
          </div>
        </div>

        {/* Balance & Status */}
        <div className="relative z-10 mb-6">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Available Commuter Balance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold tracking-tight font-mono tabular-nums">
              ₦{user.walletBalance.toLocaleString()}
            </span>
            <span className="text-xs text-indigo-300 font-mono">
              (~${(user.walletBalance / 1500).toFixed(2)} USD)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>{user.activePass.name}</span>
            <span>·</span>
            <span className="text-slate-400">{user.activePass.zoneAccess}</span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Cardholder</div>
            <div className="font-medium tracking-wide uppercase text-slate-200">{user.name}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition text-xs font-medium backdrop-blur-sm"
              title="Toggle QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQR ? 'Hide QR' : 'Optical QR'}</span>
            </button>

            <button
              onClick={handleNfcTrigger}
              disabled={isProcessingTap || isNfcActive}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium shadow-md shadow-indigo-500/25 active:scale-95 transition disabled:opacity-75"
            >
              <Zap className={`w-3.5 h-3.5 ${isNfcActive ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{isNfcActive ? 'Transmitting...' : 'Tap to Pay'}</span>
            </button>
          </div>
        </div>

        {/* NFC Wave Ripple Animation */}
        <AnimatePresence>
          {isNfcActive && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 2.5, 4], opacity: [0.8, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="absolute inset-0 m-auto w-24 h-24 rounded-full border-4 border-indigo-400/80 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Optical QR Drawer (when toggled) */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <DynamicQR userId={user.tpayHandle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenCarrierTopUp}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.99] transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Direct Carrier Pay</div>
              <div className="text-[11px] text-slate-400">Pay via Phone SIM Airtime</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
        </button>

        <button
          onClick={handleNfcTrigger}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 hover:border-indigo-600 active:scale-[0.99] transition text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Simulate Gate Tap</div>
              <div className="text-[11px] text-indigo-300">Auto-validates in &lt;120ms</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Daily Fare Cap Info Banner */}
      <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Daily Cap: <strong>₦1,500 Max</strong> (Free rides after cap)</span>
        </div>
        <span className="font-mono text-slate-300 tabular-nums">2 / 3 trips</span>
      </div>
    </div>
  );
}
