// main-topbar.jsx
"use client";
import React from "react";
import { LiveClock } from "./liveclick";

/**
 * MainTopbar — page header with title, breadcrumbs, optional slots, and a live
 * clock. Re-skinned onto the shadcn token system (bg-background, text-primary,
 * border-border) — no more colors.js / inline theme styles. Public API and
 * breadcrumb logic unchanged.
 */

// ── Path helpers (pure) ──────────────────────────────────────────────
const normalizePath = (p) => {
  const trimmed = (p || "/").replace(/\/+$/, "");
  return (trimmed || "/").toLowerCase();
};

const toLabel = (segment) => {
  const name = segment.replace(/-/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const getDashboardName = (p, labels) => {
  const norm = normalizePath(p);
  if (labels[norm]) return labels[norm];
  const parts = norm.split("/").filter(Boolean);
  return parts.length === 0 ? "Home" : toLabel(parts[parts.length - 1]);
};

const getBreadcrumbs = (p, labels) => {
  const norm = normalizePath(p);
  if (norm === "/" || norm === "/home") return ["Home"];
  if (labels[norm]) return ["Home", labels[norm]];
  const parts = norm.split("/").filter(Boolean).map(toLabel);
  return ["Home", ...parts.filter((part, i, arr) => part !== arr[i - 1])];
};

// ── Component ─────────────────────────────────────────────────────────
export const MainTopbar = ({
  routeLabels = {},
  pathname,
  leftContent,
  rightContent,
  slots = [],
  style,
  className,
}) => {
  // Resolve pathname: prop → window (CSR fallback) → '/'
  const resolvedPath =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");

  const dashboardName = getDashboardName(resolvedPath, routeLabels);
  const visibleBreadcrumbs = getBreadcrumbs(resolvedPath, routeLabels).filter(
    (crumb, i, arr) => i === 0 || crumb !== arr[i - 1]
  );

  const leftSlots = slots.filter((s) => s.placement !== "right");
  const rightSlots = slots.filter((s) => s.placement === "right");

  return (
    <div
      className={`w-full border-b border-border bg-background px-6 py-4 ${
        className ?? ""
      }`}
      style={style}
    >
      <div className="flex items-center justify-between gap-4">
        {/* LEFT: Title › Breadcrumbs › leftContent › left slots */}
        <div className="flex min-w-0 items-center gap-8">
          <div className="flex min-w-0 flex-col">
            <h1 className="m-0 text-2xl font-bold tracking-tight text-primary">
              {dashboardName === "Home" ? "Home" : `${dashboardName} `}
            </h1>

            <div
              className="mt-1 flex min-h-[18px] items-center gap-2"
              style={{
                visibility: visibleBreadcrumbs.length > 1 ? "visible" : "hidden",
              }}
            >
              {visibleBreadcrumbs.map((crumb, i, arr) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`text-[13px] font-medium tracking-wide ${
                      i === arr.length - 1
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {crumb}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-xs text-muted-foreground">›</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {leftContent && (
            <div className="flex flex-shrink-0 items-center gap-3">
              {leftContent}
            </div>
          )}

          {leftSlots.map((s) => (
            <div key={s.key} className="flex flex-shrink-0 items-center gap-3">
              {s.node}
            </div>
          ))}
        </div>

        {/* RIGHT: right slots › rightContent › Pulse + Clock */}
        <div className="flex flex-shrink-0 items-center gap-4">
          {rightSlots.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              {s.node}
            </div>
          ))}

          {rightContent && (
            <div className="flex items-center gap-3">{rightContent}</div>
          )}

          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-primary" />
            <LiveClock />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainTopbar;
