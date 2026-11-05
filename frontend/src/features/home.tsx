import React from 'react';
import { StyleSheet } from 'react-native';
import { ArrowUpRight, Mic, Plus, ReceiptText } from 'lucide-react-native';
import { color, space } from '../theme/tokens';
import { Panel, Rise, T, money } from '../components/ui';
import { Greeting, Screen, Section } from '../components/shell';
import { BalanceDeck, DeckCard } from '../components/deck';
import { BagIcon } from '../components/icons';
import { Action, ActivityRows } from '../components/rows';
import { useNav } from '../nav';
import { useStore } from '../demo/store';
import { t } from '../i18n/en';

const ic = { size: 23, color: color.ink, strokeWidth: 1.8 };
const bag = (c: string) => <BagIcon size={21} c={c} w={1.6} />;

function Customer() {
  const nav = useNav();
  const { buyer, locked, pending, history } = useStore();
  const cards: DeckCard[] = [
    { key: 'spend', label: t.canSpend, amount: locked - pending, note: t.spendBy, fill: color.lime, fg: color.ink, sub: color.ink, icon: bag(color.ink) },
    { key: 'pending', label: t.waitingToFinish, amount: pending, note: t.finishesAlone, fill: color.lilac, fg: color.ink, sub: color.ink, icon: bag(color.ink) },
    { key: 'locked', label: t.moneyLocked, amount: locked, note: t.fromPayPal, fill: color.ink, fg: color.white, sub: color.onDark, icon: bag(color.white) },
  ];
  return (
    <Screen tabsFor="home" head={<Greeting name={buyer} />}>
      <Rise><BalanceDeck cards={cards} /></Rise>
      <Rise delay={100}>
        <Panel dent={false} style={h.actions}>
          <Action label={t.scan} icon={<ArrowUpRight {...ic} />} onPress={() => nav.go({ name: 'scan' })} />
          <Action label={t.lockShort} icon={<Plus {...ic} />} onPress={() => nav.go({ name: 'amount', mode: 'lock' })} />
          <Action label={t.activity} icon={<ReceiptText {...ic} />} onPress={() => nav.reset({ name: 'activity' })} />
          <Action label={t.speak} icon={<Mic {...ic} />} onPress={() => nav.reset({ name: 'speak' })} />
        </Panel>
      </Rise>
      <Rise delay={200}>
        <Panel>
          <Section title={t.recent} action={t.seeAll} onAction={() => nav.reset({ name: 'activity' })} />
          <ActivityRows rows={history.slice(0, 3)} />
        </Panel>
      </Rise>
    </Screen>
  );
}

function Merchant() {
  const nav = useNav();
  const { seller, merchantPending, merchantPaid, sales } = useStore();
  const cards: DeckCard[] = [
    { key: 'paid', label: t.moneyIn, amount: merchantPaid, note: `${money(merchantPaid + merchantPending)} all together`, fill: color.lime, fg: color.ink, sub: color.ink, icon: bag(color.ink) },
    { key: 'pending', label: t.waitingToFinish, amount: merchantPending, note: t.finishesAlone, fill: color.lilac, fg: color.ink, sub: color.ink, icon: bag(color.ink) },
  ];
  return (
    <Screen tabsFor="home" head={<Greeting name={seller.split(' ').slice(0, 2).join(' ')} />}>
      <Rise><BalanceDeck cards={cards} /></Rise>
      <Rise delay={100}>
        <Panel dent={false} style={h.actions}>
          <Action label={t.collectShort} icon={<Plus {...ic} />} onPress={() => nav.go({ name: 'amount', mode: 'collect' })} />
          <Action label={t.sales} icon={<ReceiptText {...ic} />} onPress={() => nav.reset({ name: 'vault' })} />
          <Action label={t.speak} icon={<Mic {...ic} />} onPress={() => nav.reset({ name: 'speak' })} />
        </Panel>
      </Rise>
      <Rise delay={200}>
        <Panel>
          <Section title={t.recent} action={t.seeAll} onAction={() => nav.reset({ name: 'vault' })} />
          <ActivityRows rows={sales.slice(0, 3)} />
        </Panel>
      </Rise>
    </Screen>
  );
}

export function HomeScreen() {
  const { role } = useStore();
  return role === 'sell' ? <Merchant /> : <Customer />;
}

const h = StyleSheet.create({ actions: { flexDirection: 'row', paddingHorizontal: space.sm } });
