'use client';

import React from 'react';
import { cn } from './lib/utils';

/**
 * NoGraphData — empty state for charts/graphs, now token-driven (no external
 * color/typography imports). Public API unchanged: icon, iconColor (CSS color,
 * defaults to the primary token), title, subtitle, height (Tailwind class).
 */
export function NoGraphData({
  icon,
  iconColor = 'var(--primary)',
  title = 'No data available',
  subtitle = 'Data will appear once records are processed',
  height = 'h-56',
}) {
  return (
    <div
      className={cn(
        height,
        'flex flex-col items-center justify-center rounded-lg border border-border bg-muted/40'
      )}
    >
      {icon && (
        <div
          className="mb-3 flex size-12 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: `color-mix(in oklab, ${iconColor} 12%, transparent)`,
            borderColor: `color-mix(in oklab, ${iconColor} 25%, transparent)`,
          }}
        >
          {React.cloneElement(icon, {
            className: 'h-6 w-6',
            style: { color: iconColor },
          })}
        </div>
      )}

      <p className="mb-1 text-center text-sm font-medium text-muted-foreground">
        {title}
      </p>
      <p className="px-4 text-center text-xs text-muted-foreground/70">
        {subtitle}
      </p>
    </div>
  );
}

export default NoGraphData;
