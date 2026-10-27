import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Zap, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { CARRIER_PROVIDERS } from '../data/mockData';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CarrierBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopUpSuccess: (amount: number, carrierName: string, phone: string) => void;
  currentAirtimeBalance: number;
}

export function CarrierBillingModal({
  isOpen,
  onClose,
  onTopUpSuccess,
  currentAirtimeBalance,
}: CarrierBillingModalProps) {
  const [selectedCarrier, setSelectedCarrier] = useState(CARRIER_PROVIDERS[0]);
  const [amount, setAmount] = useState<number>(2000);
  const [phone, setPhone] = useState('08034567890');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [autoDeductionEnabled, setAutoDeductionEnabled] = useState(true);

  if (!isOpen) return null;

  const handleCharge = () => {
    setIsProcessing(true);
    setStep('processing');

    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      soundEffects.playCoinSound();

      try {
        confetti({
          particleCount: 35,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#10b981', '#6366f1'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        onTopUpSuccess(amount, selectedCarrier.name, phone);
        setStep('input');
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Direct Carrier Billing (DCB)</h3>
            <p className="text-xs text-slate-400">Pay directly using your mobile phone airtime</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Carrier Selection */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Select Mobile Network Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CARRIER_PROVIDERS.map((carrier) => (
                    <button
                      key={carrier.id}
                      onClick={() => setSelectedCarrier(carrier)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition ${
                        selectedCarrier.id === carrier.id
                          ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: carrier.logoColor }}
                      />
                      <span className="text-xs font-medium truncate">{carrier.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Subscriber Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="0803 000 0000"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Simulated Airtime Balance:</span>
                  <span className="font-mono text-amber-400 font-medium">
                    ₦{currentAirtimeBalance.toLocaleString()} Airtime
                  </span>
                </div>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-2">
                  Amount to Transfer to T-Pay Wallet
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[1000, 2000, 3000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-mono font-medium transition ${
                        amount === amt
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Fallback toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="pr-3">
                  <div className="text-xs font-medium text-slate-200">
                    Emergency Airtime Fallback
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Auto-charge airtime if transit card balance runs out at turnstile
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDeductionEnabled(!autoDeductionEnabled)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    autoDeductionEnabled ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                      autoDeductionEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Summary and Submit Button */}
              <button
                onClick={handleCharge}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition"
              >
                <span>Authorize ₦{amount.toLocaleString()} Carrier Debit</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted Direct Carrier Billing Protocol · Zero Credit Card Required</span>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
              <div>
                <h4 className="text-base font-semibold text-white">Connecting to {selectedCarrier.name}...</h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Direct USSD / SMPP Micro-Billing Authorization
                </p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h4 className="text-lg font-bold text-white">Airtime Transfer Successful!</h4>
              <p className="text-xs text-slate-300">
                ₦{amount.toLocaleString()} has been credited to your T-Pay Commuter Wallet.
              </p>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
                Carrier Ref: DCB-MTN-99841
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
