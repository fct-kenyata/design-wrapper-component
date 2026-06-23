import React, { useState } from 'react';
import {
  Search, Mail, ChevronDown, Plus, Copy, Trash2, Settings, User, FileText,
  Bold, Italic, Underline, Bell, Calendar as CalIcon,
} from 'lucide-react';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { AspectRatio } from '../../components/ui/aspect-ratio';
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from '../../components/ui/breadcrumb';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '../../components/ui/button-group';
import { Calendar } from '../../components/ui/calendar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../components/ui/collapsible';
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut,
} from '../../components/ui/command';
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut,
} from '../../components/ui/context-menu';
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose,
} from '../../components/ui/drawer';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut,
} from '../../components/ui/dropdown-menu';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from '../../components/ui/empty';
import { Field, FieldLabel, FieldDescription, FieldGroup } from '../../components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../../components/ui/input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../../components/ui/input-otp';
import { Item, ItemMedia, ItemContent, ItemActions, ItemTitle, ItemDescription } from '../../components/ui/item';
import { Kbd, KbdGroup } from '../../components/ui/kbd';
import {
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarShortcut,
} from '../../components/ui/menubar';
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
} from '../../components/ui/navigation-menu';
import { NativeSelect, NativeSelectOption } from '../../components/ui/native-select';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from '../../components/ui/pagination';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Spinner } from '../../components/ui/spinner';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from '../../components/ui/table';
import { Toggle } from '../../components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../components/ui/toggle-group';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../../components/ui/sheet';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../../components/ui/carousel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../components/ui/resizable';
import { Toaster } from '../../components/ui/sonner';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from '../../components/ui/combobox';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';
import ErrorBoundary from '../../components/ErrorBoundary.jsx';

const chartConfig = {
  blocked: { label: 'Blocked', color: 'var(--chart-1)' },
  allowed: { label: 'Allowed', color: 'var(--chart-2)' },
};
const miniChartData = [
  { day: 'Mon', blocked: 120, allowed: 30 },
  { day: 'Tue', blocked: 180, allowed: 42 },
  { day: 'Wed', blocked: 150, allowed: 28 },
  { day: 'Thu', blocked: 210, allowed: 55 },
  { day: 'Fri', blocked: 240, allowed: 60 },
];
const FRAMEWORKS = ['source.ip', 'destination.ip', 'user.name', 'event.action', 'host.name'];

function ComboboxDemo() {
  return (
    <Combobox items={FRAMEWORKS}>
      <ComboboxInput placeholder="Search field…" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function Block({ title, children }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </div>
  );
}

export default function PrimitivesDemo() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [toggles, setToggles] = useState(['bold']);
  const [day, setDay] = useState(new Date(2026, 5, 23));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Block title="Accordion">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="a">
            <AccordionTrigger>Ingestion pipeline</AccordionTrigger>
            <AccordionContent>RSS, Reddit and Telegram are polled on a schedule.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Enrichment</AccordionTrigger>
            <AccordionContent>IOCs are enriched against threat-intel feeds.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Block>

      <Block title="Collapsible">
        <Collapsible className="w-full">
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            Advanced filters <ChevronDown className="size-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-md border border-border p-3 text-sm text-muted-foreground">
            Severity, source, and date-range filters live here.
          </CollapsibleContent>
        </Collapsible>
      </Block>

      <Block title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Feeds</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>RSS</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Block>

      <Block title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </Block>

      <Block title="ButtonGroup">
        <ButtonGroup>
          <Button variant="outline" size="sm">Day</Button>
          <Button variant="outline" size="sm">Week</Button>
          <Button variant="outline" size="sm">Month</Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>UTC</ButtonGroupText>
        </ButtonGroup>
      </Block>

      <Block title="Toggle & ToggleGroup">
        <Toggle aria-label="Bold"><Bold className="size-4" /></Toggle>
        <ToggleGroup type="multiple" value={toggles} onValueChange={setToggles}>
          <ToggleGroupItem value="bold"><Bold className="size-4" /></ToggleGroupItem>
          <ToggleGroupItem value="italic"><Italic className="size-4" /></ToggleGroupItem>
          <ToggleGroupItem value="underline"><Underline className="size-4" /></ToggleGroupItem>
        </ToggleGroup>
      </Block>

      <Block title="DropdownMenu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline">Actions <ChevronDown className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Row actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Copy className="size-4" />Copy<DropdownMenuShortcut>⌘C</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuItem><Settings className="size-4" />Settings</DropdownMenuItem>
            <DropdownMenuItem variant="destructive"><Trash2 className="size-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Block>

      <Block title="ContextMenu (right-click)">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-20 w-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Open<ContextMenuShortcut>⏎</ContextMenuShortcut></ContextMenuItem>
            <ContextMenuItem>Pin to top</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Remove</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </Block>

      <Block title="Menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New case<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Export…</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent><MenubarItem>Toggle sidebar</MenubarItem></MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Block>

      <Block title="NavigationMenu">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Feeds</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1 p-2">
                  <li><NavigationMenuLink href="#">RSS</NavigationMenuLink></li>
                  <li><NavigationMenuLink href="#">Reddit</NavigationMenuLink></li>
                  <li><NavigationMenuLink href="#">Telegram</NavigationMenuLink></li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Block>

      <Block title="Command palette (dialog)">
        <Button variant="outline" onClick={() => setCmdOpen(true)}>Open command palette</Button>
        <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
          <CommandInput placeholder="Type a command…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem><Search className="size-4" />Search articles<CommandShortcut>⌘K</CommandShortcut></CommandItem>
              <CommandItem><User className="size-4" />Profile</CommandItem>
              <CommandItem><Settings className="size-4" />Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Block>

      <Block title="AlertDialog">
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="danger">Delete case</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this case?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Block>

      <Block title="Drawer">
        <Drawer>
          <DrawerTrigger asChild><Button variant="outline">Open drawer</Button></DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Quick triage</DrawerTitle>
              <DrawerDescription>Bottom-sheet drawer (vaul).</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button variant="primary">Apply</Button>
              <DrawerClose asChild><Button variant="ghost">Close</Button></DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Block>

      <Block title="InputGroup & Field">
        <div className="w-full space-y-4">
          <InputGroup>
            <InputGroupAddon><Search className="size-4" /></InputGroupAddon>
            <InputGroupInput placeholder="Search IOCs…" />
            <InputGroupAddon align="inline-end"><InputGroupText>⌘K</InputGroupText></InputGroupAddon>
          </InputGroup>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="you@org.com" />
              <FieldDescription>We'll send advisories here.</FieldDescription>
            </Field>
          </FieldGroup>
        </div>
      </Block>

      <Block title="InputOTP">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </Block>

      <Block title="NativeSelect">
        <NativeSelect defaultValue="24h">
          <NativeSelectOption value="24h">Last 24 Hours</NativeSelectOption>
          <NativeSelectOption value="7d">Last 7 Days</NativeSelectOption>
          <NativeSelectOption value="30d">Last 30 Days</NativeSelectOption>
        </NativeSelect>
      </Block>

      <Block title="Kbd">
        <KbdGroup>
          <Kbd>⌘</Kbd><Kbd>K</Kbd>
        </KbdGroup>
        <span className="text-sm text-muted-foreground">to open the palette</span>
      </Block>

      <Block title="Spinner">
        <Spinner className="size-5" />
        <Spinner className="size-8 text-primary" />
      </Block>

      <Block title="AspectRatio">
        <div className="w-64">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md bg-muted">
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">16 : 9</div>
          </AspectRatio>
        </div>
      </Block>

      <Block title="ScrollArea">
        <ScrollArea className="h-32 w-full rounded-md border border-border p-3">
          <div className="space-y-2 text-sm text-muted-foreground">
            {Array.from({ length: 18 }, (_, i) => <p key={i}>Log line {i + 1} — connection from 10.0.0.{i + 2}</p>)}
          </div>
        </ScrollArea>
      </Block>

      <Block title="Item">
        <Item className="w-full">
          <ItemMedia><Mail className="size-5" /></ItemMedia>
          <ItemContent>
            <ItemTitle>Daily advisory digest</ItemTitle>
            <ItemDescription>Sent every morning at 08:00 UTC.</ItemDescription>
          </ItemContent>
          <ItemActions><Button variant="ghost" size="sm">Edit</Button></ItemActions>
        </Item>
      </Block>

      <Block title="Empty state">
        <Empty className="w-full">
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileText className="size-6" /></EmptyMedia>
            <EmptyTitle>No advisories yet</EmptyTitle>
            <EmptyDescription>Ingested advisories will appear here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent><Button variant="primary" icon={<Plus className="size-4" />}>New advisory</Button></EmptyContent>
        </Empty>
      </Block>

      <Block title="Table (primitive)">
        <Table>
          <TableCaption>Recent detections</TableCaption>
          <TableHeader>
            <TableRow><TableHead>CVE</TableHead><TableHead>CVSS</TableHead><TableHead>Status</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>CVE-2026-0042</TableCell><TableCell>9.8</TableCell><TableCell><Badge variant="destructive">Critical</Badge></TableCell></TableRow>
            <TableRow><TableCell>CVE-2026-1187</TableCell><TableCell>8.1</TableCell><TableCell><Badge variant="secondary">High</Badge></TableCell></TableRow>
          </TableBody>
        </Table>
      </Block>

      <Block title="Calendar">
        <Calendar mode="single" selected={day} onSelect={setDay} className="rounded-md border border-border" />
      </Block>

      <Block title="Tabs (primitive)">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-2 text-sm text-muted-foreground">Overview content.</TabsContent>
          <TabsContent value="activity" className="pt-2 text-sm text-muted-foreground">Activity content.</TabsContent>
          <TabsContent value="settings" className="pt-2 text-sm text-muted-foreground">Settings content.</TabsContent>
        </Tabs>
      </Block>

      <Block title="Sheet (side panel)">
        <Sheet>
          <SheetTrigger asChild><Button variant="outline">Open sheet</Button></SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine the result set.</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button variant="primary">Apply</Button>
              <SheetClose asChild><Button variant="ghost">Close</Button></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Block>

      <Block title="Carousel">
        <Carousel className="w-full max-w-[16rem]">
          <CarouselContent>
            {[1, 2, 3, 4].map((n) => (
              <CarouselItem key={n}>
                <div className="flex h-24 items-center justify-center rounded-md border border-border bg-muted text-2xl font-semibold text-foreground">{n}</div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Block>

      <Block title="Resizable panels">
        <ResizablePanelGroup direction="horizontal" className="h-28 w-full rounded-lg border border-border">
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Left</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Right</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Block>

      <Block title="Chart (recharts primitive)">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={miniChartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="blocked" fill="var(--color-blocked)" radius={4} />
            <Bar dataKey="allowed" fill="var(--color-allowed)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Block>

      <Block title="Combobox (base-ui)">
        <ErrorBoundary fallback={<p className="text-sm text-muted-foreground">Combobox preview unavailable. (Searchable combobox is also shown via UnifiedSelect in the Library view.)</p>}>
          <ComboboxDemo />
        </ErrorBoundary>
      </Block>

      <Toaster />
      <Block title="Sonner toast">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast('Advisory dispatched', { description: 'Sent to 14 recipients' })}>Show toast</Button>
          <Button variant="outline" onClick={() => toast.success('Sweep complete')}>Success</Button>
          <Button variant="danger" onClick={() => toast.error('OpenSearch timeout')}>Error</Button>
        </div>
      </Block>
    </div>
  );
}
