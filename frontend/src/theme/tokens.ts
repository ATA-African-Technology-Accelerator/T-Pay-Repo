// Every visual value in the app lives here. Screens never hard-code a colour.
// Measured from the owner's two reference mock-ups: lime and navy from one, lilac, peach and white panels from the other.
export const color = {
  white: '#FFFFFF',
  page: '#F2F4EE',
  ink: '#0D1B36',
  inkSoft: '#24324F',
  muted: '#566072',
  onDark: '#C9D0DD',
  lime: '#B3EE4A',
  limeSoft: '#E8F9C9',
  lilac: '#8A79F1',
  lilacSoft: '#E7E3FD',
  peach: '#FECC82',
  peachSoft: '#FFEFD6',
  line: '#E6E8E1',
  stage: '#DEDBF6',
  black: '#000000',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 18, xxl: 24, xxxl: 36 } as const;
export const radius = { sm: 12, md: 18, lg: 28, pill: 999 } as const;
export const touch = { min: 48, button: 56, hold: 64 } as const;

export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  head: 'Lexend_500Medium',
  headStrong: 'Lexend_600SemiBold',
} as const;

export const type = {
  moneyL: { fontFamily: font.headStrong, fontSize: 40, lineHeight: 48 },
  money: { fontFamily: font.headStrong, fontSize: 32, lineHeight: 40 },
  hello: { fontFamily: font.headStrong, fontSize: 26, lineHeight: 34 },
  title: { fontFamily: font.head, fontSize: 20, lineHeight: 28 },
  section: { fontFamily: font.head, fontSize: 18, lineHeight: 26 },
  heading: { fontFamily: font.medium, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: font.medium, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
  smallStrong: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  tiny: { fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
} as const;

export const shadow = {
  card: { shadowColor: color.ink, shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  bar: { shadowColor: color.ink, shadowOpacity: 0.24, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
} as const;

// Good news lands softly and quickly. Motion explains a change and then gets out of the way.
export const motion = { quick: 150, base: 220, slow: 300, hold: 1100, spring: { damping: 20, stiffness: 240, mass: 1 } } as const;
