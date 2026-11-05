import { BankTransaction } from '../types/banking';
import { ArrowUpRight, ArrowDownLeft, Radio, Smartphone, History, Zap } from 'lucide-react';

interface TransactionListProps {
  transactions: BankTransaction[];
  accountName: string;
}

export function TransactionList({ transactions, accountName }: TransactionListProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Account Activity
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {transactions.length} Records
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No recent transactions on this account.
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isCredit = tx.amount > 0;
            const isOffline = tx.category === 'offline_peer';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  {/* Category icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isOffline
                        ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                        : isCredit
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isOffline ? (
                      <Radio className="w-4 h-4" />
                    ) : isCredit ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.category === 'airtime' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="truncate max-w-[170px] sm:max-w-xs">{tx.title}</span>
                      {isOffline && (
                        <span className="text-[9px] font-mono bg-red-950 text-red-400 px-1.5 py-0.2 rounded border border-red-800">
                          BLE 0-DATA
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {tx.date} · {tx.time} · <span className="font-mono text-slate-500">{tx.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-bold text-xs tabular-nums ${
                      isCredit ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {isCredit ? '+' : ''}₦{Math.abs(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
