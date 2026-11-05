import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Button, Panel, Rise, T, money } from '../components/ui';
import { CurvedHeader, Screen } from '../components/shell';
import { SampleCode, StatusMark, Steps } from '../components/money';
import { useNav } from '../nav';
import { useStore } from '../demo/store';
import { t } from '../i18n/en';
import { Done, p } from './pay';

export function Request({ amount }: { amount: number }) {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const size = Math.min(Math.min(width, 390) - 110, 230);
  return (
    <Screen head={<CurvedHeader back bell={false} title={t.showCustomer} />} footer={<Button label={t.customerPaid} onPress={() => nav.reset({ name: 'credit', amount } as any)} />}>
      <Steps at={1} />
      <Rise><Panel style={p.center2}><SampleCode size={size} seed={3} /></Panel></Rise>
      <T v="moneyL" style={p.center}>{money(amount)}</T>
      <View style={p.state}><StatusMark status="pending" size={22} /><T v="label">{t.waiting}</T></View>
    </Screen>
  );
}

export function Credit({ amount }: { amount: number }) {
  const nav = useNav();
  const { receive } = useStore();
  React.useEffect(() => { receive(amount); }, []);
  return (
    <Screen head={<CurvedHeader bell={false} title={t.gotMoney} />} footer={<Button label={t.done} onPress={() => nav.reset({ name: 'home' })} />}>
      <Done title={t.customerPaid} amount={amount} note={t.pendingPaid} say={`${t.gotMoney}. ${amount} naira. ${t.pendingPaid}`} />
    </Screen>
  );
}
