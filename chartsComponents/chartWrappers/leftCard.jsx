import React from 'react';
import EagleEyeLoader from './EagleEyeLoader';

/**
 * RiskScoreCardWrapper — large composite risk score with a risk-level pill.
 * Rebuilt on design-system tokens (theme-aware severity vars); the score color
 * is data-driven so it stays inline. Public API unchanged.
 */

const resolveRisk = (score, maxScore) => {
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 0.7) return { label: 'High Risk', color: 'var(--critical)' };
    if (ratio >= 0.4) return { label: 'Medium Risk', color: 'var(--medium)' };
    return { label: 'Low Risk', color: 'var(--low)' };
};

export default function RiskScoreCardWrapper({
    data = [],
    isLoading = false,
    loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    valueField = 'riskScore',
    maxScore = 10,
    title = 'Risk Score',
    height = 300,
    fixedScore,
}) {
    const latest = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null;
    const resolvedValue = typeof fixedScore === 'number' ? fixedScore : Number(latest?.[valueField]);
    const hasScore = Number.isFinite(resolvedValue);
    const resolvedHeight = typeof height === 'number' ? `${height}px` : (height || '300px');

    if (isLoading) {
        return loadingComponent;
    }

    if (!hasScore) {
        return (
            <div className="flex w-full items-center justify-center text-sm text-muted-foreground" style={{ height: resolvedHeight }}>
                {noDataComponent}
            </div>
        );
    }

    const score = Math.max(0, Math.min(resolvedValue, maxScore));
    const risk = resolveRisk(score, maxScore);

    return (
        <div className="flex w-full items-center justify-center" style={{ height: resolvedHeight }}>
            <div className="px-6 py-8 text-center">
                <div className="mb-3 text-sm text-muted-foreground">{title}</div>

                <div className="mb-3 inline-flex items-end gap-1" style={{ color: risk.color }}>
                    <span className="text-6xl font-extrabold leading-none antialiased">{score.toFixed(2)}</span>
                    <span className="text-4xl font-bold leading-none opacity-70 antialiased">/{maxScore}</span>
                </div>

                <div>
                    <span
                        className="inline-block min-w-[140px] rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-wide"
                        style={{
                            color: risk.color,
                            backgroundColor: `color-mix(in oklab, ${risk.color} 16%, transparent)`,
                            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${risk.color} 35%, transparent)`,
                        }}
                    >
                        {risk.label}
                    </span>
                </div>
            </div>
        </div>
    );
}
