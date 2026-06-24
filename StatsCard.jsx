/**
 * StatsCard — centralized metric card, now built on the shadcn Card primitive
 * and design-system tokens (severity scale: critical/high/medium/low). The
 * accent color is injected as a CSS variable (--sc-accent) so a variant token
 * OR an explicit `color` prop both work. Public API unchanged.
 *
 * Layouts: card (default) | inline · shape: default | compact
 * Variants: critical | high | medium | low | info | primary | success |
 *           warning | default   (or pass an explicit `color`)
 */

import React, { useState } from 'react';
import { Card } from './components/ui/card';
import { cn } from './lib/utils';

// variant → design-system token (CSS variable reference)
const VARIANT_TOKEN = {
  critical: 'var(--critical)',
  high: 'var(--high)',
  medium: 'var(--medium)',
  low: 'var(--primary)', // historically blue
  info: 'var(--chart-2)',
  primary: 'var(--primary)',
  success: 'var(--low)', // the green token
  warning: 'var(--medium)',
  default: 'var(--primary)',
};

const METRIC_SIZE = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-5xl',
};

const TREND_GLYPH = { up: '↑', down: '↓', flat: '→' };

export default function StatsCard({
  title,
  value,
  icon: Icon,
  variant,
  color: colorProp,
  layout: cardLayout = 'card',
  shape = 'default',
  accentBar = true,
  trend,
  onClick,
  style,
  size = 'md',
}) {
  const [hovered, setHovered] = useState(false);

  const accent =
    colorProp || (variant && VARIANT_TOKEN[variant]) || 'var(--primary)';
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : value ?? '—';
  const isClickable = Boolean(onClick);
  const metricFont = METRIC_SIZE[size] || METRIC_SIZE.md;
  const accentVar = { '--sc-accent': accent, ...style };

  const hoverHandlers = isClickable
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        onClick,
      }
    : {};

  // ─── compact: [ label | value ] row ───────────────────────────────
  if (shape === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2',
          isClickable && 'cursor-pointer'
        )}
        style={accentVar}
        {...hoverHandlers}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="text-2xl font-bold tabular-nums text-[var(--sc-accent)]">
          {formattedValue}
        </span>
      </div>
    );
  }

  // ─── inline: centered value + label, no border ────────────────────
  if (cardLayout === 'inline') {
    return (
      <div
        className={cn('p-5 text-center', isClickable && 'cursor-pointer')}
        style={accentVar}
        {...hoverHandlers}
      >
        <div
          className={cn(
            'mb-1 font-bold tabular-nums text-[var(--sc-accent)]',
            metricFont
          )}
        >
          {formattedValue}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
      </div>
    );
  }

  // ─── card layout ──────────────────────────────────────────────────
  return (
    <Card
      className={cn(
        'relative items-center gap-0 overflow-hidden p-6 text-center transition-all',
        isClickable && 'cursor-pointer hover:-translate-y-0.5',
        hovered && isClickable && 'border-[color:var(--sc-accent)]'
      )}
      style={accentVar}
      {...hoverHandlers}
    >
      {Icon && (
        <div
          className="mb-3 flex size-12 items-center justify-center rounded-lg border transition-transform"
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--sc-accent) 8%, transparent)',
            borderColor:
              'color-mix(in oklab, var(--sc-accent) 20%, transparent)',
            transform: hovered && isClickable ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          <Icon className="size-6 text-[var(--sc-accent)]" strokeWidth={2} />
        </div>
      )}

      <div className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>

      <div className={cn('font-bold tabular-nums text-foreground', metricFont)}>
        {formattedValue}
      </div>

      {trend && (
        <div
          className={cn(
            'mt-1 text-xs',
            trend.direction === 'up' && 'text-high',
            trend.direction === 'down' && 'text-low',
            trend.direction === 'flat' && 'text-muted-foreground'
          )}
        >
          {TREND_GLYPH[trend.direction] ?? '→'} {trend.percent}%
        </div>
      )}

      {accentBar && (
        <div
          className="absolute inset-x-0 bottom-0 bg-[var(--sc-accent)] opacity-60 transition-all"
          style={{ height: hovered && isClickable ? 4 : 2 }}
        />
      )}
    </Card>
  );
}
