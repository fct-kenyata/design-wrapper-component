import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import sidebarColors, { chartColors, fontStyles } from '../../colors';
import { spacing } from '../../spacing';
// import EagleEyeLoader from '../../../src/components/utility/EagleEyeLoader';

const withAlpha = (hex, alpha) => {
    if (typeof hex !== 'string') return hex;
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const normalized = hex.replace('#', '');
    if (![3, 6].includes(normalized.length)) return hex;
    const full = normalized.length === 3
        ? normalized.split('').map((ch) => `${ch}${ch}`).join('')
        : normalized;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
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

const chartTokens = {
    tooltipPadY: px(spacing.xs, 4),
    tooltipPadX: px(spacing.sm, 8),
    legendGap: px(spacing.lg, 16),
};

export function NightingaleChartWrapper({
    data = [],
    isLoading = false,
    // loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    labelField = 'name',
    valueField = 'value',
    colorField = 'color',
    colorMap = {},
    colors = [],
    height = 380,
    showLegend = true,
    showToolbox = true,
    radiusInner = 30,
    radiusOuter = '72%',
    name = 'Nightingale Chart',
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

    const hasData = Array.isArray(data) && data.length > 0;

    if (!hasData) {
        return isLoading ? loadingComponent : (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height,
                    color: sidebarColors.textSecondary,
                    ...fontStyles.body,
                }}
            >
                {noDataComponent}
            </div>
        );
    }

    const themeSeriesColors =
        Array.isArray(chartColors?.series) && chartColors.series.length > 0
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

        const sliceColor =
            item?.[colorField] ||
            colorMap?.[label] ||
            colors[index] ||
            themeSeriesColors[index % themeSeriesColors.length] ||
            sidebarColors.primary;

        return {
            name: label,
            value: Number.isFinite(value) ? value : 0,
            itemStyle: { color: sliceColor, borderRadius: 8, borderColor: sidebarColors.background, borderWidth: 2 },
            raw: item,
        };
    });

    const option = {
        backgroundColor: 'transparent',
        animationDuration: 700,
        animationEasing: 'cubicOut',
        animationDurationUpdate: 450,
        tooltip: {
            trigger: 'item',
            confine: true,
            backgroundColor: chartColors.ui.tooltip,
            borderColor: chartColors.ui.tooltipBorder,
            borderWidth: 1,
            extraCssText: `border-radius:8px;box-shadow:0 10px 26px ${withAlpha(sidebarColors.background, 0.55)};white-space:nowrap;`,
            textStyle: { color: chartColors.ui.text, ...fontStyles.bodySmall },
            formatter: (param) => {
                const n = String(param?.name ?? 'Unknown');
                const v = Number.isFinite(param?.value) ? Number(param.value).toLocaleString() : '0';
                const pv = Number(param?.percent);
                const pct = Number.isFinite(pv)
                    ? `${Number.isInteger(pv) ? pv : pv.toFixed(1)}%`
                    : '-';
                return `<div style="padding:${chartTokens.tooltipPadY + 2}px ${chartTokens.tooltipPadX + 4}px;font-weight:${fontStyles.heading6?.fontWeight || 700};line-height:1.5;color:${chartColors.ui.text};">${n}: <b>${v}</b> (${pct})</div>`;
            },
        },
        legend: showLegend
            ? {
                  type: 'scroll',
                  top: 'bottom',
                  left: 'center',
                  orient: 'horizontal',
                  textStyle: { color: chartColors.ui.text, ...fontStyles.bodySmall },
                  pageTextStyle: { color: sidebarColors.textSecondary },
                  pageIconColor: sidebarColors.primary,
                  pageIconInactiveColor: sidebarColors.textMuted,
                  itemGap: chartTokens.legendGap,
              }
            : { show: false },
        toolbox: showToolbox
            ? {
                  show: true,
                  orient: 'vertical',
                  right: 8,
                  top: 'center',
                  iconStyle: {
                      borderColor: sidebarColors.textSecondary,
                      borderWidth: 1,
                  },
                  emphasis: {
                      iconStyle: { borderColor: sidebarColors.primary },
                  },
                  feature: {
                      mark: { show: true },
                      dataView: {
                          show: true,
                          readOnly: false,
                          textareaColor: sidebarColors.backgroundSoft,
                          textColor: chartColors.ui.text,
                          buttonColor: sidebarColors.primary,
                      },
                      restore: { show: true },
                      saveAsImage: { show: true },
                  },
              }
            : { show: false },
        series: [
            {
                name,
                type: 'pie',
                radius: [radiusInner, radiusOuter],
                center: ['50%', '48%'],
                roseType: 'area',
                itemStyle: { borderRadius: 8, borderColor: sidebarColors.background, borderWidth: 2 },
                label: {
                    show: true,
                    color: sidebarColors.textSecondary,
                    ...fontStyles.bodySmall,
                    formatter: '{b}',
                },
                labelLine: {
                    lineStyle: { color: withAlpha(sidebarColors.textSecondary, 0.5) },
                    smooth: 0.2,
                    length: 10,
                    length2: 20,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: withAlpha(sidebarColors.primary, 0.4),
                    },
                },
                data: normalizedData,
            },
        ],
    };

    return (
        <div ref={containerRef} style={{ width: '100%', height }}>
            {ready && (
                <ReactECharts
                    option={option}
                    style={{ width: '100%', height: '100%' }}
                    notMerge
                    lazyUpdate={false}
                    onEvents={onClick ? { click: (params) => onClick(params?.data?.raw ?? params?.data) } : {}}
                />
            )}
        </div>
    );
}
