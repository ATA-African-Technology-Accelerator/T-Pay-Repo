import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import { color, radius, space, touch, type } from '../theme/tokens';
import { Button, Folder, HearIt, Panel, Press, Rise, T, money, naira, native, useCardW, useReduceMotion } from '../components/ui';
import { Avatar, CurvedHeader, Screen, Section } from '../components/shell';
import { HoldToConfirm, NoteStack, SampleCode, StatusMark, Steps, noteValues } from '../components/money';
import { Duo } from '../components/rows';
import { useNav } from '../nav';
import { useStore } from '../demo/store';
import { t } from '../i18n/en';
import { CheckDisc, NairaDisc, WalletDisc } from '../components/icons';

/** Build an amount by tapping notes, the way cash is counted. Typing stays one tap away. */
export function Amount({ mode }: { mode: 'lock' | 'collect' }) {
  const nav = useNav();
  const { lock } = useStore();
  const w = useCardW();
  const [amount, setAmount] = useState(0);
  const [typing, setTyping] = useState(false);
  const next = () => {
    if (mode === 'lock') { lock(amount); nav.reset({ name: 'home' }); }
    else nav.go({ name: 'request', amount });
  };
  return (
    <Screen
      head={<CurvedHeader back bell={false} title={mode === 'lock' ? t.howMuchLock : t.howMuchCollect} />}
      footer={<Button label={mode === 'lock' ? t.toPayPal : t.showCustomer} disabled={!amount} onPress={next} />}
    >
      <Folder
        w={w} h={162} fill={color.lime}
        pill={<T v="smallStrong">{t.clear}</T>} pillLabel={t.clear} onPill={amount ? () => setAmount(0) : undefined}
      >
        <View style={p.folderBody}>
          <T v="heading">{mode === 'lock' ? t.amountLock : t.amountCollect}</T>
          <T v="moneyL" numberOfLines={1} accessibilityLiveRegion="polite">{naira(amount)}</T>
        </View>
      </Folder>
      {typing ? (
        <TextInput
          autoFocus keyboardType="number-pad" accessibilityLabel="Amount in naira" value={amount ? String(amount) : ''}
          onChangeText={v => setAmount(Number(v.replace(/\D/g, '').slice(0, 7)))} style={p.input}
        />
      ) : (
        <>
          {amount > 0 && <NoteStack amount={amount} />}
          <Section title={t.tapNotes} />
          <View style={p.notes}>
            {noteValues.map(v => (
              <View key={v} style={p.noteCell}>
                <Press accessibilityRole="button" accessibilityLabel={`Add ${naira(v)}`} onPress={() => setAmount(a => Math.min(a + v, 200000))} style={p.noteKey}>
                  <T v="heading">{naira(v)}</T>
                  <View style={p.plus}><Plus size={18} color={color.white} strokeWidth={2.2} /></View>
                </Press>
              </View>
            ))}
          </View>
        </>
      )}
      <Button kind="quiet" label={typing ? t.useNotes : t.typeInstead} onPress={() => setTyping(x => !x)} />
    </Screen>
  );
}

export function Scan() {
  const nav = useNav();
  const { locked, pending } = useStore();
  const reduce = useReduceMotion();
  const w = useCardW();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
      Animated.timing(a, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.quad), useNativeDriver: native }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [reduce]);
  const scan = (amount: number) => nav.go(amount > locked - pending ? { name: 'refused', amount } : { name: 'review', amount });
  return (
    <Screen head={<CurvedHeader back bell={false} title={t.scanSeller} />}>
      <Steps at={1} />
      <Folder w={w} h={270} fill={color.ink} pill={<T v="smallStrong" c={color.white}>{t.noNetwork}</T>}>
        <View style={p.frame} accessibilityLabel="Camera view">
          {(['tl', 'tr', 'bl', 'br'] as const).map(k => <View key={k} style={[p.corner, p[k]]} />)}
          <Animated.View style={[p.sweep, { transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, 136] }) }] }]} />
        </View>
      </Folder>
      <T v="body" c={color.muted} style={p.center}>{t.demo}</T>
      <Button label="Seller asks ₦2,000" onPress={() => scan(2000)} />
      <Button label="Seller asks ₦90,000" kind="soft" onPress={() => scan(90000)} />
    </Screen>
  );
}

export function Review({ amount }: { amount: number }) {
  const nav = useNav();
  const { locked, pending, seller, pay } = useStore();
  const left = locked - pending;
  const say = `Pay ${amount} naira to ${seller}`;
  return (
    <Screen
      head={<CurvedHeader back bell={false} title={t.checkPay} />}
      footer={<HoldToConfirm label={t.holdToPay} say={say} onDone={() => { pay(amount); nav.go({ name: 'voucher', amount }); }} />}
    >
      <Rise>
        <Panel dent={false}>
          <T v="section">{t.payTo}</T>
          <View style={p.row}>
            <Avatar name={seller} tone={color.peach} />
            <View style={{ flex: 1 }}>
              <T v="heading" numberOfLines={1}>{seller}</T>
              <T v="small" c={color.muted}>{t.verified}</T>
            </View>
            <CheckDisc size={24} c={color.ink} />
          </View>
        </Panel>
      </Rise>
      <Rise delay={100}>
        <Panel style={p.center2}>
          <T v="body" c={color.muted}>{t.youPay}</T>
          <T v="moneyL">{money(amount)}</T>
          <NoteStack amount={amount} />
          <HearIt say={say} />
        </Panel>
      </Rise>
      <Duo items={[
        { label: t.youHaveNow, value: money(left), fill: color.lime, icon: <WalletDisc size={23} c={color.ink} /> },
        { label: t.afterThis, value: money(left - amount), fill: color.lilacSoft, icon: <NairaDisc size={23} c={color.ink} /> },
      ]} />
    </Screen>
  );
}

export function Refused({ amount }: { amount: number }) {
  const nav = useNav();
  const { locked, pending } = useStore();
  const w = useCardW();
  const left = locked - pending;
  const reduce = useReduceMotion();
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    Animated.sequence([-7, 6, -4, 0].map(toValue => Animated.timing(x, { toValue, duration: 60, useNativeDriver: native }))).start();
  }, []);
  return (
    <Screen head={<CurvedHeader back bell={false} title={t.checkPay} />} footer={<Button label={t.backHome} onPress={() => nav.reset({ name: 'home' })} />}>
      <Animated.View style={{ transform: [{ translateX: x }] }}>
        <Folder w={w} h={196} fill={color.ink} pill={<T v="smallStrong" c={color.white}>{t.status.refused}</T>}>
          <View style={p.folderBody}>
            <StatusMark status="refused" size={40} />
            <T v="hello" c={color.white}>{t.notEnough}</T>
            <T v="small" c={color.onDark}>{t.nothingMoved}</T>
          </View>
        </Folder>
      </Animated.View>
      <Duo items={[
        { label: t.sellerAskedShort, value: money(amount), fill: color.peach, icon: <NairaDisc size={23} c={color.ink} /> },
        { label: t.haveShort, value: money(left), fill: color.lime, icon: <WalletDisc size={23} c={color.ink} /> },
      ]} />
      <HearIt say={`${t.tooMuch}. ${t.nothingMoved}`} />
    </Screen>
  );
}

export function Voucher({ amount }: { amount: number }) {
  const nav = useNav();
  const { width } = useWindowDimensions();
  const size = Math.min(Math.min(width, 390) - 110, 230);
  return (
    <Screen head={<CurvedHeader bell={false} title={t.showSeller} />} footer={<Button label={t.sellerGotIt} onPress={() => nav.reset({ name: 'delivered', amount } as any)} />}>
      <Steps at={2} />
      <Rise><Panel style={p.center2}><SampleCode size={size} /></Panel></Rise>
      <T v="moneyL" style={p.center}>{money(amount)}</T>
      <View style={p.state}><StatusMark status="sent" size={22} /><T v="label">{t.sentNotConfirmed}</T></View>
    </Screen>
  );
}

export function Done({ title, amount, who, say, note }: { title: string; amount: number; who?: string; say: string; note: string }) {
  const w = useCardW();
  return (
    <>
      <Rise>
        <Folder w={w} h={250} fill={color.lime} pill={<T v="smallStrong">{t.status.pending}</T>}>
          <View style={p.folderBody}>
            <StatusMark status="paid" size={52} big />
            <T v="title">{title}</T>
            <T v="moneyL" numberOfLines={1}>{money(amount)}</T>
            {who && <T v="small" numberOfLines={1}>{who}</T>}
          </View>
        </Folder>
      </Rise>
      <View style={p.state}><StatusMark status="pending" size={22} /><T v="label">{t.status.pending}</T></View>
      <T v="body" c={color.muted} style={p.center}>{note}</T>
      <HearIt say={say} />
    </>
  );
}

export function Delivered({ amount }: { amount: number }) {
  const nav = useNav();
  const { seller } = useStore();
  return (
    <Screen head={<CurvedHeader bell={false} title={t.paymentSent} />} footer={<Button label={t.done} onPress={() => nav.reset({ name: 'home' })} />}>
      <Done title={t.sellerHas} amount={amount} who={seller} note={t.settlesItself} say={`${t.sellerHas}. ${amount} naira. ${t.settlesItself}`} />
    </Screen>
  );
}

export const p = StyleSheet.create({
  center: { textAlign: 'center' },
  center2: { alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  folderBody: { flex: 1, paddingHorizontal: space.xxl - 2, paddingVertical: space.xl, justifyContent: 'flex-end', gap: 4 },
  notes: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm + 2 },
  noteCell: { flexBasis: '47%', flexGrow: 1 },
  noteKey: { height: 62, borderRadius: radius.pill, backgroundColor: color.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: space.xl + 2, paddingRight: 10 },
  plus: { width: 42, height: 42, borderRadius: 21, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center' },
  input: { ...type.heading, color: color.ink, height: touch.button + 4, backgroundColor: color.white, borderRadius: radius.pill, textAlign: 'center' },
  frame: { position: 'absolute', left: 26, right: 26, top: 74, bottom: 26 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: color.lime },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.md },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.md },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.md },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.md },
  sweep: { position: 'absolute', top: 16, left: 8, right: 8, height: 3, borderRadius: 2, backgroundColor: color.lime },
  state: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm },
});

