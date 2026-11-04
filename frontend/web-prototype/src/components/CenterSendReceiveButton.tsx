import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { soundEffects } from '../utils/audio';

interface CenterSendReceiveButtonProps {
  onTap: () => void;
  onHoldToSpeak: () => void;
}

export function CenterSendReceiveButton({ onTap, onHoldToSpeak }: CenterSendReceiveButtonProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const triggeredHold = useRef(false);

  const startHold = () => {
    triggeredHold.current = false;
    setIsPressing(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const HOLD_DURATION = 420; // ms to trigger hold-to-speak

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setHoldProgress(progress);
    }, 25);

    pressTimer.current = setTimeout(() => {
      triggeredHold.current = true;
      setIsPressing(false);
      setHoldProgress(0);
      clearInterval(progressInterval.current!);
      soundEffects.playTransitTapSound();
      if (navigator.vibrate) {
        navigator.vibrate([40, 50, 40]);
      }
      onHoldToSpeak();
    }, HOLD_DURATION);
  };

  const endHold = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (!triggeredHold.current && isPressing) {
      // Short tap: Open Send & Receive Modal Sheet
      soundEffects.playGateSound();
      onTap();
    }

    setIsPressing(false);
    setHoldProgress(0);
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 select-none">
      {/* Outer Button Circle */}
      <div className="relative flex items-center justify-center">
        {/* Animated Hold Progress Ring */}
        {isPressing && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.15, opacity: 1 }}
            className="absolute -inset-2.5 rounded-full border-2 border-red-500 animate-ping opacity-75 pointer-events-none"
          />
        )}

        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onTouchCancel={endHold}
          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl active:scale-95 ${
            isPressing
              ? 'bg-gradient-to-tr from-red-700 to-red-500 shadow-red-500/50 scale-105'
              : 'bg-gradient-to-tr from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-700/40 hover:shadow-red-600/60'
          } border-2 border-red-400/30 text-white cursor-pointer`}
          title="Tap to Send/Receive or Hold to Speak"
        >
          {/* Custom Send-Receive Icon: Two Half-Barb Arrows Facing Opposite Directions (One Up, One Down) */}
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm transition-transform duration-200"
          >
            {/* Left arrow: Upward vertical stem with right half-barb at top */}
            <path d="M7 17.5V6.5" />
            <path d="M7 6.5L3.5 10" />

            {/* Right arrow: Downward vertical stem with left half-barb at bottom */}
            <path d="M17 6.5V17.5" />
            <path d="M17 17.5L20.5 14" />
          </svg>

          {/* SVG Progress Arc Ring during hold */}
          {isPressing && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 64 64"
            >
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeDasharray="188.5"
                strokeDashoffset={188.5 - (188.5 * holdProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Sub-label required by user: "hold to speak" */}
      <span className="mt-2 text-[11px] font-medium tracking-wide text-slate-400 lowercase transition-colors group-hover:text-red-400">
        hold to speak
      </span>
      <span className="text-[10px] text-slate-500 mt-0.5">
        or tap to send & receive
      </span>
    </div>
  );
}
