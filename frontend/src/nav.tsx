// Small stack navigator for the design pass. Expo Router replaces it during the app restructure.
import React, { createContext, useContext } from 'react';

export type Route =
  | { name: 'splash' } | { name: 'language' } | { name: 'role' }
  | { name: 'home' } | { name: 'activity' } | { name: 'vault' } | { name: 'speak' } | { name: 'settings' }
  | { name: 'amount'; mode: 'lock' | 'collect' }
  | { name: 'scan' } | { name: 'review'; amount: number } | { name: 'refused'; amount: number }
  | { name: 'voucher'; amount: number } | { name: 'delivered'; amount: number }
  | { name: 'request'; amount: number } | { name: 'credit'; amount: number };

export type Nav = { go(r: Route): void; reset(r: Route): void; back(): void };
export const NavCtx = createContext<Nav | null>(null);
export const useNav = () => {
  const n = useContext(NavCtx);
  if (!n) throw new Error('useNav needs NavCtx');
  return n;
};
