import { baseTokens, type BaseTokens } from './tokens';

export const themeNames = ['titanBlack', 'vitalWhite', 'pulseAi'] as const;

export type ThemeName = (typeof themeNames)[number];

export type ThemeColors = {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  primary: string;
  primaryMuted: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
};

export type ThemeTokens = BaseTokens & {
  colors: ThemeColors;
};

export type AppTheme = {
  name: ThemeName;
  label: string;
  tokens: ThemeTokens;
};

export const themes: Record<ThemeName, AppTheme> = {
  titanBlack: {
    name: 'titanBlack',
    label: 'Titan Black',
    tokens: {
      ...baseTokens,
      colors: {
        background: '#050505',
        backgroundElevated: '#0E0F0F',
        surface: '#17191A',
        surfaceMuted: '#222527',
        text: '#F8F7F2',
        textMuted: '#A7A39A',
        textInverse: '#050505',
        border: '#303438',
        primary: '#D6FF3F',
        primaryMuted: '#35420F',
        secondary: '#F7A43B',
        accent: '#60F0D4',
        success: '#5BE083',
        warning: '#F5C451',
        danger: '#FF5C5C',
        info: '#6EA8FF',
        overlay: 'rgba(0, 0, 0, 0.64)',
      },
    },
  },
  vitalWhite: {
    name: 'vitalWhite',
    label: 'Vital White',
    tokens: {
      ...baseTokens,
      colors: {
        background: '#FBFAF4',
        backgroundElevated: '#FFFFFF',
        surface: '#F0EEE4',
        surfaceMuted: '#E4E0D1',
        text: '#171714',
        textMuted: '#686457',
        textInverse: '#FFFFFF',
        border: '#D8D2BE',
        primary: '#256D3D',
        primaryMuted: '#DDEBDD',
        secondary: '#D97706',
        accent: '#007C89',
        success: '#23824D',
        warning: '#A16207',
        danger: '#C24141',
        info: '#2563EB',
        overlay: 'rgba(23, 23, 20, 0.48)',
      },
    },
  },
  pulseAi: {
    name: 'pulseAi',
    label: 'Pulse AI',
    tokens: {
      ...baseTokens,
      colors: {
        background: '#08111F',
        backgroundElevated: '#101B2D',
        surface: '#17243A',
        surfaceMuted: '#20324F',
        text: '#F4FBFF',
        textMuted: '#9FB3C8',
        textInverse: '#08111F',
        border: '#2B4262',
        primary: '#38E8FF',
        primaryMuted: '#123D4A',
        secondary: '#9DFF6E',
        accent: '#FF6FD8',
        success: '#48E08B',
        warning: '#FFD166',
        danger: '#FF5A7A',
        info: '#7DA7FF',
        overlay: 'rgba(8, 17, 31, 0.68)',
      },
    },
  },
};

export const defaultThemeName: ThemeName = 'titanBlack';

export function isThemeName(value: string): value is ThemeName {
  return themeNames.includes(value as ThemeName);
}
