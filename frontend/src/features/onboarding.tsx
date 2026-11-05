import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { ArrowUpRight, Check, Volume2 } from 'lucide-react-native';
import { color, font, motion, radius, space, touch } from '../theme/tokens';
import { Folder, Rise, T, native, speak, useCardW, useReduceMotion } from '../components/ui';
import { BagIcon, HandCoinIcon } from '../components/icons';
import { CurvedHeader, Screen } from '../components/shell';
import { useNav } from '../nav';
import { useStore } from '../demo/store';
import { languages, t } from '../i18n/en';

export function Splash() {
  const nav = useNav();
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(reduce ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: motion.slow, useNativeDriver: native }).start();
    const id = setTimeout(() => nav.reset({ name: 'language' }), 1500);
    return () => clearTimeout(id);
  }, []);
  return (
    <View style={o.splash}>
      <Animated.View style={[o.mark, { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }]}>
        <View style={o.logo}><BagIcon size={44} c={color.lime} w={1.5} /></View>
        <T style={o.brand}>T-Pay</T>
        <T v="heading">{t.tagline}</T>
      </Animated.View>
    </View>
  );
}

export function Language() {
  const nav = useNav();
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Screen head={<CurvedHeader bell={false} title={t.chooseLanguage} />}>
      <View style={{ gap: space.sm + 2 }}>
        {languages.map((name, i) => {
          const on = picked === name;
          return (
            <Rise key={name} delay={i * 60} style={o.langRow}>
              <Pressable
                accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={name}
                onPress={() => { setPicked(name); setTimeout(() => nav.go({ name: 'role' }), 180); }}
                style={[o.lang, on && { backgroundColor: color.lime }]}
              >
                <T v="heading">{name}</T>
                {on && <Check size={22} color={color.ink} strokeWidth={2.4} />}
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Hear ${name}`} onPress={() => speak(name)} style={o.ear}>
                <Volume2 size={21} color={color.ink} strokeWidth={1.8} />
              </Pressable>
            </Rise>
          );
        })}
      </View>
    </Screen>
  );
}

export function Role() {
  const nav = useNav();
  const { setRole } = useStore();
  const w = useCardW();
  const pick = (r: 'buy' | 'sell') => { setRole(r); nav.reset({ name: 'home' }); };
  const Tile = ({ icon, title, hint, fill, onPress }: { icon: React.ReactNode; title: string; hint: string; fill: string; onPress(): void }) => (
    <Pressable
      accessibilityRole="button" accessibilityLabel={title} accessibilityHint={hint} onPress={onPress}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.96 : 1 }] })}
    >
      <Folder w={w} h={200} fill={fill} pill={<ArrowUpRight size={21} color={color.ink} strokeWidth={2} />}>
        <View style={o.tile}>
          <View style={o.coin}>{icon}</View>
          <View>
            <T v="hello">{title}</T>
            <T v="small">{hint}</T>
          </View>
        </View>
      </Folder>
    </Pressable>
  );
  return (
    <Screen head={<CurvedHeader back bell={false} title={t.howUse} />}>
      <Rise><Tile fill={color.lime} icon={<HandCoinIcon size={30} c={color.ink} w={1.5} />} title={t.iSell} hint={t.iSellHint} onPress={() => pick('sell')} /></Rise>
      <Rise delay={100}><Tile fill={color.lilac} icon={<BagIcon size={30} c={color.ink} w={1.5} />} title={t.iBuy} hint={t.iBuyHint} onPress={() => pick('buy')} /></Rise>
    </Screen>
  );
}

const o = StyleSheet.create({
  splash: { flex: 1, backgroundColor: color.lime, alignItems: 'center', justifyContent: 'center' },
  mark: { alignItems: 'center', gap: space.xs },
  logo: { width: 88, height: 88, borderRadius: 44, backgroundColor: color.ink, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  brand: { fontFamily: font.headStrong, fontSize: 40, lineHeight: 48, color: color.ink },
  langRow: { flexDirection: 'row', gap: space.sm },
  lang: { flex: 1, minHeight: touch.button + 6, paddingHorizontal: space.xl + 2, borderRadius: radius.pill, backgroundColor: color.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ear: { width: touch.button + 6, height: touch.button + 6, borderRadius: 31, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' },
  tile: { flex: 1, padding: space.xxl - 2, justifyContent: 'space-between' },
  coin: { width: 54, height: 54, borderRadius: 27, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' },
});
