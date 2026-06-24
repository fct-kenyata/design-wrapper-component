import React from 'react';
import { chartColors } from '../../colors';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import EagleEyeLoader from './EagleEyeLoader';

/**
 * ListCardWrapper — ranked list with per-series progress bars. Rebuilt on the
 * shadcn Card primitive + tokens; the per-series accent is data-driven (chart
 * palette) so it stays inline. Public API unchanged.
 */

const toCount = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

export default function ListCardWrapper({
    data = [],
    labelField = 'name',
    valueField = 'value',
    percentField = 'percent',
    total = null,
    itemSuffix = 'items',
    isLoading = false,
    loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    onClick,
}) {
    if (isLoading) {
        return loadingComponent;
    }

    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) {
        return (
            <div className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground">
                {noDataComponent}
            </div>
        );
    }

    const resolvedTotal = toCount(total) > 0
        ? toCount(total)
        : rows.reduce((sum, item) => sum + toCount(item?.[valueField]), 0);

    return (
        <div className="grid gap-3">
            {rows.map((item, idx) => {
                const label = String(item?.[labelField] || 'Unknown').toUpperCase();
                const value = toCount(item?.[valueField]);
                const explicitPercent = Number(item?.[percentField]);
                const percent = Number.isFinite(explicitPercent)
                    ? Math.max(0, Math.min(100, explicitPercent))
                    : (resolvedTotal > 0 ? Math.round((value / resolvedTotal) * 100) : 0);
                const accent = chartColors?.series?.[idx % chartColors.series.length] || 'var(--primary)';

                return (
                    <Card
                        key={`${label}-${idx}`}
                        onClick={onClick ? () => onClick(item) : undefined}
                        className={cn(
                            'ring-0 gap-0 border border-border px-4 py-3',
                            onClick && 'cursor-pointer'
                        )}
                    >
                        <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                            <div className="min-w-0">
                                <div className="mb-1.5 flex items-center gap-2">
                                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                                    <span className="truncate text-sm font-semibold tracking-wide text-foreground">{label}</span>
                                </div>

                                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/15">
                                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: accent }} />
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground">{percent}%</div>
                            </div>

                            <div className="min-w-[62px] text-right">
                                <div className="text-base font-bold leading-tight text-foreground">{value.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">{itemSuffix}</div>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
