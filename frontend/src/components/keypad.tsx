import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Delete } from 'lucide-react-native';
import { color, font, radius, space } from '../theme/tokens';
import { Press, T } from './ui';
import { t } from '../i18n/en';

const money = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'];
const pin = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/** The large number pad shared by amounts and the PIN. */
export function Keypad({ onKey, kind = 'money' }: { onKey(k: string): void; kind?: 'money' | 'pin' }) {
  return (
    <View style={k.keys}>
      {(kind === 'pin' ? pin : money).map((key, i) => (
        <View key={`${key}${i}`} style={k.cell}>
          {key === '' ? <View style={k.blank} /> : (
            <Press accessibilityRole="button" accessibilityLabel={key === 'del' ? t.deleteDigit : key} onPress={() => onKey(key)} style={k.key}>
              {key === 'del' ? <Delete size={24} color={color.text} strokeWidth={1.8} /> : <T style={k.text}>{key}</T>}
            </Press>
          )}
        </View>
      ))}
    </View>
  );
}

const k = StyleSheet.create({
  keys: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { flexBasis: '31%', flexGrow: 1 },
  blank: { height: 62 },
  key: { height: 62, borderRadius: radius.md, backgroundColor: color.panel, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: font.medium, fontSize: 24, lineHeight: 30, fontVariant: ['tabular-nums'] },
});
