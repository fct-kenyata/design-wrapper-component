import React from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import EagleEyeLoader from './EagleEyeLoader';

/**
 * ThreatListCardWrapper — titled card with a ranked list + signal-strength
 * bars. Rebuilt on the shadcn Card primitive + tokens. Public API unchanged.
 */

const toRows = (items = []) => (Array.isArray(items)
    ? items.map((item, index) => {
        if (typeof item === 'string') {
            return { id: `${item}-${index}`, name: item, subtitle: '', rank: index + 1, signal: Math.min(5, Math.max(2, index + 2)) };
        }
        return {
            id: item?.id ?? `${item?.name ?? item?.label ?? 'item'}-${index}`,
            name: String(item?.name ?? item?.label ?? 'Unknown'),
            subtitle: String(item?.subtitle ?? ''),
            rank: Number(item?.rank) || (index + 1),
            signal: Number(item?.signal) || Math.min(5, Math.max(2, index + 2)),
            raw: item,
        };
    })
    : []);

export default function ThreatListCardWrapper({
    title = 'Top Malwares',
    icon = '🦠',
    items = [],
    subtitleFallback = 'Detected malware',
    maxItems = 5,
    isLoading = false,
    loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    onItemClick,
}) {
    if (isLoading) {
        return loadingComponent;
    }

    const rows = toRows(items).slice(0, maxItems);

    if (!rows.length) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground">{noDataComponent}</div>
        );
    }

    return (
        <Card className="ring-0 gap-4 border border-border p-5">
            <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-sm leading-none">{icon}</span>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
            </div>

            <div className="grid gap-2">
                {rows.map((row, idx) => {
                    const signalBars = Math.min(5, Math.max(1, Number(row?.signal) || 1));
                    return (
                        <div
                            key={row.id}
                            onClick={onItemClick ? () => onItemClick(row.raw || row) : undefined}
                            className={cn(
                                'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5',
                                onItemClick && 'cursor-pointer hover:bg-muted/70'
                            )}
                        >
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                                {row.rank || idx + 1}
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground">{row.name}</div>
                                <div className="truncate text-xs text-muted-foreground">{row.subtitle || subtitleFallback}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-end gap-1">
                                    {Array.from({ length: signalBars }).map((_, i) => (
                                        <span key={`sig-${row.id}-${i}`} className="w-1.5 rounded-full bg-primary" style={{ height: 12 + (i % 2) * 4 }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
