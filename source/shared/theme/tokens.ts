export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  fontFamily: {
    heading: 'System',
    body: 'System',
    mono: 'SpaceMono',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const opacity = {
  disabled: 0.4,
  pressed: 0.72,
  overlay: 0.56,
} as const;

export const elevation = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 12,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
export type FontSizeToken = keyof typeof typography.fontSize;
export type FontWeightToken = keyof typeof typography.fontWeight;

export type BaseTokens = {
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  opacity: typeof opacity;
  elevation: typeof elevation;
};

export const baseTokens: BaseTokens = {
  spacing,
  radii,
  typography,
  opacity,
  elevation,
};
