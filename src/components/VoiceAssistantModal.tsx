import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Volume2, Sparkles, Send, ArrowRight } from 'lucide-react';
import { BankAccount } from '../types/banking';
import { soundEffects } from '../utils/audio';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onExecuteVoiceTransfer: (fromType: string, toName: string, amount: number) => void;
  onOpenNearbyScan: () => void;
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  accounts,
  onExecuteVoiceTransfer,
  onOpenNearbyScan,
}: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [recognizedAction, setRecognizedAction] = useState<{
    type: 'transfer' | 'balance' | 'nearby' | 'none';
    amount?: number;
    recipient?: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setAiResponse(null);
      setRecognizedAction(null);
      setIsListening(true);
      return;
    }

    // Try starting speech recognition if supported
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    let recognition: any = null;
    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-NG';

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const processCommand = (commandText: string) => {
    setTranscript(commandText);
    setIsListening(false);
    soundEffects.playGateSound();

    const lower = commandText.toLowerCase();

    if (lower.includes('nearby') || lower.includes('bluetooth') || lower.includes('offline')) {
      setAiResponse("Opening Nearby Bluetooth & Wi-Fi scanner for offline transfer...");
      setRecognizedAction({ type: 'nearby' });
      setTimeout(() => {
        onClose();
        onOpenNearbyScan();
      }, 1500);
      return;
    }

    if (lower.includes('balance') || lower.includes('how much')) {
      const checking = accounts.find((a) => a.type === 'checking')?.availableBalance || 0;
      const savings = accounts.find((a) => a.type === 'savings')?.availableBalance || 0;
      const offline = accounts.find((a) => a.type === 'offline_checking')?.availableBalance || 0;
      setAiResponse(
        `Your balances: Checking has ₦${checking.toLocaleString()}, Savings has ₦${savings.toLocaleString()}, and your Offline account has ₦${offline.toLocaleString()}.`
      );
      setRecognizedAction({ type: 'balance' });
      return;
    }

    // Transfer pattern e.g. "transfer 5000 to amara"
    const amountMatch = commandText.match(/\d+[\d,]*/);
    const amount = amountMatch ? parseInt(amountMatch[0].replace(/,/g, ''), 10) : 5000;
    const recipient = lower.includes('amara') ? 'Amara Okafor' : lower.includes('chidi') ? 'Chidi Eze' : 'Recipient';

    setAiResponse(`Understood! Transferring ₦${amount.toLocaleString()} to ${recipient} from your Checking Account.`);
    setRecognizedAction({
      type: 'transfer',
      amount,
      recipient,
    });
  };

  const handleConfirmRecognizedTransfer = () => {
    if (recognizedAction?.type === 'transfer' && recognizedAction.amount && recognizedAction.recipient) {
      soundEffects.playCoinSound();
      onExecuteVoiceTransfer('checking', recognizedAction.recipient, recognizedAction.amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-xs">
            T
          </div>
          <span className="font-bold text-sm text-white">T-Pay AI Voice Assistant</span>
        </div>

        {/* Animated Voice Equalizer Wave */}
        <div className="relative py-8 flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800/80 mb-4 overflow-hidden">
          <div className="flex items-center justify-center gap-1.5 h-16 mb-3">
            {[40, 75, 95, 60, 85, 100, 70, 50, 80, 45].map((height, i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: isListening ? [0.3, height / 100, 0.4] : 0.2,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + (i % 3) * 0.2,
                  ease: 'easeInOut',
                }}
                className={`w-1.5 rounded-full ${
                  isListening ? 'bg-gradient-to-t from-red-600 to-rose-400' : 'bg-slate-700'
                }`}
                style={{ height: '48px', transformOrigin: 'bottom' }}
              />
            ))}
          </div>

          <div className="text-center px-4">
            <div className="text-xs font-semibold text-white">
              {isListening ? 'Listening for your voice command...' : 'Voice Command Processed'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 italic min-h-[20px]">
              {transcript ? `"${transcript}"` : 'Say something like "Transfer 5,000 to Amara"'}
            </p>
          </div>
        </div>

        {/* AI Response Display */}
        {aiResponse && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs mb-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-1">
              <Volume2 className="w-4 h-4" />
              <span>T-Pay Assistant:</span>
            </div>
            <p className="text-slate-200">{aiResponse}</p>

            {recognizedAction?.type === 'transfer' && (
              <button
                onClick={handleConfirmRecognizedTransfer}
                className="mt-3 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
              >
                <span>Confirm & Execute Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Suggested Voice Prompts */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
            Or Click a Suggested Voice Command:
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              'Transfer ₦5,000 to Amara Okafor',
              'What is my offline checking balance?',
              'Scan nearby Bluetooth devices to pay offline',
              'Recharge ₦2,000 MTN Airtime',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => processCommand(prompt)}
                className="text-left px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center justify-between group"
              >
                <span>{prompt}</span>
                <Send className="w-3 h-3 text-slate-600 group-hover:text-red-400 transition" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
