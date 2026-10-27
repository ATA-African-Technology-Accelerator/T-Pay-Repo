import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Scan, CheckCircle2, Users, DollarSign, ArrowDownRight, Shield, Receipt } from 'lucide-react';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ConductorPOSProps {
  onCollectFare: (amount: number, lineName: string) => void;
}

export function ConductorPOS({ onCollectFare }: ConductorPOSProps) {
  const [shiftFares, setShiftFares] = useState(38400);
  const [passengersCount, setPassengersCount] = useState(78);
  const [isScanning, setIsScanning] = useState(false);
  const [lastPassenger, setLastPassenger] = useState<{
    name: string;
    fare: number;
    time: string;
    mode: string;
  } | null>(null);

  const simulatePassengerTap = (fare = 500, mode = 'Blue Line Metro') => {
    setIsScanning(true);
    soundEffects.playTransitTapSound();

    setTimeout(() => {
      setIsScanning(false);
      setShiftFares((prev) => prev + fare);
      setPassengersCount((prev) => prev + 1);
      setLastPassenger({
        name: 'Passenger #0' + (passengersCount + 1),
        fare,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        mode,
      });

      try {
        confetti({
          particleCount: 20,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#10b981', '#6366f1'],
        });
      } catch {
        // ignore
      }

      onCollectFare(fare, mode);
    }, 450);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-white">
      {/* Conductor POS Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-semibold">T-Pay Edge Conductor Terminal</h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Shift #4402 · Marshal ID: T-882 · Line: Victoria Island CBD
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
          ONLINE · SYNCED
        </span>
      </div>

      {/* Shift Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Shift Revenue</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            ₦{shiftFares.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Instant settlement</div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Boarded Commuters</span>
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {passengersCount} riders
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Avg 48s per boarding</div>
        </div>
      </div>

      {/* Tap-to-Phone Optical / NFC Reader Simulation */}
      <div className="relative bg-slate-950 rounded-2xl p-6 border border-slate-800 text-center overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-3">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
                isScanning
                  ? 'bg-emerald-500 shadow-xl shadow-emerald-500/40 animate-pulse'
                  : 'bg-indigo-600/20 border-2 border-dashed border-indigo-400/50'
              }`}
            >
              <Scan className={`w-9 h-9 ${isScanning ? 'text-white' : 'text-indigo-400'}`} />
            </div>
            {/* Pulsing ring */}
            <span className="absolute -inset-2 rounded-3xl border border-indigo-500/30 animate-pulse pointer-events-none" />
          </div>

          <div className="text-sm font-semibold text-slate-100">
            {isScanning ? 'Scanning Passenger Token...' : 'Conductor Tap-to-Phone Active'}
          </div>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Hold passenger phone against conductor device or point camera at passenger QR pass
          </p>

          <div className="mt-4 flex gap-2 w-full max-w-xs">
            <button
              onClick={() => simulatePassengerTap(500, 'Metro FastRail')}
              disabled={isScanning}
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 active:scale-95 transition disabled:opacity-50"
            >
              Tap Commuter (₦500)
            </button>
            <button
              onClick={() => simulatePassengerTap(300, 'BRT Transit')}
              disabled={isScanning}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 active:scale-95 transition disabled:opacity-50"
            >
              Tap BRT (₦300)
            </button>
          </div>
        </div>
      </div>

      {/* Last Transaction Receipt Card */}
      <AnimatePresence>
        {lastPassenger && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-white">
                  {lastPassenger.name} · Verified
                </div>
                <div className="text-[11px] text-slate-400">
                  {lastPassenger.mode} · {lastPassenger.time}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-emerald-400 tabular-nums">
                +₦{lastPassenger.fare}
              </div>
              <div className="text-[10px] text-slate-400">Offline Auth</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
