import React from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { ArrowLeft, Bell, Mic, ReceiptText } from 'lucide-react-native';
import { color, font, radius, shadow, space } from '../theme/tokens';
import { T } from './ui';
import { BagIcon, HandCoinIcon, HomeIcon } from './icons';
import { Route, useNav } from '../nav';
import { useStore } from '../demo/store';
import { t } from '../i18n/en';

const web = Platform.OS === 'web';
export const inset = { top: web ? 54 : (StatusBar.currentHeight ?? 24) + 8, bottom: web ? 26 : 12 };

export function BellButton() {
  const nav = useNav();
  const { role, history, sales } = useStore();
  const n = (role === 'sell' ? sales : history).filter(e => e.status === 'pending').length;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={n ? `${t.alerts}, ${n} ${t.status.pending}` : t.alerts}
      onPress={() => nav.reset(role === 'sell' ? { name: 'vault' } : { name: 'activity' })} style={l.round}
    >
      <Bell size={21} color={color.ink} strokeWidth={1.7} />
      {n > 0 && <View style={l.badge}><T v="tiny" style={{ fontSize: 10, lineHeight: 13 }}>{n}</T></View>}
    </Pressable>
  );
}

export function CurvedHeader({ title, back, home, bell = true }: { title?: string; back?: boolean; home?: boolean; bell?: boolean }) {
  const nav = useNav();
  return (
    <View style={l.header}>
      {back || home ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t.goBack} onPress={home ? () => nav.reset({ name: 'home' }) : nav.back} style={l.round}>
          <ArrowLeft size={21} color={color.ink} strokeWidth={1.8} />
        </Pressable>
      ) : bell ? <View style={{ width: 46 }} /> : null}
      <T v="title" accessibilityRole="header" numberOfLines={2} style={l.title}>{title}</T>
      {bell ? <BellButton /> : back || home ? <View style={{ width: 46 }} /> : null}
    </View>
  );
}

export function Avatar({ name, size = 46, tone = color.lilac }: { name: string; size?: number; tone?: string }) {
  return (
    <View importantForAccessibility="no" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tone, alignItems: 'center', justifyContent: 'center' }}>
      <T c={color.ink} style={{ fontFamily: font.headStrong, fontSize: size * 0.42, lineHeight: size * 0.56 }}>{name[0]}</T>
    </View>
  );
}

export function Greeting({ name }: { name: string }) {
  return (
    <View style={[l.header, { alignItems: 'flex-start', paddingBottom: space.md }]}>
      <View style={{ flex: 1 }}>
        <T v="body" c={color.muted} numberOfLines={1}>{`Hi, ${name}`}</T>
        <T v="hello" accessibilityRole="header">{t.welcome}</T>
      </View>
      <BellButton />
      <Avatar name={name} />
    </View>
  );
}

export function Screen({ children, head, footer, tabsFor }: {
  children: React.ReactNode; head?: React.ReactNode; tabsFor?: Route['name']; footer?: React.ReactNode;
}) {
  return (
    <View style={l.root}>
      {head}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[l.body, tabsFor && { paddingBottom: 120 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {footer && <View style={l.footer}>{footer}</View>}
      {tabsFor && <Tabs active={tabsFor} />}
    </View>
  );
}

export function Section({ title, action, onAction }: { title: string; action?: string; onAction?(): void }) {
  return (
    <View style={l.section}>
      <T v="section" accessibilityRole="header">{title}</T>
      {action && (
        <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction} hitSlop={10} disabled={!onAction}>
          <T v="small" c={color.muted}>{action}</T>
        </Pressable>
      )}
    </View>
  );
}

/** Floating dark menu from the reference. Every item keeps its word: an icon alone means nothing to a first-time user. */
function Tabs({ active }: { active: Route['name'] }) {
  const nav = useNav();
  const { role } = useStore();
  type Item = { key: Route['name']; label: string; Icon: typeof HomeIcon; to?: Route };
  const Rec: typeof HomeIcon = ({ size, c, w }) => <ReceiptText size={size} color={c} strokeWidth={w} />;
  const Talk: typeof HomeIcon = ({ size, c, w }) => <Mic size={size} color={c} strokeWidth={w} />;
  const items: Item[] = role === 'sell'
    ? [
      { key: 'home', label: t.home, Icon: HomeIcon },
      { key: 'vault', label: t.sales, Icon: BagIcon },
      { key: 'amount', label: t.collectShort, Icon: HandCoinIcon, to: { name: 'amount', mode: 'collect' } },
      { key: 'speak', label: t.speak, Icon: Talk },
    ]
    : [
      { key: 'home', label: t.home, Icon: HomeIcon },
      { key: 'vault', label: t.vault, Icon: BagIcon },
      { key: 'activity', label: t.activity, Icon: Rec },
      { key: 'speak', label: t.speak, Icon: Talk },
    ];
  const all: Item[] = [...items, { key: 'settings', label: t.profile, Icon: ({ size, c, w }) => <ProfileGlyph size={size} c={c} w={w} /> }];
  return (
    <View style={l.tabs} accessibilityRole="tablist">
      {all.map(({ key, label, Icon, to }) => {
        const on = key === active;
        return (
          <Pressable
            key={key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label}
            onPress={() => (to ? nav.go(to) : nav.reset({ name: key } as Route))} style={[l.tab, on && l.tabOn]}
          >
            <Icon size={23} c={on ? color.ink : color.white} w={1.7} />
            <T v="tiny" c={on ? color.ink : color.onDark} numberOfLines={1} style={[{ fontSize: 11, lineHeight: 14 }, on && { fontFamily: font.semibold }]}>{label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function ProfileGlyph({ size = 23, c = color.white }: { size?: number; c?: string; w?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 1.7, borderColor: c, marginTop: 2 }} />
      <View style={{ width: 16, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 1.7, borderBottomWidth: 0, borderColor: c, marginTop: 2 }} />
    </View>
  );
}

const l = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.page },
  header: { paddingTop: inset.top + 2, paddingBottom: space.sm, paddingHorizontal: space.xl, flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 },
  round: { width: 46, height: 46, borderRadius: 23, backgroundColor: color.white, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 4, right: 3, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: color.peach, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  body: { flexGrow: 1, paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.xl, gap: space.md + 2 },
  footer: { paddingHorizontal: space.xl, paddingBottom: inset.bottom + space.xs, paddingTop: space.sm, gap: space.sm, backgroundColor: color.page },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 30, marginTop: space.xs },
  tabs: {
    position: 'absolute', left: space.md, right: space.md, bottom: inset.bottom - 4, flexDirection: 'row', backgroundColor: color.ink, borderRadius: radius.pill,
    padding: 6, gap: 2, ...shadow.bar,
  },
  tab: { flex: 1, height: 58, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabOn: { backgroundColor: color.lime },
});
