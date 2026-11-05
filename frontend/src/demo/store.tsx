// Sample data so the design can be walked through. No real money, signing or sync happens here.
// The real rules stay in shared/ and replace this file when the screens are wired up.
import React, { createContext, useContext, useMemo, useState } from 'react';

export type Status = 'paid' | 'locked' | 'pending' | 'sent' | 'refused' | 'blocked';
export type Entry = { id: string; who: string; amount: number; status: Status; when: string };
export type Role = 'buy' | 'sell';

const SELLER = 'Mama Nkechi Provisions';

type Store = {
  role: Role; setRole(r: Role): void;
  locked: number; pending: number; lock(n: number): void; pay(n: number): void;
  history: Entry[];
  merchantPending: number; merchantPaid: number; sales: Entry[]; receive(n: number): void;
  seller: string; buyer: string;
};

const Ctx = createContext<Store | null>(null);
const now = () => 'Just now';
export const SPENT = 6000;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('buy');
  const [locked, setLocked] = useState(25000);
  const [pending, setPending] = useState(1800);
  const [history, setHistory] = useState<Entry[]>([
    { id: 'd', who: 'Iya Bose Foods', amount: 1800, status: 'pending', when: '8-Nov-2026  12:56 PM' },
    { id: 'a', who: SELLER, amount: 1500, status: 'paid', when: '8-Nov-2026  11:02 AM' },
    { id: 'l', who: 'Money locked', amount: 25000, status: 'locked', when: '7-Nov-2026  9:30 AM' },
    { id: 'b', who: 'Baba Tunde Fabrics', amount: 500, status: 'refused', when: '6-Nov-2026  4:10 PM' },
  ]);
  const [merchantPending, setMerchantPending] = useState(1200);
  const [sales, setSales] = useState<Entry[]>([
    { id: 'e', who: 'Customer Ada', amount: 1200, status: 'pending', when: '8-Nov-2026  12:56 PM' },
    { id: 'c', who: 'Customer Musa', amount: 12000, status: 'paid', when: '8-Nov-2026  10:20 AM' },
    { id: 'f', who: 'Customer Ngozi', amount: 6500, status: 'paid', when: '7-Nov-2026  3:45 PM' },
  ]);
  const value = useMemo<Store>(() => ({
    role, setRole, locked, pending, history, merchantPending, merchantPaid: 25500, sales, seller: SELLER, buyer: 'Ada',
    lock: n => {
      setLocked(l => l + n);
      setHistory(h => [{ id: String(Date.now()), who: 'Money locked', amount: n, status: 'locked', when: now() }, ...h]);
    },
    pay: n => {
      setPending(p => p + n);
      setHistory(h => [{ id: String(Date.now()), who: SELLER, amount: n, status: 'pending', when: now() }, ...h]);
    },
    receive: n => {
      setMerchantPending(p => p + n);
      setSales(s => [{ id: String(Date.now()), who: 'Customer', amount: n, status: 'pending', when: now() }, ...s]);
    },
  }), [role, locked, pending, history, merchantPending, sales]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore needs StoreProvider');
  return s;
}
