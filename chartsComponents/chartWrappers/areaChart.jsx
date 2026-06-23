import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import sidebarColors, { chartColors } from '../../colors';
import EagleEyeLoader from './EagleEyeLoader';

// Reuse your helpers
const withAlpha = (hex, alpha) => {
    if (typeof hex !== 'string') return hex;
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const normalized = hex.replace('#', '');
    const full = normalized.length === 3
        ? normalized.split('').map((ch) => `${ch}${ch}`).join('')
        : normalized;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AreaChartWrapper({
    data = [],
    isLoading = false,
    loadingComponent = <EagleEyeLoader />,
    noDataComponent = 'No data available',
    xAxisField = 'timestamp',
    yAxisFields = null,
    colorMap = {},
    height = 400,
    onClick,
}) {
    const containerRef = useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setReady(width > 0 && height > 0);
        });

        observer.observe(el);
        setReady(el.clientWidth > 0 && el.clientHeight > 0);

        return () => observer.disconnect();
    }, []);

    const hasData = Array.isArray(data) && data.length > 0;

    const categories = hasData ? data.map(d => d[xAxisField]) : [];

    const detectedFields = hasData
        ? Object.keys(data[0]).filter(k => k !== xAxisField)
        : [];

    const seriesFields = yAxisFields?.length ? yAxisFields : detectedFields;

    const series = seriesFields.map((field, index) => {
        const color = colorMap[field] || chartColors.series[index % chartColors.series.length];

        return {
            name: field,
            type: 'line',
            smooth: true,
            showSymbol: false,

            data: data.map(d => Number(d[field]) || 0),

            lineStyle: {
                width: 2,
                color,
            },

            // 🔥 KEY: AREA STYLE
            areaStyle: {
                opacity: 0.5,
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        { offset: 0, color: withAlpha(color, 0.6) },
                        { offset: 1, color: withAlpha(color, 0.05) },
                    ],
                },
            },
        };
    });

    const option = {
        backgroundColor: 'transparent',

        tooltip: { trigger: 'axis' },

        xAxis: {
            type: 'category',
            data: categories,
        },

        yAxis: {
            type: 'value',
        },

        series,
    };

    const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <div ref={containerRef} style={{ width: '100%', height: resolvedHeight }}>
            {isLoading ? (
                loadingComponent
            ) : hasData ? (
                ready && (
                    <ReactECharts
                        option={option}
                        style={{ width: '100%', height: '100%' }}
                        onEvents={onClick ? { click: onClick } : {}}
                    />
                )
            ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                    {noDataComponent}
                </div>
            )}
        </div>
    );
}