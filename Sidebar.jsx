import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";

import {
  Sidebar as SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from "./components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./components/ui/collapsible";

/**
 * Sidebar — collapsible navigation rail, now built on the shadcn/ui Sidebar
 * bedrock (SidebarProvider → Sidebar → SidebarMenu …). Must be rendered inside
 * a <SidebarProvider> with the page content in a sibling <SidebarInset> (the
 * standard shadcn layout). Public API preserved:
 *   { menuItems, bottomMenuItems, logo, onOpenChange, showLogout, onLogout }
 * Each menu item: { icon, title, path?, children?, onClick?, variant?, active? }.
 */

const isExternalLink = (path = "") => /^https?:\/\//i.test(path);

// Wrap leaf content in the correct navigation target (Link / <a> / <button>).
function NavTarget({ item, children, asSub = false }) {
  const Btn = asSub ? SidebarMenuSubButton : SidebarMenuButton;
  const isAction = typeof item.onClick === "function" && !item.path;

  if (isAction) {
    return (
      <Btn
        onClick={item.onClick}
        tooltip={asSub ? undefined : item.title}
        className={item.variant === "danger" ? "text-destructive hover:text-destructive" : undefined}
      >
        {children}
      </Btn>
    );
  }

  const path = item.path || "#";
  const link = isExternalLink(path) ? (
    <a href={path} target="_blank" rel="noreferrer">{children}</a>
  ) : (
    <Link to={path}>{children}</Link>
  );

  return (
    <Btn asChild tooltip={asSub ? undefined : item.title} isActive={item.__active}>
      {link}
    </Btn>
  );
}

function MenuEntry({ item }) {
  const location = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const isAction = typeof item.onClick === "function" && !item.path;

  const childActive = hasChildren && item.children.some((c) => c.path === location.pathname);
  const active =
    item.active ??
    (!isAction && (location.pathname === item.path || childActive));

  if (hasChildren) {
    return (
      <Collapsible asChild defaultOpen={childActive} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} isActive={active}>
              {item.icon}
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children.map((child, i) => (
                <SidebarMenuSubItem key={child.path || child.title || i}>
                  <NavTarget item={{ ...child, __active: location.pathname === child.path }} asSub>
                    {child.icon && <span className="flex size-4 items-center justify-center">{child.icon}</span>}
                    <span>{child.title}</span>
                  </NavTarget>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <NavTarget item={{ ...item, __active: active }}>
        <span className="flex size-4 items-center justify-center">{item.icon || "•"}</span>
        <span>{item.title}</span>
      </NavTarget>
    </SidebarMenuItem>
  );
}

const Sidebar = ({
  menuItems = [],
  bottomMenuItems = [],
  logo,
  title,
  subtitle,
  onOpenChange,
  showLogout = false,
  onLogout,
}) => {
  const { open } = useSidebar();

  // Preserve the legacy onOpenChange contract (host offsets / reacts to state).
  React.useEffect(() => {
    if (typeof onOpenChange === "function") onOpenChange(open);
  }, [open, onOpenChange]);

  const canLogout = showLogout && typeof onLogout === "function";
  const resolvedBottom = [
    ...bottomMenuItems,
    ...(canLogout
      ? [{ title: "Logout", icon: <LogOut className="size-4" />, variant: "danger", onClick: onLogout }]
      : []),
  ];

  return (
    <SidebarRoot collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1">
          {logo && (
            <img
              src={logo}
              alt={title || "logo"}
              className="size-11 shrink-0 rounded-md object-contain transition-[width,height] duration-200 group-data-[collapsible=icon]:size-9"
            />
          )}
          {(title || subtitle) && (
            <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              {title && (
                <span className="truncate text-sm font-semibold text-sidebar-foreground">{title}</span>
              )}
              {subtitle && (
                <span className="truncate text-xs text-sidebar-foreground/70">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, i) => (
                <MenuEntry key={item.path || item.title || i} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {resolvedBottom.length > 0 && (
        <SidebarFooter>
          <SidebarMenu>
            {resolvedBottom.map((item, i) => (
              <MenuEntry key={`bottom-${item.title || i}`} item={item} />
            ))}
          </SidebarMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </SidebarRoot>
  );
};

export default Sidebar;
