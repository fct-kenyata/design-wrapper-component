# EaglEye Design System

A React design system for the EaglEye threat-intelligence platform, built on
**shadcn/ui + Tailwind v4** with a single blue brand and full light/dark support.
Consumed as source via the `@design-pattern` (and `design-wrapper-component`)
aliases, or via the prebuilt `dist/design-system.css`.

```js
import { Button, StatsCard, Tabs } from '@design-pattern';
import '@design-pattern/styles/design-system.css'; // tokens + Geist font + utilities
```

## Theming

- One blue brand theme, light + dark, WCAG-AA.
- **Dark mode is the `.dark` class on `<html>`** — toggle it however you manage theme:
  ```js
  document.documentElement.classList.toggle('dark', isDark);
  ```
- Colors come from CSS variables (`--background`, `--primary`, `--sidebar`, severity
  `--critical/--high/--medium/--low`, …) exposed as Tailwind utilities
  (`bg-card`, `text-foreground`, `border-border`, `bg-primary`, …).
- Typeface: **Geist** (sans + mono), self-hosted.

## What's inside

**Library components** (`@design-pattern`)
`Button`, `Sidebar`, `RightSidebar`, `Tabs`, `AppInput`, `UnifiedSelect`,
`StatsCard`, `ColumnVisibilityMenu`, `BaseAccordion`, `PageLoader`, `LiveClock`,
`NoGraphData`, `ThemeSelection`, `ToastProvider`/`useToast`, `ErrorBoundary`,
`Error404Page`, `CardStructureLoader`.

**shadcn/ui primitives** (`@design-pattern/components/ui/*`)
The full standard catalog — accordion, alert(-dialog), avatar, badge, breadcrumb,
button(-group), calendar, card, carousel, chart (recharts), checkbox, collapsible,
combobox, command, context-menu, dialog, drawer, dropdown-menu, empty, field,
hover-card, input(-group/-otp), item, kbd, label, menubar, native-select,
navigation-menu, pagination, popover, progress, radio-group, resizable,
scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner,
switch, table, tabs, textarea, toggle(-group), tooltip.

**Chart / card wrappers** (`@design-pattern/chartsComponents/chartWrappers/*`)
echarts-based: area, line, vertical/horizontal bar, donut, nightingale, heatmap,
geo-location map. shadcn-Card-based: metric cards, risk score, list card, top
cards, table, MTTD/MTTR, threat list, exploit attempts, malware/actors. All
light/dark aware; `EagleEyeLoader` is the shared loading state.

**Tokens** — `colors.js` (`sidebarColors`, `chartColors`, `fontStyles`),
`spacing.js`, `commonStyles.js`, `sidePanelTheme.js`.

## Preview / develop

```bash
pnpm install
pnpm dev        # playground — every component, light + dark (?mode=light, #charts, …)
pnpm build      # builds dist/design-system.css + copies Geist fonts to dist/files/
```

## Upgrading from the old design wrapper

See **[UPGRADING.md](./UPGRADING.md)** — the components are drop-in, but three host
steps are required: install deps, toggle the `.dark` class for dark mode, and adopt
`SidebarProvider` + `SidebarInset` for the (now shadcn-bedrock) `Sidebar`.
