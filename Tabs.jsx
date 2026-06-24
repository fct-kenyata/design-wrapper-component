/**
 * Tabs — centralized controlled tab bar, now built on the shadcn/ui Tabs
 * primitive. Public API unchanged.
 *
 * Props
 * ─────
 *   items      – { key, label, count?, icon?, disabled? }[]
 *   value      – currently active tab key (controlled)
 *   onChange   – (key) => void
 *   size       – "sm" | "md" (default: "md")
 *   fullWidth  – stretch tabs to fill the container (default: false)
 *   className  – passed to the TabsList
 *   style      – inline overrides on the TabsList
 */

import React from "react";
import PropTypes from "prop-types";
import { Tabs as UITabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { cn } from "./lib/utils";

const Tabs = ({
  items = [],
  value,
  onChange,
  size = "md",
  fullWidth = false,
  className = "",
  style,
}) => {
  return (
    <UITabs
      value={value != null ? String(value) : undefined}
      onValueChange={(key) => onChange?.(key)}
    >
      <TabsList
        className={cn(fullWidth && "w-full", size === "sm" && "h-8", className)}
        style={style}
      >
        {items.map((t) => (
          <TabsTrigger
            key={t.key}
            value={String(t.key)}
            disabled={!!t.disabled}
            className={cn(
              fullWidth && "flex-1",
              size === "sm" && "text-xs"
            )}
          >
            {t.icon && (
              <span className="inline-flex items-center">{t.icon}</span>
            )}
            {t.label}
            {t.count != null && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 justify-center px-1.5 text-[10px]"
              >
                {t.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </UITabs>
  );
};

Tabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      icon: PropTypes.node,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  size: PropTypes.oneOf(["sm", "md"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Tabs;
