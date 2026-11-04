import { useState } from 'react';
import { ArrowLeft, Lock, Unlock, Wifi, Shield, FileText, CheckCircle2, Copy, Check } from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { soundEffects } from '../../utils/audio';

interface AccountsViewProps {
  accounts: BankAccount[];
  onBackToDashboard: () => void;
}

export function AccountsView({ accounts, onBackToDashboard }: AccountsViewProps) {
  const [frozenStatus, setFrozenStatus] = useState<Record<string, boolean>>({
    'acct-checking': false,
    'acct-savings': false,
    'acct-offline': false,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statementSuccess, setStatementSuccess] = useState<string | null>(null);

  const toggleFreeze = (id: string) => {
    soundEffects.playGateSound();
    setFrozenStatus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyAcct = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const requestStatement = (name: string) => {
    soundEffects.playTransitTapSound();
    setStatementSuccess(`E-Statement for ${name} dispatched to your registered email.`);
    setTimeout(() => setStatementSuccess(null), 3000);
  };

  return (
    <div className="space-y-4 animate-fade-in text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Accounts Portfolio
        </h2>
        <span className="text-[11px] font-mono text-slate-400">
          3 Active Vaults
        </span>
      </div>

      {statementSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statementSuccess}</span>
        </div>
      )}

      {/* Accounts List */}
      <div className="space-y-3.5">
        {accounts.map((acct) => {
          const isFrozen = !!frozenStatus[acct.id];

          return (
            <div
              key={acct.id}
              className={`p-4 rounded-3xl border transition-all ${
                isFrozen
                  ? 'bg-slate-900/60 border-slate-800 opacity-75'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              {/* Account Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xs">
                    T
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{acct.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {acct.details.branch}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                    {acct.badge}
                  </span>
                </div>
              </div>

              {/* Account Number & Balance */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">ACCOUNT NUMBER</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-slate-200 tracking-wider">
                      {acct.accountNumber}
                    </span>
                    <button
                      onClick={() => copyAcct(acct.accountNumber)}
                      className="text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      {copiedId === acct.accountNumber ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-mono">AVAILABLE</div>
                  <div className="font-mono text-sm font-bold text-white tabular-nums">
                    ₦{acct.availableBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Account Controls Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <button
                  onClick={() => toggleFreeze(acct.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition text-[11px] ${
                    isFrozen
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {isFrozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
                </button>

                <button
                  onClick={() => requestStatement(acct.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Get Statement</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
