import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Check, AlertCircle, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface TurnstileSimulatorProps {
  onSuccessfulTap: (stationName: string, fare: number) => void;
  walletBalance: number;
}

export function TurnstileSimulator({ onSuccessfulTap, walletBalance }: TurnstileSimulatorProps) {
  const [gateState, setGateState] = useState<'idle' | 'reading' | 'open' | 'declined'>('idle');
  const [lastMessage, setLastMessage] = useState('HOLD PHONE / SCAN QR');
  const [selectedStation, setSelectedStation] = useState('Marina Central (Gate #04)');
  const [selectedMode, setSelectedMode] = useState<'metro' | 'brt' | 'ferry'>('metro');
  const [lastDeduction, setLastDeduction] = useState(500);

  const triggerTap = (fare = 500) => {
    if (gateState === 'reading' || gateState === 'open') return;

    if (walletBalance < fare) {
      setGateState('declined');
      setLastMessage('INSUFFICIENT BALANCE - RECHARGE AIRTIME');
      soundEffects.playErrorBuzz();
      setTimeout(() => {
        setGateState('idle');
        setLastMessage('HOLD PHONE / SCAN QR');
      }, 2500);
      return;
    }

    setGateState('reading');
    setLastMessage('READING CRYPTOGRAM...');
    soundEffects.playTransitTapSound();

    setTimeout(() => {
      setGateState('open');
      setLastDeduction(fare);
      setLastMessage(`PASS APPROVED · ₦${fare}`);
      soundEffects.playGateSound();

      // Trigger slight celebratory sparkles on successful gate entry
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#38bdf8'],
        });
      } catch {
        // ignore
      }

      onSuccessfulTap(selectedStation, fare);

      // Auto close gate after 2.8s
      setTimeout(() => {
        setGateState('idle');
        setLastMessage('HOLD PHONE / SCAN QR');
      }, 2800);
    }, 450);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-white">
      {/* Station Selector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-100">Live Turnstile & Gate Terminal</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time contactless hardware simulator (Sub-120ms offline verification)
          </p>
        </div>

        {/* Transit Mode Pill Selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['metro', 'brt', 'ferry'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setSelectedMode(mode);
                if (mode === 'metro') setSelectedStation('Marina Central (Gate #04)');
                if (mode === 'brt') setSelectedStation('Victoria Island BRT Terminal');
                if (mode === 'ferry') setSelectedStation('Ikorodu Ferry Pier Gate');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase transition ${
                selectedMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Turnstile 3D Simulation Box */}
      <div className="relative bg-slate-950 rounded-2xl p-6 border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
        {/* Background Depth Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

        {/* Terminal Validator Display Box */}
        <div
          className={`relative z-10 w-full max-w-xs rounded-2xl p-4 text-center transition-all duration-300 border-2 ${
            gateState === 'open'
              ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-500/20'
              : gateState === 'declined'
              ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-500/20'
              : gateState === 'reading'
              ? 'bg-indigo-950/80 border-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/90 border-slate-700 shadow-md'
          }`}
        >
          {/* Top Status Bar of the Hardware Terminal */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
            <span>{selectedStation}</span>
            <span className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-indigo-400" />
              <span>NFC / QR</span>
            </span>
          </div>

          {/* Icon state */}
          <div className="my-3 flex justify-center">
            {gateState === 'open' ? (
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                <Check className="w-8 h-8 text-white stroke-[3]" />
              </div>
            ) : gateState === 'declined' ? (
              <div className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <AlertCircle className="w-8 h-8 text-white stroke-[3]" />
              </div>
            ) : gateState === 'reading' ? (
              <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center animate-spin">
                <RefreshCw className="w-7 h-7 text-white stroke-[2.5]" />
              </div>
            ) : (
              <div className="relative w-14 h-14 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center group cursor-pointer">
                <Wifi className="w-7 h-7 text-indigo-400 rotate-90" />
                <span className="absolute -inset-1 rounded-full border border-indigo-500/40 animate-ping opacity-75" />
              </div>
            )}
          </div>

          {/* Terminal Screen Message */}
          <div
            className={`font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
              gateState === 'open'
                ? 'text-emerald-400'
                : gateState === 'declined'
                ? 'text-rose-400'
                : gateState === 'reading'
                ? 'text-indigo-300'
                : 'text-slate-300'
            }`}
          >
            {lastMessage}
          </div>
        </div>

        {/* Physical Turnstile Gate Flaps (Animated Open/Close) */}
        <div className="relative z-10 w-full max-w-sm flex items-center justify-between mt-5 px-6">
          {/* Left Turnstile Pillar & Flap */}
          <div className="flex items-center gap-1">
            <div className="w-8 h-16 bg-slate-800 rounded-lg border border-slate-700 flex flex-col justify-center items-center">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            {/* Left Glass Paddle */}
            <motion.div
              animate={{
                rotate: gateState === 'open' ? -70 : 0,
                transformOrigin: 'left center',
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className={`h-4 w-20 rounded-r-md border ${
                gateState === 'open'
                  ? 'bg-emerald-500/70 border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-indigo-400/30 border-indigo-400/60'
              }`}
            />
          </div>

          {/* Center Walkway Sensor Indicator */}
          <div className="text-center">
            <span
              className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${
                gateState === 'open'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {gateState === 'open' ? 'WALKWAY OPEN' : 'BARRIER LOCKED'}
            </span>
          </div>

          {/* Right Turnstile Pillar & Flap */}
          <div className="flex items-center gap-1">
            {/* Right Glass Paddle */}
            <motion.div
              animate={{
                rotate: gateState === 'open' ? 70 : 0,
                transformOrigin: 'right center',
              }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className={`h-4 w-20 rounded-l-md border ${
                gateState === 'open'
                  ? 'bg-emerald-500/70 border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-indigo-400/30 border-indigo-400/60'
              }`}
            />
            <div className="w-8 h-16 bg-slate-800 rounded-lg border border-slate-700 flex flex-col justify-center items-center">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Tap Triggers */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Test Interactive Scenarios</span>
          <span className="font-mono text-slate-400">Standard Fare: ₦500 (~$0.33)</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => triggerTap(500)}
            disabled={gateState !== 'idle'}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 active:scale-98 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>Tap Metro Blue Line (₦500)</span>
          </button>

          <button
            onClick={() => triggerTap(300)}
            disabled={gateState !== 'idle'}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs active:scale-98 transition disabled:opacity-50 border border-slate-700"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Tap BRT Bus (₦300)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
