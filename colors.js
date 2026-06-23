// Single blue brand theme (ocean). The earlier multi-theme set
// (sentinel/emerald/signal) was dropped for one WCAG-AA blue brand; any legacy
// localStorage theme value falls back to ocean via the lookups below.
import * as ocean from "./theam/ocean.jsx";

const themeMap = {
    ocean,
};

// Safe localStorage read — returns default during SSR where window is undefined
const getThemeKey = () => {
    if (typeof window === "undefined") return "ocean"; // SSR: EagleEye brand theme is the default
    return localStorage.getItem("theme") || "ocean";
};

const themeKey = getThemeKey();

const theme = themeMap[themeKey] ?? themeMap['ocean']; // fallback to brand theme

const sidebarColors = theme.default;
const DEFAULT_COLORS = theme.DEFAULT_COLORS;
const fontStyles = theme.fontStyles;
const chartColors = theme.chartColors;
const panelSummaryColors = theme.panelSummaryColors;
const sidebarClasses = theme.sidebarClasses;

export {
  DEFAULT_COLORS,
  fontStyles,
  chartColors,
  panelSummaryColors,
  sidebarClasses,
  sidebarColors,
};

export default sidebarColors;

/**
 * getLiveSidebarColors — reads current localStorage theme on every call.
 * Use inside React component bodies to get theme-accurate colors on every render.
 * Bypasses the module-level cache that is frozen at SSR time.
 */
export const getLiveSidebarColors = () => {
    if (typeof window === "undefined") return themeMap["ocean"].default;
    const key = localStorage.getItem("theme") || "ocean";
    return (themeMap[key] || themeMap["ocean"]).default;
};
