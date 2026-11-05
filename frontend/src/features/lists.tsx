import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, Globe, Mic, Repeat } from 'lucide-react-native';
import { color, radius, space, touch } from '../theme/tokens';
import { Button, Folder, Panel, Press, T, native, useCardW, useReduceMotion } from '../components/ui';
import { Avatar, CurvedHeader, Screen } from '../components/shell';
import { ActivityRows, Segment } from '../components/rows';
import { useNav } from '../nav';
import { useStore } from '../demo/store';
import { t } from '../i18n/en';

export function Activity() {
  const { role, history, sales } = useStore();
  const [show, setShow] = useState<'all' | 'paid' | 'pending'>('all');
  const rows = role === 'sell' ? sales : history;
  return (
    <Screen tabsFor="activity" head={<CurvedHeader home title={role === 'sell' ? t.sales : t.activity} />}>
      <Segment<'all' | 'paid' | 'pending'> value={show} onChange={setShow} options={[{ key: 'all', label: t.all }, { key: 'paid', label: t.status.paid }, { key: 'pending', label: t.status.pending }]} />
      <Panel><ActivityRows key={show} rows={show === 'all' ? rows : rows.filter(e => e.status === show)} /></Panel>
    </Screen>
  );
}

export function Speak() {
  const nav = useNav();
  const { role } = useStore();
  const reduce = useReduceMotion();
  const [phase, setPhase] = useState<'idle' | 'listening' | 'heard'>('idle');
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase !== 'listening') return;
    const loop = reduce ? null : Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.out(Easing.quad), useNativeDriver: native }));
    loop?.start();
    const id = setTimeout(() => setPhase('heard'), 2400);
    return () => { loop?.stop(); pulse.setValue(0); clearTimeout(id); };
  }, [phase, reduce]);
  return (
    <Screen tabsFor="speak" head={<CurvedHeader home title={t.speak} />}>
      <View style={a.speak}>
        <T v="title" style={{ textAlign: 'center', fontSize: 24, lineHeight: 32 }}>{phase === 'listening' ? t.listening : phase === 'heard' ? (role === 'sell' ? 'Collect ₦1,000?' : 'Pay a seller?') : t.tapToTalk}</T>
        {phase === 'heard' ? (
          <View style={{ alignSelf: 'stretch', gap: space.md }}>
            <T v="small" c={color.muted} style={{ textAlign: 'center' }}>{t.demo}</T>
            <Button label={t.yes} onPress={() => { setPhase('idle'); nav.go(role === 'sell' ? { name: 'request', amount: 1000 } : { name: 'scan' }); }} />
            <Button label={t.no} kind="soft" onPress={() => setPhase('idle')} />
          </View>
        ) : (
          <View style={a.micWrap}>
            <Animated.View style={[a.ring, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }] }]} />
            <Pressable accessibilityRole="button" accessibilityLabel={t.tapToTalk} onPress={() => setPhase('listening')} style={a.mic}>
              <Mic size={46} color={color.ink} strokeWidth={1.7} />
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

export function SettingsScreen() {
  const nav = useNav();
  const { role, buyer, seller } = useStore();
  const w = useCardW();
  const Row = ({ label, Icon, onPress }: { label: string; Icon: typeof Globe; onPress(): void }) => (
    <Press accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={a.setting}>
      <View style={a.rowIcon}><Icon size={21} color={color.ink} strokeWidth={1.7} /></View>
      <T v="label" style={{ flex: 1 }}>{label}</T>
      <ChevronRight size={21} color={color.muted} strokeWidth={1.8} />
    </Press>
  );
  const name = role === 'sell' ? seller : buyer;
  return (
    <Screen tabsFor="settings" head={<CurvedHeader home title={t.profile} />}>
      <Folder w={w} h={170} fill={color.lilac} pill={<T v="smallStrong">{role === 'sell' ? t.iSell : t.iBuy}</T>}>
        <View style={a.me}>
          <Avatar name={name} size={58} tone={color.white} />
          <T v="title" numberOfLines={2}>{name}</T>
        </View>
      </Folder>
      <View style={{ gap: space.md }}>
        <Row label={t.changeLanguage} Icon={Globe} onPress={() => nav.reset({ name: 'language' })} />
        <Row label={t.changeRole} Icon={Repeat} onPress={() => nav.reset({ name: 'role' })} />
      </View>
    </Screen>
  );
}

const a = StyleSheet.create({
  speak: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xxxl },
  micWrap: { width: 176, height: 176, alignItems: 'center', justifyContent: 'center', borderRadius: 88, backgroundColor: color.white },
  ring: { position: 'absolute', width: 176, height: 176, borderRadius: 88, borderWidth: 2, borderColor: color.ink },
  mic: { width: 124, height: 124, borderRadius: 62, backgroundColor: color.lime, alignItems: 'center', justifyContent: 'center' },
  me: { flex: 1, justifyContent: 'flex-end', padding: space.xxl - 2, gap: space.sm },
  setting: { minHeight: touch.button + 10, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, backgroundColor: color.white, borderRadius: radius.lg },
  rowIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: color.page, alignItems: 'center', justifyContent: 'center' },
});
