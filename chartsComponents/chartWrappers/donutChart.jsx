import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import sidebarColors, { chartColors, fontStyles } from '../../colors';
import { spacing } from '../../spacing';
import EagleEyeLoader from './EagleEyeLoader';;

const withAlpha = (hex, alpha) => {
    if (typeof hex !== 'string') return hex;
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const normalized = hex.replace('#', '');
    if (![3, 6].includes(normalized.length)) return hex;
    const full = normalized.length === 3
        ? normalized.split('').map((ch) => `${ch}${ch}`).join('')
        : normalized;
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const px = (value, fallback = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.endsWith('px')) {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
};

const tokens = {
    tooltipPadY: px(spacing.xs, 4),
    tooltipPadX: px(spacing.sm, 8),
    legendGap: px(spacing.lg, 16),
    legendItem: px(spacing.sm, 8),
    chartTop: px(spacing.md, 12),
    chartBottom: px(spacing['6xl'], 64),
};

export default function DonutChartWrapper({
    data = [],
    children = null,
    isLoading = false,
    loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    labelField = 'name',
    valueField = 'value',
    colorField = 'color',
    colorMap = {},
    colors = [],
    height = 400,
    radiusInner = '48%',
    radiusOuter = '78%',
    showLegend = true,
    onClick,
}) {
    const containerRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            const el = containerRef.current;
            setReady(Boolean(el && el.clientWidth > 0 && el.clientHeight > 0));
        };

        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    const hasData = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object';

    if (!hasData) {
        return isLoading ? loadingComponent : (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: sidebarColors.textSecondary,
                    ...fontStyles.body,
                }}
            >
                {noDataComponent}
            </div>
        );
    }

    const themeSeriesColors = Array.isArray(chartColors?.series) && chartColors.series.length > 0
        ? chartColors.series
        : [
            sidebarColors.primary,
            sidebarColors.accent,
            sidebarColors.warning,
            sidebarColors.danger,
            sidebarColors.success,
            sidebarColors.info,
        ].filter(Boolean);

    const normalizedData = data.map((item, index) => {
        const rawLabel = item?.[labelField] ?? item?.name ?? item?.label ?? `Slice ${index + 1}`;
        const label = typeof rawLabel === 'string' ? rawLabel : String(rawLabel);

        const rawValue = item?.[valueField] ?? item?.value ?? 0;
        const value = Number(rawValue);

        const sliceColor = item?.[colorField]
            || colorMap?.[label]
            || colors[index]
            || themeSeriesColors[index % themeSeriesColors.length]
            || sidebarColors.primary;

        return {
            name: label,
            value: Number.isFinite(value) ? value : 0,
            itemStyle: {
                color: sliceColor,
            },
            raw: item,
        };
    });

    const option = {
        backgroundColor: 'transparent',
        animationDuration: 650,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 420,
        tooltip: {
            trigger: 'item',
            confine: true,
            backgroundColor: chartColors.ui.tooltip,
            borderColor: chartColors.ui.tooltipBorder,
            borderWidth: 1,
            extraCssText: `border-radius:8px;box-shadow:0 10px 26px ${withAlpha(sidebarColors.background, 0.55)};white-space:nowrap;`,
            textStyle: { color: chartColors.ui.text, ...fontStyles.bodySmall },
            formatter: (param) => {
                const name = String(param?.name ?? 'Unknown');
                const value = Number.isFinite(param?.value) ? Number(param.value).toLocaleString() : '0';
                const percentValue = Number(param?.percent);
                const percentage = Number.isFinite(percentValue)
                    ? (Number.isInteger(percentValue)
                        ? `${percentValue}%`
                        : `${percentValue.toFixed(2).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}%`)
                    : '-';

                return `<div style="padding:${tokens.tooltipPadY + 2}px ${tokens.tooltipPadX + 4}px;font-weight:${fontStyles.heading6?.fontWeight || 700};line-height:1.2;color:${chartColors.ui.text};">
                    ${name}: ${value} (${percentage})
                </div>`;
            },
        },
        legend: {
            show: showLegend,
            type: 'scroll',   // 👈 THIS enables scroll
            bottom: 0,
            left: 'center',
            orient: 'horizontal',

            textStyle: {
                color: chartColors.ui.text,
                ...fontStyles.bodySmall,
            },

            itemGap: tokens.legendGap,
            itemWidth: tokens.legendItem,
            itemHeight: tokens.legendItem,
            icon: 'circle',

            // optional improvements 👇
            pageIconColor: sidebarColors.primary,
            pageIconInactiveColor: sidebarColors.textSecondary,
            pageTextStyle: {
                color: sidebarColors.textSecondary,
            },
            pageButtonItemGap: 6,
            pageButtonGap: 12,
        },
        series: [
            {
                type: 'pie',
                radius: [radiusInner, radiusOuter],
                center: ['50%', '44%'],
                avoidLabelOverlap: true,
                minAngle: 2,
                hoverAnimation: true,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: sidebarColors.background,
                    borderWidth: 2,
                    shadowBlur: 12,
                    shadowColor: withAlpha(sidebarColors.background, 0.5),
                    shadowOffsetY: 3,
                },
                label: {
                    show: true,
                    color: chartColors.ui.text,
                    ...fontStyles.bodySmall,
                    formatter: '{b}',
                },
                labelLine: {
                    show: true,
                    lineStyle: { color: chartColors.ui.axis },
                },
                emphasis: {
                    focus: 'self',
                    scale: true,
                    scaleSize: 14,
                    itemStyle: {
                        borderColor: '#21d4ff',
                        borderWidth: 3,
                        shadowBlur: 28,
                        shadowColor: withAlpha('#21d4ff', 0.6),
                        opacity: 1,
                    },
                    label: {
                        show: true,
                        color: '#ffffff',
                        ...fontStyles.body,
                        fontWeight: 700,
                    },
                },
                data: normalizedData,
            },
        ],
        grid: {
            top: tokens.chartTop,
            bottom: tokens.chartBottom,
        },
    };

    const chartContent = children || (
        ready && (
            <ReactECharts
                option={option}
                style={{ width: '100%', height: '100%' }}
                onEvents={onClick ? { click: onClick } : {}}
            />
        )
    );

    const resolvedHeight = typeof height === 'number' ? `${height}px` : (height || '400px');

    return (
        <div ref={containerRef} style={{ width: '100%', height: resolvedHeight, minHeight: 180 }}>
            {isLoading ? loadingComponent : chartContent}
        </div>
    );
}
