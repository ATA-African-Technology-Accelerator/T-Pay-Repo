import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneShellProps {
  children: React.ReactNode;
  activeTime?: string;
}

export function PhoneShell({ children, activeTime = '9:41' }: PhoneShellProps) {
  return (
    <div className="relative mx-auto w-full max-w-[400px] rounded-[48px] p-3 bg-slate-900 border-4 border-slate-700 shadow-2xl shadow-indigo-950/50">
      {/* Outer Phone Bezel & Glare */}
      <div className="relative rounded-[38px] bg-slate-950 overflow-hidden border border-slate-800 flex flex-col min-h-[780px] max-h-[820px]">
        {/* Status Bar */}
        <div className="relative z-30 pt-3 px-6 pb-2 flex items-center justify-between text-xs text-white select-none">
          {/* Left: Time */}
          <span className="font-semibold text-xs tracking-tight">{activeTime}</span>

          {/* Center: Dynamic Island */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-slate-800" />
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Inner Phone Screen Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 pt-1">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="absolute bottom-1 inset-x-0 h-4 flex items-center justify-center pointer-events-none z-30">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
