// ============================================================
// theme1.jsx — Cyber Blue Theme  (Sky-500 accent)
// ============================================================

const DEFAULT_COLORS = {
  background: '#050d1a',
  backgroundSoft: '#0a1628',
  surface: '#0f1f38',
  surfaceElevated: '#162844',
  border: '#1e3a5f',
  borderSoft: 'rgba(56, 189, 248, 0.06)',
  textPrimary: '#e2f4ff',
  textSecondary: 'rgba(226, 244, 255, 0.55)',
  textMuted: 'rgba(226, 244, 255, 0.30)',
  textInverse: '#050d1a',
  primary: '#0ea5e9',
  secondary: '#38bdf8',
};

const sidebarColors = {
  // ── BACKGROUNDS ──────────────────────────────────────────────
  background: DEFAULT_COLORS.background,
  backgroundSoft: DEFAULT_COLORS.backgroundSoft,
  surface: DEFAULT_COLORS.surface,
  surfaceElevated: DEFAULT_COLORS.surfaceElevated,

  // ── EXTENDED SURFACES ────────────────────────────────────────
  surfaceMuted: '#0c1a30',
  surfaceTint: '#0d1f3a',
  surfaceMutedDeep: '#071628',
  surfaceTintDark: '#0a1628',
  backgroundDeep: '#020812',

  // ── BORDERS ──────────────────────────────────────────────────
  border: DEFAULT_COLORS.border,
  borderSoft: DEFAULT_COLORS.borderSoft,
  borderSubtle: 'rgba(56, 189, 248, 0.08)',
  borderStrong: 'rgba(56, 189, 248, 0.45)',
  borderAccent: 'rgba(56, 189, 248, 0.20)',

  // ── TEXT ─────────────────────────────────────────────────────
  textPrimary: DEFAULT_COLORS.textPrimary,
  textSecondary: DEFAULT_COLORS.textSecondary,
  textMuted: DEFAULT_COLORS.textMuted,
  textInverse: DEFAULT_COLORS.textInverse,
  textAccent: DEFAULT_COLORS.primary,
  textDim: '#1e3a5f',
  textDisabled: '#143050',
  textLighter: '#bae6fd',
  textOffWhite: '#e2f4ff',
  textTertiary: '#7dd3fc',

  // ── PRIMARY BRAND ────────────────────────────────────────────
  primaryFrom: DEFAULT_COLORS.primary,
  primaryTo: DEFAULT_COLORS.secondary,
  primary: DEFAULT_COLORS.primary,
  accent: DEFAULT_COLORS.secondary,
  primaryMuted: '#7dd3fc',

  // ── STATUS — DANGER ──────────────────────────────────────────
  danger: '#ff2d2d',
  dangerDark: '#dc2626',
  dangerHover: '#ef4444',
  dangerSoft: '#fca5a5',
  dangerLight: '#f87171',
  dangerDark2: '#b91c1c',
  dangerDarker: '#991b1b',

  // ── STATUS — SUCCESS ─────────────────────────────────────────
  success: '#10b981',
  successSoft: '#34d399',
  successGreen: '#22c55e',

  // ── STATUS — WARNING ─────────────────────────────────────────
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#d97706',
  warningSoft: '#fde68a',
  warningOrange: '#ea580c',

  // ── STATUS — INFO ────────────────────────────────────────────
  info: DEFAULT_COLORS.primary,
  infoSoft: DEFAULT_COLORS.secondary,

  // ── NEUTRAL / ERROR ──────────────────────────────────────────
  neutral: '#6b7280',
  errorcolor: '#ef4444',
  sucesscolor: '#22c55e',

  // ── LOGIN PAGE ───────────────────────────────────────────────
  loginBgFrom: '#050d1a',
  loginBgTo: '#0f1f38',

  // ── EXTENDED ACCENT PALETTE ──────────────────────────────────
  accentPurple: '#a78bfa',
  accentCyan: '#06b6d4',
  accentIndigo: '#6366f1',
  accentPink: '#ec4899',
  accentBlue: '#38bdf8',
  accentTeal: '#14b8a6',
  accentViolet: '#8b5cf6',
  accentOrange: '#f97316',
  accentYellow: '#eab308',
  accentBlueDark: '#0284c7',
  accentIndigoDark: '#4338ca',
  accentVioletDark: '#7c3aed',
  accentPurple600: '#9333ea',

  // ── EXTENDED DARK SHADES ─────────────────────────────────────
  orangeDark700: '#c2410c',
  orangeDark800: '#9a3412',
  orangeDark900: '#7c2d12',
  amberDark900: '#78350f',
  orangeDark950: '#451a03',
  stoneDark800: '#0a1628',
  stoneDark900: '#050d1a',

  // ── HOVER / ACTIVE / BUTTON ──────────────────────────────────
  hoverBackground: DEFAULT_COLORS.surface,
  hoverBorder: DEFAULT_COLORS.surface,
  hoverShadow: 'rgba(56, 189, 248, 0.55)',
  hoverShadowSpread: '0 0 20px',
  hoverText: DEFAULT_COLORS.secondary,
  activeBackground: DEFAULT_COLORS.surface,
  activeBorder: DEFAULT_COLORS.surface,
  activeShadow: 'rgba(56, 189, 248, 0.45)',
  activeText: DEFAULT_COLORS.primary,
  buttonBackground: DEFAULT_COLORS.background,
  buttonIconColor: DEFAULT_COLORS.textPrimary,

  // ── TAILWIND CLASSES ─────────────────────────────────────────
  primaryGradient: 'from-sky-500 to-sky-400',
  primaryShadow: 'shadow-sky-500/50',
};

// ===== FONT STYLES ===== (same across all themes)
const fontSmoothing = {
  fontFamily:
    "'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility',
};

export const fontStyles = {
  smoothing: fontSmoothing,
  heading1: {
    fontSize: '32px',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    ...fontSmoothing,
  },
  heading2: {
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.015em',
    ...fontSmoothing,
  },
  heading3: {
    fontSize: '20px',
    fontWeight: '700',
    lineHeight: '1.3',
    letterSpacing: '-0.01em',
    ...fontSmoothing,
  },
  heading4: {
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1.4',
    letterSpacing: '-0.005em',
    ...fontSmoothing,
  },
  heading5: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.4',
    ...fontSmoothing,
  },
  heading6: {
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1.5',
    letterSpacing: '0.01em',
    ...fontSmoothing,
  },
  body: { fontSize: '14px', lineHeight: '1.6', ...fontSmoothing },
  bodyLarge: { fontSize: '16px', lineHeight: '1.6', ...fontSmoothing },
  bodySmall: { fontSize: '12px', lineHeight: '1.5', ...fontSmoothing },
  caption: { fontSize: '12px', lineHeight: '1.4', ...fontSmoothing },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.01em',
    ...fontSmoothing,
  },
  button: {
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.02em',
    ...fontSmoothing,
  },
  metric: {
    fontSize: '24px',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1.2',
    ...fontSmoothing,
  },
  metricMedium: {
    fontSize: '30px',
    fontWeight: '700',
    lineHeight: '1.1',
    fontVariantNumeric: 'tabular-nums',
    ...fontSmoothing,
  },
  metric2xl: {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1',
    fontVariantNumeric: 'tabular-nums',
    ...fontSmoothing,
  },
  metricLarge: {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1.1',
    fontVariantNumeric: 'tabular-nums',
    ...fontSmoothing,
  },
  metricXL: {
    fontSize: '60px',
    fontWeight: '700',
    lineHeight: '1.1',
    fontVariantNumeric: 'tabular-nums',
    ...fontSmoothing,
  },
  code: {
    fontSize: '13px',
    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
    lineHeight: '1.6',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
};

// ===== CHART COLORS =====
export const chartColors = {
  primary: ['#0ea5e9', '#38bdf8', '#0284c7', '#7dd3fc', '#bae6fd'],
  severity: {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#0ea5e9',
    info: '#0ea5e9',
  },
  series: [
    '#0ea5e9',
    '#38bdf8',
    '#8b5cf6',
    '#06b6d4',
    '#00d4ff',
    '#f59e0b',
    '#ec4899',
    '#6366f1',
    '#14b8a6',
    '#84cc16',
  ],
  categorical: [
    '#0ea5e9',
    '#38bdf8',
    '#06b6d4',
    '#22d3ee',
    '#8b5cf6',
    '#a78bfa',
    '#ec4899',
    '#f472b6',
    '#6366f1',
    '#818cf8',
  ],
  gradients: {
    blue: ['#0ea5e9', '#38bdf8'],
    cyan: ['#06b6d4', '#22d3ee'],
    orange: ['#f97316', '#fb923c'],
    pink: ['#ec4899', '#f472b6'],
  },
  // `ui` is a mode-aware getter: echarts axis/grid/label/tooltip colors follow
  // the active light/dark theme (signalled by the `.dark` class on <html>, the
  // same mechanism design-system.css uses). Wrappers read chartColors.ui.* at
  // render time, so the getter resolves the right palette on every paint.
  _uiDark: {
    grid: 'rgba(56, 189, 248, 0.08)',
    axis: 'rgba(226, 244, 255, 0.30)',
    label: 'rgba(226, 244, 255, 0.60)',
    text: 'rgba(226, 244, 255, 0.92)',
    tooltip: 'rgba(5, 13, 26, 0.97)',
    tooltipBorder: 'rgba(56, 189, 248, 0.50)',
    border: 'rgba(56, 189, 248, 0.15)',
  },
  _uiLight: {
    grid: 'rgba(15, 23, 42, 0.10)',
    axis: 'rgba(15, 23, 42, 0.35)',
    label: 'rgba(15, 23, 42, 0.62)',
    text: 'rgba(15, 23, 42, 0.88)',
    tooltip: 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: 'rgba(14, 165, 233, 0.45)',
    border: 'rgba(15, 23, 42, 0.12)',
  },
  get ui() {
    const isLight = typeof document !== 'undefined'
      && !document.documentElement.classList.contains('dark');
    return isLight ? this._uiLight : this._uiDark;
  },
  edges: {
    critical: '#ef4444',
    high: '#f87171',
    medium: '#fca5a5',
    low: '#fecaca',
    default: '#dc2626',
  },
  themes: {
    dark: {
      background: DEFAULT_COLORS.background,
      backgroundSoft: DEFAULT_COLORS.backgroundSoft,
      surface: DEFAULT_COLORS.surface,
      surfaceElevated: DEFAULT_COLORS.surfaceElevated,
      border: DEFAULT_COLORS.border,
      borderSoft: DEFAULT_COLORS.borderSoft,
      borderSubtle: 'rgba(56,189,248,0.08)',
      borderStrong: 'rgba(56,189,248,0.45)',
      borderAccent: 'rgba(56,189,248,0.20)',
      textPrimary: DEFAULT_COLORS.textPrimary,
      textSecondary: DEFAULT_COLORS.textSecondary,
      textMuted: DEFAULT_COLORS.textMuted,
      textInverse: DEFAULT_COLORS.textInverse,
      textAccent: '#38bdf8',
      primaryFrom: '#0ea5e9',
      primaryTo: '#38bdf8',
      primary: '#0ea5e9',
      accent: '#38bdf8',
      nodeBg: '#071221',
      nodeStroke: '#38bdf8',
      edge: '#e2f4ff',
      edgeGlow: '#0ea5e9',
      hubRing1: '#38bdf8',
      hubRing2: '#06b6d4',
      hubCore: '#040d18',
      hubBorder: '#0ea5e9',
      statBorder: '#06b6d4',
    },
    light: {
      background: '#f0f9ff',
      backgroundSoft: '#e0f2fe',
      surface: '#bae6fd',
      surfaceElevated: '#ffffff',
      border: '#7dd3fc',
      borderSoft: 'rgba(14,165,233,0.08)',
      borderSubtle: 'rgba(14,165,233,0.10)',
      borderStrong: 'rgba(14,165,233,0.35)',
      borderAccent: 'rgba(14,165,233,0.18)',
      textPrimary: '#0c2340',
      textSecondary: '#1e5080',
      textMuted: '#4a90b8',
      textInverse: '#f0f9ff',
      textAccent: '#0284c7',
      primary: '#0284c7',
      accent: '#0ea5e9',
      nodeBg: '#e0f2fe',
      nodeStroke: '#0284c7',
      edge: '#7dd3fc',
      edgeGlow: 'rgba(14,165,233,0.4)',
      hubRing1: '#0ea5e9',
      hubRing2: '#06b6d4',
      hubCore: '#dbeafe',
      hubBorder: '#0284c7',
      statBorder: '#0ea5e9',
    },
    cyber: {
      background: '#020812',
      backgroundSoft: '#040f1e',
      surface: '#071628',
      surfaceElevated: '#0a1f38',
      border: '#0e3a5c',
      borderSoft: 'rgba(0,212,255,0.06)',
      borderSubtle: 'rgba(0,212,255,0.10)',
      borderStrong: 'rgba(0,212,255,0.40)',
      borderAccent: 'rgba(0,212,255,0.20)',
      textPrimary: '#e2f4ff',
      textSecondary: 'rgba(226,244,255,0.55)',
      textMuted: 'rgba(226,244,255,0.30)',
      textInverse: '#020812',
      textAccent: '#00d4ff',
      primary: '#00d4ff',
      accent: '#00ff88',
      nodeBg: '#030e1c',
      nodeStroke: '#00d4ff',
      edge: '#e2f4ff',
      edgeGlow: '#00d4ff',
      hubRing1: '#00d4ff',
      hubRing2: '#00ff88',
      hubCore: '#010810',
      hubBorder: '#7c3aed',
      statBorder: '#00d4ff',
    },
  },
  networkSankey: {
    hubGradientFrom: '#071628',
    hubGradientTo: '#020d1a',
    panelGradientFrom: '#060f20',
    panelGradientTo: '#030a14',
    input: '#38bdf8',
    inputGlow: '#0ea5e9',
    output: '#34d399',
    outputGlow: '#059669',
    cyan: '#06b6d4',
    textInput: '#bae6fd',
    textPanel: '#d4e5f7',
    textOutput: '#d1fae5',
  },
  default: '#0ea5e9',
};

export const panelSummaryColors = {
  primary: '#3b82f6',
  info: '#06b6d4',
  warning: '#f97316',
  success: '#14b8a6',
  overlay: '#000000',
};

export const sidebarClasses = {
  primaryGradient: 'from-sky-500 to-sky-400',
  primaryShadow: 'shadow-sky-500/50',
};

export { DEFAULT_COLORS };
export default sidebarColors;
