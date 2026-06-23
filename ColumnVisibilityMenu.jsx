import React from "react";
import { Columns3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { cn } from "./lib/utils";

/**
 * ColumnVisibilityMenu — show/hide table columns, now built on the shadcn
 * DropdownMenu primitive. Public API unchanged:
 *   columns [{ id, label }], hidden (Set|array), onChange(Set), minVisible,
 *   label, align ("left" | "right"), className, style.
 */

const toSet = (v) => (v instanceof Set ? new Set(v) : new Set(v || []));

const ColumnVisibilityMenu = ({
  columns = [],
  hidden,
  onChange,
  minVisible = 1,
  label = "Columns",
  align = "right",
  className = "",
  style,
}) => {
  const hiddenSet = toSet(hidden);
  const total = columns.length;
  const visibleCnt = total - hiddenSet.size;
  const anyHidden = hiddenSet.size > 0;

  const toggle = (id) => {
    const next = new Set(hiddenSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange?.(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", className)}
          style={style}
          title="Show / hide columns"
        >
          <Columns3 className="size-3.5" />
          {label}
          {anyHidden && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4 min-w-4 justify-center px-1 text-[10px]"
            >
              {visibleCnt}/{total}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align === "left" ? "start" : "end"} className="w-56">
        <div className="flex items-center justify-between gap-2 pr-1">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <Button
            variant="link"
            size="sm"
            disabled={!anyHidden}
            onClick={() => onChange?.(new Set())}
            className="h-auto p-0 text-xs"
          >
            Show all
          </Button>
        </div>
        <DropdownMenuSeparator />
        {columns.map((col) => {
          const visible = !hiddenSet.has(col.id);
          const isOnlyVisible = visible && visibleCnt <= minVisible;
          return (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={visible}
              disabled={isOnlyVisible}
              onCheckedChange={() => toggle(col.id)}
              onSelect={(e) => e.preventDefault()}
            >
              {col.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnVisibilityMenu;
