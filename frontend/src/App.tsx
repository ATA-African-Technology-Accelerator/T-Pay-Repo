import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Lexend_500Medium } from '@expo-google-fonts/lexend/500Medium';
import { Lexend_600SemiBold } from '@expo-google-fonts/lexend/600SemiBold';
import { Signal, Wifi, BatteryFull } from 'lucide-react-native';
import { color, font, motion, shadow } from './theme/tokens';
import { T, native, useReduceMotion } from './components/ui';
import { Nav, NavCtx, Route } from './nav';
import { StoreProvider } from './demo/store';
import { Language, Role, Splash } from './features/onboarding';
import { HomeScreen } from './features/home';
import { Amount, Delivered, Refused, Review, Scan, Voucher } from './features/pay';
import { Credit, Request } from './features/collect';
import { Activity, SettingsScreen, Speak } from './features/lists';
import { VaultScreen } from './features/vault';

function render(r: Route) {
  switch (r.name) {
    case 'splash': return <Splash />;
    case 'language': return <Language />;
    case 'role': return <Role />;
    case 'home': return <HomeScreen />;
    case 'activity': return <Activity />;
    case 'vault': return <VaultScreen />;
    case 'speak': return <Speak />;
    case 'settings': return <SettingsScreen />;
    case 'amount': return <Amount mode={r.mode} />;
    case 'scan': return <Scan />;
    case 'review': return <Review amount={r.amount} />;
    case 'refused': return <Refused amount={r.amount} />;
    case 'voucher': return <Voucher amount={r.amount} />;
    case 'delivered': return <Delivered amount={r.amount} />;
    case 'request': return <Request amount={r.amount} />;
    case 'credit': return <Credit amount={r.amount} />;
  }
}

function Page({ route, dir }: { route: Route; dir: number }) {
  const reduce = useReduceMotion();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: motion.base, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start();
  }, []);
  const translateX = a.interpolate({ inputRange: [0, 1], outputRange: [reduce ? 0 : 20 * dir, 0] });
  return <Animated.View style={[StyleSheet.absoluteFill, { opacity: a, transform: [{ translateX }] }]}>{render(route)}</Animated.View>;
}

export default function App() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Lexend_500Medium, Lexend_600SemiBold });
  const [stack, setStack] = useState<{ r: Route; id: number; dir: number }[]>([{ r: { name: 'splash' }, id: 0, dir: 0 }]);
  const ids = useRef(1);
  const nav = useMemo<Nav>(() => ({
    go: r => setStack(s => [...s, { r, id: ids.current++, dir: 1 }]),
    reset: r => setStack([{ r, id: ids.current++, dir: 0 }]),
    back: () => setStack(s => (s.length > 1 ? [...s.slice(0, -1).slice(0, -1), { ...s[s.length - 2], id: ids.current++, dir: -1 }] : s)),
  }), []);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { nav.back(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length]);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.page }} />;
  const top = stack[stack.length - 1];
  return (
    <StoreProvider>
      <NavCtx.Provider value={nav}>
        <View style={st.stage}>
          <View style={st.phone}>
            <StatusBar style="dark" />
            <Page key={top.id} route={top.r} dir={top.dir} />
            {web && <DeviceChrome />}
          </View>
        </View>
      </NavCtx.Provider>
    </StoreProvider>
  );
}

const web = Platform.OS === 'web';

/** Preview only: the phone's own clock and home bar, so the web build reads like the device. */
function DeviceChrome() {
  return (
    <>
      <View pointerEvents="none" style={st.status}>
        <T v="label" style={{ fontFamily: font.semibold, width: 60 }}>11:41</T>
        <View style={st.island} />
        <View style={st.right}>
          <Signal size={17} color={color.ink} strokeWidth={2.4} />
          <Wifi size={17} color={color.ink} strokeWidth={2.4} />
          <BatteryFull size={21} color={color.ink} strokeWidth={1.8} />
        </View>
      </View>
      <View pointerEvents="none" style={st.bar} />
    </>
  );
}

const st = StyleSheet.create({
  stage: { flex: 1, backgroundColor: web ? color.stage : color.page, alignItems: 'center', justifyContent: 'center' },
  phone: { flex: 1, width: '100%', backgroundColor: color.page, overflow: 'hidden', ...(web ? { maxWidth: 390, maxHeight: 844, borderRadius: 44, ...shadow.card } : null) },
  status: { position: 'absolute', top: 12, left: 26, right: 22, height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  island: { width: 104, height: 29, borderRadius: 15, backgroundColor: color.black },
  right: { width: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 3 },
  bar: { position: 'absolute', bottom: 8, alignSelf: 'center', width: 132, height: 5, borderRadius: 3, backgroundColor: color.black },
});
