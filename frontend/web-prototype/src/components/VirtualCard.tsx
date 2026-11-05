import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Unlock, Wifi, ArrowUpRight, ArrowDownLeft, Shield, Sliders } from 'lucide-react';
import { UserProfile } from '../types';
import { soundEffects } from '../utils/audio';

interface VirtualCardProps {
  user: UserProfile;
  onSendMoney: (recipient: string, amount: number) => void;
}

export function VirtualCard({ user, onSendMoney }: VirtualCardProps) {
  const [showCvv, setShowCvv] = useState(false);
  const [isFrozen, setIsFrozen] = useState(user.card.isFrozen);
  const [contactless, setContactless] = useState(user.card.contactlessEnabled);
  const [dailyLimit, setDailyLimit] = useState(user.card.dailyLimit);
  const [p2pModal, setP2pModal] = useState<'send' | 'request' | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('2500');

  const toggleFreeze = () => {
    setIsFrozen(!isFrozen);
    soundEffects.playGateSound();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!recipient || isNaN(num) || num <= 0) return;
    soundEffects.playCoinSound();
    onSendMoney(recipient, num);
    setP2pModal(null);
    setRecipient('');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Visual Debit Card */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 text-white transition-all duration-300 shadow-xl border ${
          isFrozen
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 opacity-80'
            : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 border-purple-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-lg">T-PAY</span>
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-md">VIRTUAL</span>
          </div>
          <div className="flex items-center gap-2">
            {contactless && <Wifi className="w-5 h-5 text-purple-300 rotate-90" />}
            <span className="text-xs font-mono font-bold tracking-wider text-amber-300">MASTERCARD</span>
          </div>
        </div>

        <div className="mb-6 font-mono text-lg tracking-widest text-slate-100">
          {user.card.cardNumber}
        </div>

        <div className="flex items-end justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Cardholder</div>
            <div className="font-medium tracking-wide uppercase">{user.card.holderName}</div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Expires</div>
              <div className="font-mono">{user.card.expiry}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">CVV</div>
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="font-mono flex items-center gap-1 hover:text-purple-300 transition"
              >
                <span>{showCvv ? user.card.cvv : '•••'}</span>
                {showCvv ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>

        {isFrozen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-rose-400 font-semibold text-sm">
            <Lock className="w-4 h-4" />
            <span>Card Temporarily Frozen</span>
          </div>
        )}
      </div>

      {/* P2P Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setP2pModal('send')}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 active:scale-98 transition"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Send Money (@handle)</span>
        </button>

        <button
          onClick={() => setP2pModal('request')}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-xs border border-slate-800 active:scale-98 transition"
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          <span>Request Funds</span>
        </button>
      </div>

      {/* Card Controls & Security */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 text-xs">
        <div className="font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Security & Controls</span>
        </div>

        {/* Freeze switch */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-slate-200">Freeze Card</div>
            <div className="text-[11px] text-slate-400">Instantly block all transit & online taps</div>
          </div>
          <button
            onClick={toggleFreeze}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              isFrozen ? 'bg-rose-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                isFrozen ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Contactless toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div>
            <div className="font-medium text-slate-200">Contactless NFC Payments</div>
            <div className="text-[11px] text-slate-400">Allow tap-to-pay on turnstiles and POS</div>
          </div>
          <button
            onClick={() => setContactless(!contactless)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              contactless ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                contactless ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Daily limit slider */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-200">Daily Spending Limit</span>
            <span className="font-mono text-indigo-400 font-bold tabular-nums">
              ₦{dailyLimit.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="10000"
            max="150000"
            step="5000"
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>₦10,000</span>
            <span>₦150,000</span>
          </div>
        </div>
      </div>

      {/* P2P Transfer Modal */}
      {p2pModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-2xl">
            <h4 className="text-sm font-semibold mb-3">
              {p2pModal === 'send' ? 'Instant Transfer via T-Pay' : 'Request Payment'}
            </h4>
            <form onSubmit={handleSend} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Recipient @handle or Phone
                </label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="@amara.pay or 080..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount (NGN)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setP2pModal(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
