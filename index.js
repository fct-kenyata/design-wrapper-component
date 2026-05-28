/**
 * Design System - Central Export
 * Import everything you need from here to ensure consistency
 *
 * Usage:
 * import { Button, sidebarColors, spacing, fontStyles } from 'design-wrapper-component';
 */

// Components
export { default as Button } from './Button';
export { default as Sidebar } from './Sidebar';
export { default as RightSidebar } from './components/RightSidebar.jsx';
export { default as BaseAccordion } from './components/BaseAccordion.jsx';
export { default as PageLoader } from './PageLoader';
export { default as UnifiedSelect } from './UnifiedSelect';
export { default as AppInput } from './AppInput';
export { default as StatsCard } from './StatsCard';
export { default as Tabs } from './Tabs';
export { default as ColumnVisibilityMenu } from './ColumnVisibilityMenu';
export { ToastProvider, useToast } from './components/toast/toastContext.jsx';

// Color Tokens
export {
  default as sidebarColors,
  chartColors,
  fontStyles,
  sidebarClasses,
  panelSummaryColors,
} from './colors';

// Spacing & Layout Tokens
export {
  spacing,
  componentSpacing,
  borderRadius,
  layout,
  zIndex,
} from './spacing';

// Common Styles (pre-built style objects)
export { default as commonStyles } from './commonStyles';
export {
  // Typography
  widgetTitleStyles,
  sectionTitleStyles,
  subtitleStyles,
  bodyTextStyles,
  smallTextStyles,
  labelStyles,
  metricStyles,
  // Cards
  cardStyles,
  gradientCardStyles,
  compactCardStyles,
  // Buttons
  primaryButtonStyles,
  secondaryButtonStyles,
  iconButtonStyles,
  // Inputs
  inputStyles,
  selectStyles,
  // Badges
  successBadgeStyles,
  warningBadgeStyles,
  errorBadgeStyles,
  infoBadgeStyles,
  // Others
  dividerStyles,
  hoverBackgroundColor,
  hoverTextColor,
} from './commonStyles';

// Side panel tokens
export {
  sidePanelTheme,
  summaryTone,
  severityBadgeStyle,
} from './sidePanelTheme';
