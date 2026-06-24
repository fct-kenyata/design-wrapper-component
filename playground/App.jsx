import React, { useRef, useState, useMemo } from 'react';
import { BrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import {
  Home, Shield, Rss, Database, Calendar, Search, Moon, Sun, Bell,
  AlertOctagon, AlertTriangle, Activity, ShieldAlert, PanelRight,
  LayoutGrid, Boxes, BarChart3, Loader, Bug, LogOut,
} from 'lucide-react';

// ── Asset(s) ─────────────────────────────────────────────────────────
import logoUrl from '../assets/logo.jpg';

// ── Public design-system components ──────────────────────────────────
import Button from '../Button.jsx';
import Sidebar from '../Sidebar.jsx';
import { MainTopbar } from '../main-topbar.jsx';
import Tabs from '../Tabs.jsx';
import AppInput from '../AppInput.jsx';
import UnifiedSelect from '../UnifiedSelect.jsx';
import StatsCard from '../StatsCard.jsx';
import ColumnVisibilityMenu from '../ColumnVisibilityMenu.jsx';
import BaseAccordion from '../components/BaseAccordion.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import PageLoader from '../PageLoader.jsx';
import NoGraphData from '../NoGraphData.jsx';
import { ThemeSelection } from '../components/theam-selection.jsx';
import CardStructureLoader from '../skeleton/card_structure_loader.jsx';
import { ToastProvider, useToast } from '../components/toast/toastContext.jsx';
import { LiveClock } from '../liveclick.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import Error404Page from '../components/Error404Page.jsx';

// ── A broad spread of raw shadcn/ui primitives ───────────────────────
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/hover-card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Slider } from '../components/ui/slider';
import { Progress } from '../components/ui/progress';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../components/ui/sidebar';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '../components/ui/breadcrumb';

// ── Split-out demo views ─────────────────────────────────────────────
import ChartsDemo from './demos/charts.jsx';
import PrimitivesDemo from './demos/primitives.jsx';

const VIEWS = [
  { key: 'library', title: 'Library', icon: <LayoutGrid className="size-5" /> },
  { key: 'primitives', title: 'Primitives', icon: <Boxes className="size-5" /> },
  { key: 'charts', title: 'Charts', icon: <BarChart3 className="size-5" /> },
  { key: 'states', title: 'States & Loaders', icon: <Loader className="size-5" /> },
  { key: 'error', title: 'Error Pages', icon: <Bug className="size-5" /> },
];

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="rounded-xl border border-border bg-card p-6">{children}</div>
    </section>
  );
}

function ToastDemo() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary" onClick={() => toast({ title: 'Advisory dispatched', message: 'Sent to 14 recipients', type: 'success' })}>Success</Button>
      <Button variant="outline" onClick={() => toast({ message: 'New article ingested', type: 'info' })}>Info</Button>
      <Button variant="outline" onClick={() => toast({ message: 'Feed latency is high', type: 'warning' })}>Warning</Button>
      <Button variant="danger" onClick={() => toast({ title: 'Sweep failed', message: 'OpenSearch timeout', type: 'error' })}>Error</Button>
    </div>
  );
}

/* Error404Page is a react-router *errorElement* — it calls useRouteError(),
   which requires a data router. Mount it in a self-contained memory router
   whose loader throws a 404 so we can preview it in isolation. */
function Error404Preview() {
  // A loader that throws a Response is converted by react-router into a proper
  // ErrorResponse, so isRouteErrorResponse() is true and Error404Page renders
  // its real 404 treatment (not the generic 500 fallback).
  const router = useMemo(
    () =>
      createMemoryRouter(
        [
          {
            path: '*',
            loader: () => {
              throw new Response('Not Found', { status: 404, statusText: 'Not Found' });
            },
            element: null,
            errorElement: <Error404Page />,
          },
        ],
        { initialEntries: ['/this-route-does-not-exist'] }
      ),
    []
  );
  return <RouterProvider router={router} />;
}

/* A component that throws on demand, to drive ErrorBoundary. */
function Bomb({ armed }) {
  if (armed) throw new Error('Simulated render failure in <Bomb /> — caught by ErrorBoundary.');
  return <p className="text-sm text-muted-foreground">Component is healthy. Arm it to trigger the boundary.</p>;
}

function LibraryView() {
  const [tab, setTab] = useState('overview');
  const [q, setQ] = useState('');
  const [range, setRange] = useState('24h');
  const [field, setField] = useState('');
  const [hidden, setHidden] = useState(new Set(['ip']));
  const [openId, setOpenId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState([60]);
  const rsRef = useRef(null);

  return (
    <div className="space-y-10">
      <Section title="MainTopbar (library page header)">
        <div className="overflow-hidden rounded-lg border border-border">
          <MainTopbar
            pathname="/feeds/rss"
            routeLabels={{ '/feeds/rss': 'RSS Feeds' }}
            rightContent={<Button variant="ghost" size="sm" icon={<Bell className="size-4" />} />}
          />
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="dark">Dark</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" icon={<Search className="size-4" />}>With icon</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {['xs', 'sm', 'md', 'lg', 'xl'].map((s) => (<Button key={s} size={s}>{s}</Button>))}
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: 'overview', label: 'Overview', count: 12 },
            { key: 'activity', label: 'Activity', count: 4 },
            { key: 'settings', label: 'Settings' },
            { key: 'archived', label: 'Archived', disabled: true },
          ]}
        />
        <p className="mt-3 text-sm text-muted-foreground">Active: {tab}</p>
      </Section>

      <Section title="StatsCards">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCard title="Critical" value={368} icon={AlertOctagon} variant="critical" onClick={() => {}} />
          <StatsCard title="High" value={1204} icon={AlertTriangle} variant="high" onClick={() => {}} />
          <StatsCard title="Medium" value={892} icon={Activity} variant="medium" onClick={() => {}} />
          <StatsCard title="Low" value={45} icon={ShieldAlert} variant="low" onClick={() => {}} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatsCard layout="inline" title="Risk Score" value="56.3" variant="primary" />
          <StatsCard layout="inline" title="Advisories" value={12} variant="info" />
          <StatsCard shape="compact" title="Matched" value={7} variant="success" />
          <StatsCard shape="compact" title="Total Logs" value={98213} variant="warning" />
        </div>
      </Section>

      <Section title="Inputs & Select">
        <div className="grid max-w-md gap-4">
          <AppInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" prefix={<Search className="size-4" />} />
          <AppInput placeholder="Plain input" />
          <AppInput placeholder="Error state" error />
          <Textarea placeholder="Textarea…" />
          <UnifiedSelect
            value={range}
            onChange={setRange}
            options={[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
          <UnifiedSelect
            searchable
            value={field}
            onChange={setField}
            placeholder="Searchable field…"
            options={['source.ip', 'destination.ip', 'user.name', 'event.action', 'host.name']}
          />
          <Select>
            <SelectTrigger className="w-full"><SelectValue placeholder="Raw shadcn Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="ColumnVisibilityMenu & Accordion">
        <div className="space-y-4">
          <ColumnVisibilityMenu
            columns={[{ id: 'name', label: 'Name' }, { id: 'ip', label: 'IP' }, { id: 'sev', label: 'Severity' }]}
            hidden={hidden}
            onChange={setHidden}
          />
          <BaseAccordion
            openId={openId}
            onToggle={setOpenId}
            items={[
              { id: '1', header: 'What is EaglEye?', body: <p className="text-sm text-muted-foreground">A threat-intelligence advisory platform.</p>, actions: <Badge variant="secondary">new</Badge> },
              { id: '2', header: 'How are feeds ingested?', body: <p className="text-sm text-muted-foreground">RSS, Reddit and Telegram sources are polled on a schedule.</p> },
            ]}
          />
        </div>
      </Section>

      <Section title="Toggles, Badges & Avatar">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2"><Switch id="s1" defaultChecked /><Label htmlFor="s1">Switch</Label></div>
          <div className="flex items-center gap-2"><Checkbox id="c1" defaultChecked /><Label htmlFor="c1">Checkbox</Label></div>
          <RadioGroup defaultValue="a" className="flex gap-4">
            <div className="flex items-center gap-2"><RadioGroupItem value="a" id="r-a" /><Label htmlFor="r-a">A</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="b" id="r-b" /><Label htmlFor="r-b">B</Label></div>
          </RadioGroup>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Avatar><AvatarFallback>EE</AvatarFallback></Avatar>
        </div>
      </Section>

      <Section title="Slider & Progress">
        <div className="max-w-md space-y-6">
          <Slider value={slider} onValueChange={setSlider} max={100} step={1} />
          <Progress value={slider[0]} />
          <p className="text-sm text-muted-foreground">Value: {slider[0]}</p>
        </div>
      </Section>

      <Section title="Overlays — Dialog · Popover · HoverCard · Tooltip · RightSidebar">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Open Dialog</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dispatch advisory?</DialogTitle>
                <DialogDescription>This sends the advisory to all subscribed recipients.</DialogDescription>
              </DialogHeader>
              <DialogFooter><Button variant="primary">Confirm</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
            <PopoverContent>Token-driven popover content.</PopoverContent>
          </Popover>

          <HoverCard>
            <HoverCardTrigger asChild><Button variant="ghost">Hover me</Button></HoverCardTrigger>
            <HoverCardContent>Extra detail on hover.</HoverCardContent>
          </HoverCard>

          <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" icon={<Bell className="size-4" />} /></TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Button variant="outline" icon={<PanelRight className="size-4" />} onClick={() => rsRef.current?.open()}>
            Right panel
          </Button>
        </div>
        <RightSidebar ref={rsRef} title="Advisory details" subtitle="CVE-2026-0042" footer={<Button variant="primary">Save</Button>}>
          <p className="text-sm text-muted-foreground">Slide-over panel content goes here.</p>
        </RightSidebar>
      </Section>

      <Section title="Toasts">
        <ToastDemo />
      </Section>

      <Section title="Card, Alert & Separator">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Threat summary</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              42 advisories ingested
              <Separator className="my-3" />
              7 dispatched
            </CardContent>
          </Card>
          <Alert>
            <Shield className="size-4" />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>This alert renders entirely from design-system tokens.</AlertDescription>
          </Alert>
        </div>
        <div className="mt-4">
          <PageLoader isLoading={loading} />
          <Button variant="outline" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1200); }}>
            Show PageLoader (1.2s)
          </Button>
        </div>
      </Section>
    </div>
  );
}

function StatesView() {
  const [armed, setArmed] = useState(false);

  return (
    <div className="space-y-10">
      <Section title="CardStructureLoader (skeleton)">
        <CardStructureLoader count={3} />
      </Section>

      <Section title="Skeleton primitive">
        <div className="max-w-sm space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </Section>

      <Section title="NoGraphData (empty state)">
        <NoGraphData icon={<Activity />} />
      </Section>

      <Section title="LiveClock">
        <div className="text-2xl font-semibold text-foreground"><LiveClock /></div>
      </Section>

      <Section title="ErrorBoundary">
        <div className="space-y-4">
          <Button variant={armed ? 'outline' : 'danger'} onClick={() => setArmed((a) => !a)}>
            {armed ? 'Reset boundary' : 'Trigger error'}
          </Button>
          {/* The default fallback is a full-screen recovery view; framed + height-capped here for preview. */}
          <div className="overflow-hidden rounded-lg border border-border [&>div]:!min-h-[460px]">
            <ErrorBoundary key={armed ? 'armed' : 'safe'}>
              <div className="flex min-h-[460px] items-center justify-center p-6">
                <Bomb armed={armed} />
              </div>
            </ErrorBoundary>
          </div>
          <p className="text-xs text-muted-foreground">
            The redesigned default fallback (a full-screen recovery view in production), shown contained here. A custom <code>fallback</code> prop is also supported.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Gallery({ view, setView, dark, setDark }) {
  const current = VIEWS.find((v) => v.key === view);

  // The library Sidebar (shadcn bedrock) drives the shell; view items are
  // action items with an explicit `active` flag.
  const menuItems = VIEWS.map((v) => ({
    icon: v.icon,
    title: v.title,
    active: view === v.key,
    onClick: () => setView(v.key),
  }));

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar
        menuItems={menuItems}
        logo={logoUrl}
        title="EaglEye"
        subtitle="Design System"
        showLogout
        onLogout={() => alert('logout')}
      />

      <SidebarInset className="bg-background text-foreground">
        {/* Standard shadcn header (h-14, single row) */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb className="ml-1">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="#">EaglEye</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{current?.title || 'Playground'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline"><LiveClock /></span>
            <Button variant="ghost" size="sm" icon={<Bell className="size-4" />} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl space-y-10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Design System Playground</h1>
              <p className="text-sm text-muted-foreground">
                {current?.title} — every component on shadcn/ui tokens.
              </p>
            </div>
            <Button
              variant="outline"
              icon={dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              onClick={() => setDark((d) => !d)}
            >
              {dark ? 'Light' : 'Dark'}
            </Button>
          </div>

          {/* In-page view switch (mirrors the sidebar, always visible) */}
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <Button
                key={v.key}
                size="sm"
                variant={view === v.key ? 'primary' : 'outline'}
                icon={v.icon}
                onClick={() => setView(v.key)}
              >
                {v.title}
              </Button>
            ))}
          </div>

          {view === 'library' && <LibraryView />}
          {view === 'primitives' && <PrimitivesDemo />}
          {view === 'charts' && <ChartsDemo />}
          {view === 'states' && <StatesView />}
        </main>
      </SidebarInset>

      {/* Floating light/dark toggle component */}
      <ThemeSelection />
    </SidebarProvider>
  );
}

const VIEW_KEYS = VIEWS.map((v) => v.key);
const initialView = () => {
  const h = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  return VIEW_KEYS.includes(h) ? h : 'library';
};

export default function App() {
  const [view, setViewState] = useState(initialView);
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && window.location.search.includes('mode=light') ? false : true
  );

  const setView = (v) => {
    setViewState(v);
    if (typeof window !== 'undefined') window.location.hash = v;
  };

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  React.useEffect(() => {
    const onHash = () => setViewState(initialView());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Error pages are full-screen route components with their OWN data router.
  // Rendered as a top-level sibling so we never nest a Router inside a Router.
  if (view === 'error') {
    return (
      <div className="relative min-h-screen">
        <div className="absolute left-4 top-4 z-50">
          <Button variant="outline" size="sm" onClick={() => setView('library')}>← Back to playground</Button>
        </div>
        <Error404Preview />
      </div>
    );
  }

  return (
    <ToastProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Gallery view={view} setView={setView} dark={dark} setDark={setDark} />
        </BrowserRouter>
      </TooltipProvider>
    </ToastProvider>
  );
}
