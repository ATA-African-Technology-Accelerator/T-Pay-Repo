import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, ChevronLeft, ChevronRight, Wifi, Shield, Radio, Eye, EyeOff } from 'lucide-react';
import { BankAccount } from '../types/banking';

interface AccountCarouselProps {
  accounts: BankAccount[];
  activeIndex: number;
  onSelectAccount: (index: number) => void;
  isBalanceHidden: boolean;
  onToggleHideBalance: () => void;
  onTriggerNearbyScan?: () => void;
}

export function AccountCarousel({
  accounts,
  activeIndex,
  onSelectAccount,
  isBalanceHidden,
  onToggleHideBalance,
  onTriggerNearbyScan,
}: AccountCarouselProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeAccount = accounts[activeIndex];

  const handleCopy = (acctNum: string) => {
    navigator.clipboard?.writeText(acctNum);
    setCopiedId(acctNum);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      onSelectAccount(activeIndex - 1);
    } else {
      onSelectAccount(accounts.length - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < accounts.length - 1) {
      onSelectAccount(activeIndex + 1);
    } else {
      onSelectAccount(0);
    }
  };

  return (
    <div className="w-full select-none">
      {/* Account Switcher Header & Indicators */}
      <div className="flex items-center justify-between px-1 mb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Account {activeIndex + 1} of {accounts.length}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-red-500 font-medium text-[11px] truncate max-w-[160px]">
            {activeAccount.badge}
          </span>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5">
          {accounts.map((acct, idx) => (
            <button
              key={acct.id}
              onClick={() => onSelectAccount(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? 'w-6 bg-red-600'
                  : 'w-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
              title={acct.name}
            />
          ))}
        </div>
      </div>

      {/* Swipable Card Container */}
      <div className="relative overflow-hidden group">
        <motion.div
          key={activeAccount.id}
          initial={{ opacity: 0.8, scale: 0.98, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0.8, scale: 0.98, x: -20 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -40) {
              handleNext();
            } else if (info.offset.x > 40) {
              handlePrev();
            }
          }}
          className={`relative rounded-3xl p-6 text-white shadow-2xl bg-gradient-to-br ${activeAccount.cardColor} border border-slate-700/60 overflow-hidden cursor-grab active:cursor-grabbing`}
        >
          {/* Subtle Zenith watermarked red glow */}
          <div className="absolute top-0 right-0 w-52 h-52 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-red-900/15 rounded-full blur-2xl pointer-events-none" />

          {/* T-Pay Brand Header */}
          <div className="relative z-10 flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              {/* Electric Crimson 'T' Emblem */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-rose-800 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-700/50 border border-red-400/40">
                T
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <span>T-PAY</span>
                  {activeAccount.type === 'offline_checking' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-red-600/30 text-red-400 border border-red-500/40">
                      OFFLINE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wide">
                  {activeAccount.name}
                </div>
              </div>
            </div>

            {/* Wireless / Contactless / BLE icon */}
            <div className="flex items-center gap-2">
              {activeAccount.type === 'offline_checking' ? (
                <div className="flex items-center gap-1 text-[11px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800">
                  <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                  <span>BLE SCAN</span>
                </div>
              ) : (
                <Wifi className="w-5 h-5 text-slate-400 rotate-90" />
              )}
            </div>
          </div>

          {/* Account Number & 1-Click Copy */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-300 tracking-wider">
                {activeAccount.accountNumber}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(activeAccount.accountNumber);
                }}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition active:scale-95 text-[11px] flex items-center gap-1"
                title="Copy Account Number"
              >
                {copiedId === activeAccount.accountNumber ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400 text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleHideBalance();
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition"
              title={isBalanceHidden ? 'Show Balance' : 'Hide Balance'}
            >
              {isBalanceHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Available Balance */}
          <div className="relative z-10 mb-5">
            <div className="text-[11px] text-slate-400 font-medium tracking-wide uppercase">
              Available Balance
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <div className="text-3xl font-extrabold tracking-tight font-mono tabular-nums text-white">
                {isBalanceHidden
                  ? '••••••••'
                  : `₦${activeAccount.availableBalance.toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                    })}`}
              </div>
            </div>
          </div>

          {/* Metallic Gold EMV Chip & Ledger Stat */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            {/* Realistic EMV Gold Chip Graphic */}
            <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-inner border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
              <div className="w-full h-[1px] bg-amber-700/40" />
              <div className="absolute inset-y-0 w-[1px] bg-amber-700/40" />
              <div className="w-4 h-3 rounded-xs border border-amber-800/40" />
            </div>

            {/* Account Specific Stat (Ledger / Interest / Offline token) */}
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {activeAccount.statsLabel}
              </div>
              <div className="font-mono text-xs font-semibold text-slate-200 tabular-nums">
                {isBalanceHidden && activeAccount.type !== 'offline_checking'
                  ? '••••••'
                  : activeAccount.statsValue}
              </div>
            </div>
          </div>

          {/* Special Offline Checking Action Ribbon */}
          {activeAccount.type === 'offline_checking' && onTriggerNearbyScan && (
            <div className="mt-4 pt-3 border-t border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-red-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Nearby Peer Scanner Ready</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerNearbyScan();
                }}
                className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/30 active:scale-95 transition"
              >
                Scan Nearby Devices
              </button>
            </div>
          )}
        </motion.div>

        {/* Desktop Carousel Arrow Navigators */}
        <button
          onClick={handlePrev}
          aria-label="Previous Account"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white items-center justify-center backdrop-blur-sm border border-slate-700 transition opacity-0 group-hover:opacity-100 z-20"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next Account"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white items-center justify-center backdrop-blur-sm border border-slate-700 transition opacity-0 group-hover:opacity-100 z-20"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe Hint Helper */}
      <div className="text-center mt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1">
        <span>← Swipe card left or right to switch accounts →</span>
      </div>
    </div>
  );
}
