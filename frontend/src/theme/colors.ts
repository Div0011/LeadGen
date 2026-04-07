/**
 * LeadGenius Color Palette
 * Elegant, sophisticated, timeless design system
 */

export const colors = {
  // Primary Palette
  ivory: '#F5F0E8',
  parchment: '#EDE5D0',
  aged: '#D9CDB4',
  tan: '#B8A98A',
  umber: '#7A6A52',
  espresso: '#3D2E1E',
  bark: '#2A1E12',

  // Accent Colors
  rust: '#8B4A2F',
  gold: '#C4943A',
  sage: '#5A6B50',
  dustyRose: '#9B6B6B',
  mist: '#8A9BA8',

  // Utility Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const rgba = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

export const componentColors = {
  background: colors.ivory,
  backgroundAlt: colors.parchment,
  backgroundDark: colors.bark,
  text: colors.espresso,
  textSecondary: colors.umber,
  textMuted: colors.tan,
  textInverse: colors.ivory,
  border: rgba(colors.tan, 0.3),
  borderMuted: rgba(colors.tan, 0.15),
  primary: colors.rust,
  secondary: colors.gold,
  accent: colors.sage,
  danger: colors.rust,
  success: colors.sage,
  warning: colors.gold,
};

export const glassEffect = {
  light: {
    background: rgba(colors.ivory, 0.7),
    backdropFilter: 'blur(20px)',
    border: rgba(colors.tan, 0.3),
  },
  medium: {
    background: rgba(colors.parchment, 0.5),
    backdropFilter: 'blur(20px)',
    border: rgba(colors.tan, 0.25),
  },
  dark: {
    background: rgba(colors.bark, 0.3),
    backdropFilter: 'blur(12px)',
    border: rgba(colors.tan, 0.1),
  },
  subtle: {
    background: rgba(colors.ivory, 0.03),
    backdropFilter: 'blur(8px)',
    border: rgba(colors.tan, 0.05),
  },
};
