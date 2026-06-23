# Upgrading to the shadcn-based design system

Swapping in this version is **mostly drop-in** — every component keeps its old
export name and props (`Button`, `Tabs`, `StatsCard`, `AppInput`,
`UnifiedSelect`, all chart/card wrappers, toasts, …) and automatically picks up
the new Geist font, tokens, and light/dark theming.

Three host-side changes are required. Apply them once.

---

## 1. Install dependencies

The library now uses Geist (font), Radix, Base UI, Recharts, Sonner, Vaul, etc.

```bash
pnpm install   # (or npm/yarn) — picks up the new deps from package.json
```

## 2. Dark mode is driven by the `.dark` class

Token-styled components read light/dark from a `.dark` class on `<html>`
(instead of the old localStorage-reload theming). Toggle it however you manage
theme:

```js
document.documentElement.classList.toggle('dark', isDark);
```

No class → light theme. Add `.dark` → dark theme.

## 3. `Sidebar` now uses the shadcn layout (SidebarProvider + SidebarInset)

The `Sidebar` was rebuilt on the shadcn sidebar bedrock. It no longer renders a
standalone fixed rail that you offset with `marginLeft`. Wrap the app shell in
`SidebarProvider` and put page content in a sibling `SidebarInset`.

**Before**

```jsx
import Sidebar from '@design-pattern/Sidebar';

function Shell({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Sidebar menuItems={MENU} logo={logo} onOpenChange={setOpen} showLogout onLogout={logout} />
      <div style={{ marginLeft: open ? 256 : 80 }}>{children}</div>
    </>
  );
}
```

**After**

```jsx
import Sidebar from '@design-pattern/Sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@design-pattern/components/ui/sidebar';

function Shell({ children }) {
  return (
    <SidebarProvider>
      <Sidebar
        menuItems={MENU}
        logo={logo}
        title="EaglEye"
        subtitle="Threat Intelligence"
        showLogout
        onLogout={logout}
      />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          {/* your topbar */}
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
```

- No more manual `marginLeft` — `SidebarInset` handles the offset and the
  collapse animation.
- `menuItems` shape is unchanged (`{ icon, title, path?, children?, onClick?, variant? }`),
  plus a new optional `active` flag and new optional `title`/`subtitle` props on
  `Sidebar` for the header.
- `onOpenChange` still fires if you need the open state.
- Collapse the rail with `<SidebarTrigger />` (or ⌘/Ctrl+B).

---

That's it. Everything else is unchanged.
