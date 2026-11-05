import React from 'react';
import { StyleSheet } from 'react-native';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import { color, space } from '../theme/tokens';
import { Button, Panel, Rise, RollingMoney, T, money } from '../components/ui';
import { CurvedHeader, Screen, Section } from '../components/shell';
import { ActivityRows, Duo, WeekBars } from '../components/rows';
import { useNav } from '../nav';
import { SPENT, useStore } from '../demo/store';
import { t } from '../i18n/en';

const up = <ArrowUp size={20} color={color.ink} strokeWidth={2} />;
const down = <ArrowDown size={20} color={color.ink} strokeWidth={2} />;

function Total({ label, amount, hint }: { label: string; amount: number; hint: string }) {
  return (
    <Rise style={v.total}>
      <T v="body" c={color.muted}>{label}</T>
      <RollingMoney value={amount} v="moneyL" />
      <T v="small" c={color.muted}>{hint}</T>
    </Rise>
  );
}

function CustomerVault() {
  const nav = useNav();
  const { locked, pending, history } = useStore();
  return (
    <Screen tabsFor="vault" head={<CurvedHeader home title={t.vaultTitle} />}>
      <Total label={t.leftToSpend} amount={locked - pending} hint={t.spendBy} />
      <Rise delay={100}>
        <WeekBars title={t.spendDays} days={[
          { day: 'Thu', amount: 1000 }, { day: 'Fri', amount: 1500 }, { day: 'Sat', amount: 2000 },
          { day: 'Sun', amount: 3300, note: t.today }, { day: 'Mon', amount: 0, note: t.lastDay },
        ]} />
      </Rise>
      <Duo items={[
        { label: t.spent, value: money(SPENT), fill: color.lime, icon: up },
        { label: t.status.pending, value: money(pending), fill: color.peach, icon: down },
      ]} />
      <Button label={t.addMoney} onPress={() => nav.go({ name: 'amount', mode: 'lock' })} />
      <Panel>
        <Section title={t.recent} action={t.seeAll} onAction={() => nav.reset({ name: 'activity' })} />
        <ActivityRows rows={history.slice(0, 2)} />
      </Panel>
    </Screen>
  );
}

function Sales() {
  const nav = useNav();
  const { merchantPending, merchantPaid, sales } = useStore();
  return (
    <Screen tabsFor="vault" head={<CurvedHeader home title={t.sales} />}>
      <Total label={t.salesToday} amount={merchantPaid + merchantPending} hint={merchantPending ? t.statusWaiting : t.statusReady} />
      <Rise delay={100}>
        <WeekBars title={t.salesWeek} days={[
          { day: 'Wed', amount: 3000 }, { day: 'Thu', amount: 4000 }, { day: 'Fri', amount: 6500 }, { day: 'Sat', amount: 12000 },
          { day: 'Sun', amount: 1200 + (merchantPending > 1200 ? merchantPending - 1200 : 0), note: t.today },
        ]} />
      </Rise>
      <Duo items={[
        { label: t.sold, value: money(merchantPaid), fill: color.lime, icon: down },
        { label: t.status.pending, value: money(merchantPending), fill: color.peach, icon: down },
      ]} />
      <Button label={t.collect} onPress={() => nav.go({ name: 'amount', mode: 'collect' })} />
      <Panel>
        <Section title={t.recent} />
        <ActivityRows rows={sales} />
      </Panel>
    </Screen>
  );
}

export function VaultScreen() {
  const { role } = useStore();
  return role === 'sell' ? <Sales /> : <CustomerVault />;
}

const v = StyleSheet.create({ total: { alignItems: 'center', paddingVertical: space.xs, gap: 2 } });
