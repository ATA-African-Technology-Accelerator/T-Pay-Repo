import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, Text, TextProps, View, ViewStyle, StyleProp, useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Speech from 'expo-speech';
import { Volume2 } from 'lucide-react-native';
import { color, motion, radius, space, touch, type } from '../theme/tokens';
import { t } from '../i18n/en';

export const native = Platform.OS !== 'web';

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

export function T({ v = 'body', c = color.ink, style, ...rest }: TextProps & { v?: keyof typeof type; c?: string }) {
  return <Text {...rest} style={[type[v], { color: c }, style]} />;
}

export const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-US')}`;
export const money = (n: number) => `${naira(n)}.00`;
export const useCardW = () => Math.min(useWindowDimensions().width, 390) - space.xl * 2;

const FOLD = { r: 30, notchH: 54 };
export const notchW = (w: number) => (w < 340 ? 108 : 132);

/** Card outline from the reference: a folder whose raised tab slopes down into a notch at the top right. */
export const folderPath = (w: number, h: number) => {
  const { r, notchH } = FOLD, a = w - notchW(w) - 48;
  return `M0 ${r}Q0 0 ${r} 0H${a}C${a + 24} 0 ${a + 28} 12 ${a + 38} 28C${a + 46} ${notchH - 8} ${a + 56} ${notchH} ${a + 78} ${notchH}H${w - r}Q${w} ${notchH} ${w} ${notchH + r}V${h - r}Q${w} ${h} ${w - r} ${h}H${r}Q0 ${h} 0 ${h - r}Z`;
};

export function Folder({ w, h, fill, pill, onPill, pillLabel, children, style }: {
  w: number; h: number; fill: string; pill?: React.ReactNode; onPill?(): void; pillLabel?: string; children?: React.ReactNode; style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: w, height: h }, style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, s.under]}>
        <Svg width={w} height={h}><Path d={folderPath(w, h)} fill={fill} /></Svg>
      </View>
      {children}
      {pill && (
        <Pressable
          accessibilityRole={onPill ? 'button' : undefined} accessibilityLabel={pillLabel} disabled={!onPill} onPress={onPill}
          style={[s.pill, { backgroundColor: fill, width: notchW(w) - 8 }]}
        >{pill}</Pressable>
      )}
    </View>
  );
}

/** White panel with the small dent at its top edge, from the reference. */
export function Panel({ children, style, dent = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; dent?: boolean }) {
  return (
    <View style={[s.panel, style]}>
      {dent && <View pointerEvents="none" style={s.dent} />}
      {children}
    </View>
  );
}

/** Fades content up once. Delay lets a list arrive in reading order. */
export function Rise({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: motion.slow, delay: reduce ? 0 : delay, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
  }, []);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [reduce ? 0 : 12, 0] });
  return <Animated.View style={[style, { opacity: a, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** A number that rolls to its new value, so the person sees money move. */
export function RollingMoney({ value, v = 'money', c = color.ink }: { value: number; v?: keyof typeof type; c?: string }) {
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(value)).current;
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (reduce) { setShown(value); return; }
    const id = a.addListener(({ value: x }) => setShown(x));
    Animated.timing(a, { toValue: value, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [value, reduce]);
  return <T v={v} c={c} accessibilityLabel={money(value)} style={s.tab} numberOfLines={1} adjustsFontSizeToFit>{money(shown)}</T>;
}

/** Pressed things settle to 0.96, the same everywhere. */
export function Press({ children, style, disabled, ...rest }: React.ComponentProps<typeof Pressable> & { style?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.timing(scale, { toValue: v, duration: motion.quick, easing: Easing.out(Easing.quad), useNativeDriver: native }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable {...rest} disabled={disabled} onPressIn={() => !disabled && to(0.96)} onPressOut={() => to(1)} style={style}>{children as React.ReactNode}</Pressable>
    </Animated.View>
  );
}

type BtnProps = {
  label: string; onPress(): void; icon?: React.ReactNode; kind?: 'solid' | 'lime' | 'soft' | 'quiet'; hint?: string; style?: StyleProp<ViewStyle>; disabled?: boolean;
};
export function Button({ label, onPress, icon, kind = 'solid', hint, style, disabled }: BtnProps) {
  return (
    <View style={style}>
      <Press
        accessibilityRole="button" accessibilityLabel={label} accessibilityHint={hint} disabled={disabled}
        accessibilityState={{ disabled: !!disabled }} onPress={onPress}
        style={[s.btn, kind === 'solid' && s.solid, kind === 'lime' && s.lime, kind === 'soft' && s.soft, kind === 'quiet' && s.quiet, disabled && s.off]}
      >
        {icon}
        <T v="heading" c={kind === 'solid' ? color.white : color.ink}>{label}</T>
      </Press>
    </View>
  );
}

export function speak(text: string) {
  Speech.stop();
  Speech.speak(text, { language: 'en-NG', rate: 0.9 });
}

export function HearIt({ say }: { say: string }) {
  return (
    <Press accessibilityRole="button" accessibilityLabel={t.hearIt} onPress={() => speak(say)} style={s.hear}>
      <Volume2 size={19} color={color.ink} strokeWidth={1.8} />
      <T v="label">{t.hearIt}</T>
    </Press>
  );
}

const s = StyleSheet.create({
  under: { zIndex: -1 },
  tab: { fontVariant: ['tabular-nums'] },
  pill: { position: 'absolute', top: 0, right: 0, height: FOLD.notchH - 10, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  panel: { backgroundColor: color.white, borderRadius: radius.lg, padding: space.xl, gap: space.md },
  dent: { position: 'absolute', top: 0, alignSelf: 'center', width: 44, height: 11, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, backgroundColor: color.page },
  btn: { minHeight: touch.button, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl },
  solid: { backgroundColor: color.ink },
  lime: { backgroundColor: color.lime },
  soft: { backgroundColor: color.white },
  quiet: { minHeight: touch.min },
  off: { opacity: 0.4 },
  hear: { alignSelf: 'center', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: color.page },
});
