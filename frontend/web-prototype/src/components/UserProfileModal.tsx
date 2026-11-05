import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Smartphone, DollarSign, X, Check, Shield } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export interface UserProfileData {
  fullName: string;
  phone: string;
  offlineBalance: number;
  checkingBalance: number;
  savingsBalance: number;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfileData;
  onSaveProfile: (profile: UserProfileData) => void;
  isOnboarding?: boolean;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  isOnboarding = false,
}: UserProfileModalProps) {
  const [fullName, setFullName] = useState(currentProfile.fullName || '');
  const [phone, setPhone] = useState(currentProfile.phone || '');
  const [offlineBalance, setOfflineBalance] = useState(String(currentProfile.offlineBalance ?? 25000));
  const [checkingBalance, setCheckingBalance] = useState(String(currentProfile.checkingBalance ?? 85000));
  const [savingsBalance, setSavingsBalance] = useState(String(currentProfile.savingsBalance ?? 420000));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    soundEffects.playCoinSound();

    const updated: UserProfileData = {
      fullName: fullName.trim(),
      phone: phone.trim() || '+234 800 000 0000',
      offlineBalance: Math.max(0, parseFloat(offlineBalance) || 0),
      checkingBalance: Math.max(0, parseFloat(checkingBalance) || 0),
      savingsBalance: Math.max(0, parseFloat(savingsBalance) || 0),
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {!isOnboarding && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isOnboarding ? 'Set Up Your Real User Information' : 'Profile & Field Balances'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure your real credentials & starting balances for field testing
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Real Full Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Your Real Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Malik Olajuwon"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          {/* Real Mobile Phone Number */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Active Mobile Phone Number
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 803 456 7890"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Customizable Account Balances */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-red-500" />
              <span>Customizable Starting Balances (NGN)</span>
            </div>

            {/* 1. Offline Checking */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                1. T-Pay Offline Checking Balance
              </label>
              <input
                type="number"
                required
                value={offlineBalance}
                onChange={(e) => setOfflineBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* 2. Checking */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                2. T-Pay Checking Balance
              </label>
              <input
                type="number"
                required
                value={checkingBalance}
                onChange={(e) => setCheckingBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* 3. Savings */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                3. T-Pay Savings Balance
              </label>
              <input
                type="number"
                required
                value={savingsBalance}
                onChange={(e) => setSavingsBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved securely in your browser's persistent local storage</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>{isOnboarding ? 'Save & Start T-Pay' : 'Update Profile & Balances'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
