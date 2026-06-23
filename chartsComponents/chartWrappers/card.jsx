import React from 'react';
import sidebarColors, { chartColors } from '../../colors';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import CardStructureLoader from '../../skeleton/card_structure_loader';

/**
 * CardWrapper — responsive grid of metric cards with a data-driven accent
 * underline (severity / variant). Rebuilt on the shadcn Card primitive; the
 * accent color stays inline because it is data-driven. Public API unchanged:
 * { cards, children, isLoading, loadingComponent, noDataComponent, onClick }.
 */

// Theme-aware severity tokens (defined in design-system.css), so the accent
// follows light/dark instead of a frozen load-time hex.
const SEVERITY_VARS = {
    critical: 'var(--critical)',
    high: 'var(--high)',
    medium: 'var(--medium)',
    low: 'var(--low)',
};

function resolveBottomColor(card) {
    const key = card?.bottomColor || card?.variant;
    if (key && SEVERITY_VARS[key]) return SEVERITY_VARS[key];
    return (
        chartColors?.severity?.[key]
        || sidebarColors?.[key]
        || sidebarColors.primary
    );
}

export default function CardWrapper({
    cards = [],
    children = null,
    isLoading = false,
    loadingComponent = <CardStructureLoader />,
    noDataComponent = 'No data available',
    onClick,
}) {
    const hasDynamicCards = Array.isArray(cards) && cards.length > 0;

    if (isLoading) {
        return <CardStructureLoader count={hasDynamicCards ? cards.length : 0} minCardWidth="180px" />;
    }

    return (
        <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
        >
            {hasDynamicCards ? (
                cards.map((card) => (
                    <Card
                        key={card.id}
                        onClick={onClick ? () => onClick(card) : undefined}
                        style={{ borderBottom: `4px solid ${resolveBottomColor(card)}` }}
                        className={cn(
                            'ring-0 items-center gap-2 border border-border px-4 py-5 text-center transition-transform duration-200',
                            onClick && 'cursor-pointer hover:-translate-y-0.5'
                        )}
                    >
                        <div className="text-sm text-muted-foreground">{card.title}</div>
                        <div className="text-2xl font-bold text-foreground">{card.value}</div>
                    </Card>
                ))
            ) : (
                children || <div className="text-sm text-muted-foreground">{noDataComponent}</div>
            )}
        </div>
    );
}
