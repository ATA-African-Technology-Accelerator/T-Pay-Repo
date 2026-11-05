import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { color, radius, space } from '../theme/tokens';
import { Folder, Rise, T, money, naira, useCardW, useReduceMotion } from './ui';
import { BagIcon, CoinPlusIcon, HandCoinIcon } from './icons';
import { Entry, Status } from '../demo/store';
import { t } from '../i18n/en';

const tone: Record<Status, { fg: string; bg: string; Icon: typeof BagIcon }> = {
  paid: { fg: color.ink, bg: color.lime, Icon: BagIcon },
  locked: { fg: color.ink, bg: color.lilacSoft, Icon: CoinPlusIcon },
  pending: { fg: color.ink, bg: color.peach, Icon: HandCoinIcon },
  sent: { fg: color.ink, bg: color.page, Icon: HandCoinIcon },
  refused: { fg: color.white, bg: color.ink, Icon: CoinPlusIcon },
  blocked: { fg: color.white, bg: color.ink, Icon: CoinPlusIcon },
};

export function ActivityRows({ rows }: { rows: Entry[] }) {
  return (
    <>
      {rows.map((e, i) => {
        const k = tone[e.status];
        return (
          <Rise key={e.id} delay={i * 60} style={r.row}>
            <View style={r.mark}><k.Icon size={23} c={color.ink} w={1.6} /></View>
            <View style={{ flex: 1 }}>
              <T v="label" numberOfLines={1}>{e.who}</T>
              <T v="small" c={color.muted} numberOfLines={1}>{e.when}</T>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3 }}>
              <T v="label" style={r.nums}>{money(e.amount)}</T>
              <View style={[r.chip, { backgroundColor: k.bg }]}><T v="tiny" c={k.fg}>{t.status[e.status]}</T></View>
            </View>
          </Rise>
        );
      })}
    </>
  );
}

/** Round icon button with its word underneath, from the reference. */
export function Action({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress(): void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [r.action, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
      <View style={r.actionDisc}>{icon}</View>
      <T v="smallStrong" numberOfLines={1}>{label}</T>
    </Pressable>
  );
}

/** Two coloured figures side by side: the reference's Income and Expense tiles. */
export function Duo({ items }: { items: { label: string; value: string; fill: string; icon: React.ReactNode }[] }) {
  return (
    <View style={r.duo}>
      {items.map((x, i) => (
        <Rise key={x.label} delay={i * 60} style={{ flex: 1 }}>
          <View style={[r.duoCard, { backgroundColor: x.fill }]} accessible accessibilityLabel={`${x.label}, ${x.value}`}>
            <View style={r.duoIcon}>{x.icon}</View>
            <View style={{ flex: 1 }}>
              <T v="small" numberOfLines={1}>{x.label}</T>
              <T v="label" numberOfLines={1} adjustsFontSizeToFit style={r.nums}>{x.value}</T>
            </View>
          </View>
        </Rise>
      ))}
    </View>
  );
}

function Bar({ h, on, delay }: { h: number; on: boolean; delay: number }) {
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(reduce ? h : 8)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: h, duration: reduce ? 0 : 500, delay: reduce ? 0 : delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [h, reduce]);
  return <Animated.View style={[r.bar, { height: a, backgroundColor: on ? color.lime : color.lilac }]} />;
}

/** Rounded bars on the navy folder. Tap a day to read its amount; the bubble says it in numbers. */
export function WeekBars({ title, days }: { title: string; days: { day: string; amount: number; note?: string }[] }) {
  const w = useCardW();
  const top = Math.max(...days.map(d => d.amount), 1);
  const best = days.reduce((m, d, i) => (d.amount > days[m].amount ? i : m), 0);
  const [pick, setPick] = useState(best);
  const MAX = 138;
  return (
    <Folder w={w} h={268} fill={color.ink} pill={<T v="smallStrong" c={color.white}>{title}</T>}>
      <View style={r.chart}>
        <View style={r.bubbleRow}>
          <View style={r.bubble}><T v="smallStrong" style={r.nums}>{naira(days[pick].amount)}</T></View>
          <T v="small" c={color.onDark}>{days[pick].note ?? days[pick].day}</T>
        </View>
        <View style={r.bars}>
          {days.map((d, i) => (
            <Pressable
              key={d.day} accessibilityRole="button" accessibilityState={{ selected: i === pick }} accessibilityLabel={`${d.day}, ${d.amount} naira`}
              onPress={() => setPick(i)} style={r.col}
            >
              <Bar h={Math.max(10, (d.amount / top) * MAX)} on={i === pick} delay={i * 50} />
              <T v="tiny" c={i === pick ? color.white : color.onDark}>{d.day}</T>
            </Pressable>
          ))}
        </View>
      </View>
    </Folder>
  );
}

export function Segment<K extends string>({ value, options, onChange }: { value: K; options: { key: K; label: string }[]; onChange(k: K): void }) {
  return (
    <View style={r.seg} accessibilityRole="tablist">
      {options.map(o => {
        const on = o.key === value;
        return (
          <Pressable key={o.key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={o.label} onPress={() => onChange(o.key)} style={[r.segItem, on && r.segOn]}>
            <T v="label" c={on ? color.white : color.ink}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

const r = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  mark: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.page, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill },
  nums: { fontVariant: ['tabular-nums'] },
  action: { flex: 1, alignItems: 'center', gap: 6 },
  actionDisc: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.page, alignItems: 'center', justifyContent: 'center' },
  duo: { flexDirection: 'row', gap: space.md },
  duoCard: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, padding: space.sm + 2, borderRadius: radius.md },
  duoIcon: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' },
  chart: { flex: 1, paddingHorizontal: space.xl, paddingTop: 58, paddingBottom: space.lg, justifyContent: 'flex-end', gap: space.sm },
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, position: 'absolute', top: space.xl, left: space.xl },
  bubble: { backgroundColor: color.peach, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6, minHeight: 166 },
  bar: { width: 34, borderRadius: 17 },
  seg: { flexDirection: 'row', backgroundColor: color.white, borderRadius: radius.pill, padding: 5 },
  segItem: { flex: 1, height: 46, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: color.ink },
});
