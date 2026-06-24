import React from 'react';
import { Card } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import EagleEyeLoader from './EagleEyeLoader';

/**
 * TopCard — single metric tile (value + label + accent icon).
 * Rebuilt on the shadcn Card primitive + design-system tokens. Public API
 * unchanged: { value, title, icon, height, isLoading, loadingComponent,
 * noDataComponent, onClick }.
 */

const DefaultSearchIcon = ({ className }) => (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
        <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function TopCard({
    value = 0,
    title = 'Total IOCs Swept',
    icon = null,
    height = 130,
    isLoading = false,
    loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    onClick,
}) {
    if (isLoading) {
        return loadingComponent;
    }

    const parsedValue = Number(value);
    const hasValue = Number.isFinite(parsedValue);
    const resolvedHeight = typeof height === 'number' ? `${height}px` : (height || '130px');

    if (!hasValue) {
        return (
            <Card
                style={{ height: resolvedHeight }}
                className="ring-0 flex w-full items-center justify-center border border-border py-0 text-sm text-muted-foreground"
            >
                {noDataComponent}
            </Card>
        );
    }

    return (
        <Card
            onClick={onClick}
            style={{ height: resolvedHeight }}
            className={cn(
                'ring-0 w-full flex-row items-center justify-between gap-3 border border-border px-5 py-0 transition-transform duration-200',
                onClick && 'cursor-pointer hover:-translate-y-0.5'
            )}
        >
            <div className="flex flex-col gap-1">
                <span className="text-3xl font-extrabold leading-none text-primary">{parsedValue}</span>
                <span className="text-sm text-muted-foreground">{title}</span>
            </div>

            <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary">
                {icon || <DefaultSearchIcon className="size-5" />}
            </div>
        </Card>
    );
}
