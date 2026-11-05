import { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

interface DynamicQRProps {
  userId: string;
  amount?: number;
  onRefresh?: () => void;
}

export function DynamicQR({ userId }: DynamicQRProps) {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [tokenCode, setTokenCode] = useState('TP-892F-A041-99C2');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // generate new rotating token
          const randHex = Math.random().toString(16).substring(2, 6).toUpperCase();
          const randHex2 = Math.random().toString(16).substring(2, 6).toUpperCase();
          setTokenCode(`TP-${randHex}-${randHex2}-70A1`);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progressPercent = (secondsLeft / 15) * 100;

  return (
    <div className="flex flex-col items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
      {/* Header status */}
      <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted QR</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono tabular-nums">
          <RefreshCw className={`w-3 h-3 ${secondsLeft <= 3 ? 'animate-spin text-amber-500' : 'text-slate-400'}`} />
          <span>Auto-refreshes in {secondsLeft}s</span>
        </div>
      </div>

      {/* Dynamic Visual QR Representation */}
      <div className="relative p-3 bg-white rounded-xl border-2 border-slate-900 shadow-inner group">
        <svg
          viewBox="0 0 160 160"
          className="w-44 h-44 text-slate-950"
          fill="currentColor"
        >
          {/* Outer corners / Finder patterns */}
          {/* Top-Left */}
          <rect x="10" y="10" width="40" height="40" rx="4" fill="#0f172a" />
          <rect x="18" y="18" width="24" height="24" rx="2" fill="#ffffff" />
          <rect x="24" y="24" width="12" height="12" rx="1" fill="#0f172a" />

          {/* Top-Right */}
          <rect x="110" y="10" width="40" height="40" rx="4" fill="#0f172a" />
          <rect x="118" y="18" width="24" height="24" rx="2" fill="#ffffff" />
          <rect x="124" y="24" width="12" height="12" rx="1" fill="#0f172a" />

          {/* Bottom-Left */}
          <rect x="10" y="110" width="40" height="40" rx="4" fill="#0f172a" />
          <rect x="18" y="118" width="24" height="24" rx="2" fill="#ffffff" />
          <rect x="24" y="124" width="12" height="12" rx="1" fill="#0f172a" />

          {/* Alignment pattern */}
          <rect x="116" y="116" width="24" height="24" rx="2" fill="#0f172a" />
          <rect x="122" y="122" width="12" height="12" rx="1" fill="#ffffff" />
          <rect x="126" y="126" width="4" height="4" fill="#0f172a" />

          {/* Data Matrix Dots with slight pseudo-random variation based on secondsLeft */}
          {Array.from({ length: 12 }).map((_, r) =>
            Array.from({ length: 12 }).map((_, c) => {
              const x = 58 + (c % 6) * 8;
              const y = 20 + Math.floor(r * 9.5);
              const isFilled = ((r * 7 + c * 11 + secondsLeft * 3) % 4) !== 0;
              return isFilled ? (
                <rect key={`${r}-${c}`} x={x} y={y} width="6" height="6" rx="1" fill="#0f172a" />
              ) : null;
            })
          )}

          {/* Center Brand Badge */}
          <rect x="66" y="66" width="28" height="28" rx="6" fill="#4f46e5" />
          <text
            x="80"
            y="84"
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            T
          </text>
        </svg>

        {/* Scan line laser effect */}
        <div className="absolute inset-x-3 top-3 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
      </div>

      {/* Progress countdown bar */}
      <div className="w-full mt-3 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Token ID */}
      <div className="mt-3 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 tracking-wider">
        {tokenCode}
      </div>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Hold 5cm over turnstile optical scanner or bus validator
      </p>
    </div>
  );
}
