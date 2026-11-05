import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { motion, space } from '../theme/tokens';
import { Folder, notchW, RollingMoney, T, money, native, speak, useCardW, useReduceMotion } from './ui';

export type DeckCard = { key: string; label: string; amount: number; note: string; fill: string; fg: string; sub: string; icon: React.ReactNode };

const PEEK = 60, H = 206;

/** Folder cards stacked one behind another. Tap a card behind to pull it to the front. */
export function BalanceDeck({ cards }: { cards: DeckCard[] }) {
  const w = useCardW();
  const n = cards.length;
  const [front, setFront] = useState(0);
  const reduce = useReduceMotion();
  const slots = useMemo(() => cards.map((_, i) => (i - front + n) % n), [front, n]);
  const anim = useRef(cards.map((_, i) => new Animated.Value(i))).current;
  useEffect(() => {
    Animated.parallel(anim.map((a, i) => (reduce
      ? Animated.timing(a, { toValue: slots[i], duration: 0, useNativeDriver: native })
      : Animated.spring(a, { toValue: slots[i], ...motion.spring, useNativeDriver: native })))).start();
  }, [front]);
  return (
    <View style={{ height: H + PEEK * (n - 1), width: w }}>
      {cards.map((c, i) => {
        const slot = slots[i];
        const translateY = anim[i].interpolate({ inputRange: [0, n - 1 || 1], outputRange: [PEEK * (n - 1), 0] });
        const scale = anim[i].interpolate({ inputRange: [0, n - 1 || 1], outputRange: [1, 1 - 0.05 * (n - 1)] });
        const on = slot === 0;
        return (
          <Animated.View key={c.key} style={[d.card, { zIndex: n - slot, transform: [{ translateY }, { scale }] }]}>
            <Folder
              w={w} h={H} fill={c.fill}
              onPill={on ? () => speak(`${c.label}. ${c.amount} naira`) : () => setFront(i)} pillLabel={on ? `Hear ${c.label}` : `${c.label}, ${c.amount} naira`}
              pill={on
                ? <><Volume2 size={18} color={c.fg} strokeWidth={1.9} /><T v="smallStrong" c={c.fg}>Hear it</T></>
                : <T v="smallStrong" c={c.fg} style={d.nums}>{money(c.amount)}</T>}
            >
              <Pressable
                accessibilityRole="button" disabled={on} accessibilityLabel={on ? `${c.label}, ${c.amount} naira` : `Show ${c.label}`}
                onPress={() => setFront(i)} style={d.fill}
              >
                <View style={[d.top, { paddingRight: notchW(w) - 8 }]}>{w >= 340 && c.icon}<T v="heading" c={c.fg} numberOfLines={1}>{c.label}</T></View>
                {on && (
                  <View style={d.main}>
                    <RollingMoney value={c.amount} v="moneyL" c={c.fg} />
                    <T v="small" c={c.sub} numberOfLines={1}>{c.note}</T>
                  </View>
                )}
              </Pressable>
            </Folder>
          </Animated.View>
        );
      })}
    </View>
  );
}

const d = StyleSheet.create({
  card: { position: 'absolute', left: 0, top: 0, transformOrigin: 'top center' } as any,
  fill: { flex: 1, paddingHorizontal: space.xxl - 2, paddingTop: space.xl },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  main: { flex: 1, justifyContent: 'flex-end', paddingBottom: space.xl, gap: 2 },
  nums: { fontVariant: ['tabular-nums'] },
});

