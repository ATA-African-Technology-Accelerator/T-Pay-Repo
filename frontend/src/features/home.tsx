import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowDown, ArrowLeftRight, Globe, Landmark, Lock, Plus, ReceiptText, ScanLine } from 'lucide-react-native';
import { color, radius, space } from '../theme/tokens';
import { Panel, Press, Rise, T, money } from '../components/ui';
import { Screen, Section } from '../components/shell';
import { Hero, WalletPage } from '../components/hero';
import { ActivityRows } from '../components/rows';
import { useNav } from '../nav';
import { useStore, Entry } from '../demo/store';
import { t } from '../i18n/en';

const ic = { size: 22, color: color.white, strokeWidth: 1.8 };
const mark = { size: 20, color: color.amber, strokeWidth: 1.8 };
/** Recent transactions with See all, laid out as in Nigerian bank apps. */
function Rows({ rows }: { rows: Entry[] }) {
  const nav = useNav();
  return (
    <Panel>
      <Section title={t.recentTx} action={t.seeAll} onAction={() => nav.reset({ name: 'activity' })} />
      <ActivityRows rows={rows.slice(0, 4)} />
    </Panel>
  );
}

function Notice({ icon, title, note, onPress }: { icon: React.ReactNode; title: string; note: string; onPress?(): void }) {
  const body = (
    <>
      <View style={h.noticeMark}>{icon}</View>
      <View style={{ flex: 1 }}>
        <T v="label">{title}</T>
        <T v="small" c={color.muted}>{note}</T>
      </View>
    </>
  );
  return onPress
    ? <Press accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={h.notice}>{body}</Press>
    : <View style={h.notice}>{body}</View>;
}

/** One home for everyone. The same person can pay and collect, from the same two wallets. */
export function HomeScreen() {
  const nav = useNav();
  const { name, locked, left, pending, incoming, closing, active, history, wallet, setWallet } = useStore();
  const lockMore = () => nav.go({ name: 'amount', mode: 'lock' });
  const pay = { label: t.scan, icon: <ScanLine {...ic} />, onPress: () => nav.go({ name: 'scan' }) };
  const collect = { label: t.collectShort, icon: <ArrowDown {...ic} />, onPress: () => nav.go({ name: 'amount', mode: 'collect' }) };
  const lock = { label: t.lockShort, icon: <Plus {...ic} />, onPress: lockMore };
  const activity = { label: t.activity, icon: <ReceiptText {...ic} />, onPress: () => nav.reset({ name: 'activity' }) };
  const empty = left === 0;
  const moving = [pending ? `${money(pending)} ${t.onTheWay}` : '', incoming ? `${money(incoming)} ${t.comingIn}` : ''].filter(Boolean).join(' · ');
  const pages: WalletPage[] = [
    {
      key: 'offline', name: t.walletOffline, status: empty ? t.noVault : t.readyOffline, label: t.canSpend, amount: left, note: moving,
      actions: empty ? [lock, collect, activity] : [pay, collect, lock, activity],
    },
    {
      key: 'active', name: t.walletActive, status: t.readyActive, label: t.availableNow, amount: active,
      actions: [
        { label: t.moveOffline, icon: <ArrowLeftRight {...ic} />, onPress: lockMore },
        { label: t.received, icon: <Landmark {...ic} />, onPress: () => nav.go({ name: 'ledger' }) },
        activity,
      ],
    },
  ];
  const isActive = wallet === 'active';
  const notice = isActive
    ? <Notice icon={<Globe {...mark} />} title={t.moveOfflineTitle} note={t.moveOfflineNote} onPress={lockMore} />
    : closing
      ? <Notice icon={<Lock {...mark} />} title={`${money(locked)} ${t.stillHeld.toLowerCase()}`} note={`${t.releaseBy} ${t.settleByDate}`} />
      : empty
        ? <Notice icon={<Lock {...mark} />} title={t.noVault} note={t.noVaultHint} onPress={lockMore} />
        : <Notice icon={<Lock {...mark} />} title={`${money(locked)} ${t.heldByPayPal}`} note={t.spendBy} onPress={() => nav.reset({ name: 'vault' })} />;
  return (
    <Screen tabsFor="home" hero={<Hero name={name} pages={pages} wallet={wallet} onWallet={setWallet} />}>
      <Rise key={wallet}>{notice}</Rise>
      <Rise delay={100}><Rows key={wallet} rows={isActive ? history.filter(e => e.dir !== 'out' && e.status !== 'pending') : history} /></Rise>
    </Screen>
  );
}

const h = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, backgroundColor: color.panel, borderRadius: radius.lg },
  noticeMark: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: color.panelHigh, alignItems: 'center', justifyContent: 'center' },
});
