import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Radio, Bluetooth, Wifi, ShieldCheck, Check, ArrowRight, Smartphone, RefreshCw } from 'lucide-react';
import { NearbyPeer } from '../types/banking';
import { NEARBY_PEERS } from '../data/bankingData';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';

interface NearbyPeerScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderBalance: number;
  onCompleteOfflineTransfer: (peer: NearbyPeer, amount: number) => void;
}

export function NearbyPeerScannerModal({
  isOpen,
  onClose,
  senderBalance,
  onCompleteOfflineTransfer,
}: NearbyPeerScannerModalProps) {
  const [step, setStep] = useState<'scanning' | 'select' | 'transfer' | 'syncing' | 'success'>('scanning');
  const [discoveredPeers, setDiscoveredPeers] = useState<NearbyPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<NearbyPeer | null>(null);
  const [amount, setAmount] = useState<number>(1500);
  const [bluetoothOtp, setBluetoothOtp] = useState('849 201');
  const [timerSeconds, setTimerSeconds] = useState(30);

  // Scanning simulation
  useEffect(() => {
    if (!isOpen) {
      setStep('scanning');
      setSelectedPeer(null);
      setDiscoveredPeers([]);
      return;
    }

    setStep('scanning');
    const timer = setTimeout(() => {
      setDiscoveredPeers(NEARBY_PEERS);
      setStep('select');
      soundEffects.playTransitTapSound();
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Bluetooth OTP countdown
  useEffect(() => {
    if (step !== 'transfer') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          const rand = Math.floor(100000 + Math.random() * 900000);
          setBluetoothOtp(`${String(rand).slice(0, 3)} ${String(rand).slice(3)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  const handleSelectPeer = (peer: NearbyPeer) => {
    setSelectedPeer(peer);
    setStep('transfer');
    soundEffects.playGateSound();
  };

  const handleExecuteTransfer = () => {
    if (!selectedPeer || amount <= 0 || amount > senderBalance) return;

    setStep('syncing');

    setTimeout(() => {
      setStep('success');
      soundEffects.playCoinSound();

      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#10b981', '#3b82f6'],
        });
      } catch {
        // ignore
      }

      onCompleteOfflineTransfer(selectedPeer, amount);

      setTimeout(() => {
        onClose();
      }, 2200);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
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
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Nearby Offline Peer Transfer</h3>
            <p className="text-xs text-slate-400">Bluetooth Low Energy & Wi-Fi Direct (0-Data)</p>
          </div>
        </div>

        {/* STEP 1: Scanning Radar */}
        {step === 'scanning' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-28 h-28 flex items-center justify-center mb-4">
              <span className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
              <span className="absolute inset-3 rounded-full border border-red-500/50 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
                <Bluetooth className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <h4 className="text-sm font-semibold text-white">Scanning for Nearby T-Pay Devices...</h4>
            <p className="text-xs text-slate-400 mt-1">
              Searching within 10 meters via Bluetooth 5.3 & Wi-Fi Direct
            </p>
          </div>
        )}

        {/* STEP 2: Discovered Peers List (Scrollable) */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{discoveredPeers.length} Nearby Receiving Devices Found</span>
              <button
                onClick={() => {
                  setStep('scanning');
                  setTimeout(() => setStep('select'), 800);
                }}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 font-mono text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rescan</span>
              </button>
            </div>

            {/* Scrollable Peer List */}
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
              {discoveredPeers.map((peer) => (
                <motion.div
                  key={peer.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleSelectPeer(peer)}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {/* Peer Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0"
                      style={{ backgroundColor: peer.avatarColor }}
                    >
                      {peer.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-xs">{peer.name}</span>
                        {peer.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                        {peer.accountNumber} · <span className="text-red-400">{peer.distance}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        {peer.protocol === 'bluetooth' ? (
                          <Bluetooth className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Wifi className="w-3 h-3 text-indigo-400" />
                        )}
                        <span>{peer.deviceModel}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-red-600/20 group-hover:bg-red-600 text-red-400 group-hover:text-white font-medium text-xs transition"
                  >
                    Select
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Scroll and tap on the person you wish to pay offline
            </p>
          </div>
        )}

        {/* STEP 3: Cryptographic Handshake & Amount Input */}
        {step === 'transfer' && selectedPeer && (
          <div className="space-y-4">
            {/* Selected Peer Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                  style={{ backgroundColor: selectedPeer.avatarColor }}
                >
                  {selectedPeer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">{selectedPeer.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Acct: {selectedPeer.accountNumber}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep('select')}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Change
              </button>
            </div>

            {/* Cryptographic Bluetooth OTP Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-950 to-red-950/40 border border-red-500/30 text-center">
              <div className="text-[10px] uppercase font-mono tracking-wider text-red-400 mb-1">
                Cryptographic Bluetooth OTP Handshake
              </div>
              <div className="text-2xl font-mono font-black tracking-widest text-white tabular-nums">
                {bluetoothOtp}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Auto-rotates in {timerSeconds}s · Zero-Data Mesh Sync
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Transfer Amount (NGN)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-mono font-medium transition ${
                      amount === amt
                        ? 'bg-red-600 text-white font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Offline Checking Balance:</span>
                <span className="font-mono text-white font-medium">
                  ₦{senderBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleExecuteTransfer}
              disabled={amount <= 0 || amount > senderBalance}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>Sync & Transfer ₦{amount.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: Syncing State */}
        {step === 'syncing' && (
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
            <div>
              <h4 className="text-base font-semibold text-white">Performing Bluetooth Handshake...</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Verifying HMAC-SHA256 Token with {selectedPeer?.name}
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Success State */}
        {step === 'success' && selectedPeer && (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-white">Offline Transfer Successful!</h4>
            <p className="text-xs text-slate-300">
              ₦{amount.toLocaleString()} sent to <strong>{selectedPeer.name}</strong> ({selectedPeer.accountNumber})
            </p>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Ref: BLE-OTP-{Math.floor(10000 + Math.random() * 90000)}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
