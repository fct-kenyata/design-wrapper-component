import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import worldMap from '../map/world.json';
import sidebarColors, { chartColors, fontStyles } from '../../colors';
import { spacing } from '../../spacing';
import EagleEyeLoader from './EagleEyeLoader';
echarts.registerMap('world', worldMap);

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

export default function GeoLocationMapWrapper({
    locations = [],
    publicLocations = null,    // preferred: explicit public array from backend
    privateLocations = null,   // preferred: explicit private/internal array from backend
    flows = [],
    logEntries = [],
    summary = {},
    isLoading = false,
    error = null,
    rangeText = '',
    onClickCountry,
    loadingComponent = <EagleEyeLoader size={80} text="Loading map" theme="dark" />,
    noDataComponent = 'No geolocation data available',
    height = 600,
    showSummary = true,
    showFlowList = true,
    showRecentLogs = true,
}) {
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');

    // ── Theme-derived tokens ─────────────────────────────────────────────
    const accent = sidebarColors.accent || sidebarColors.primary;
    const primary = sidebarColors.primary;
    const flowColor = chartColors.severity.critical;
    const flowHighlight = chartColors.severity.high;
    const threatColor = chartColors.severity.medium;
    const threatHighColor = chartColors.severity.high;
    const infoColor = chartColors.severity.info || chartColors.severity.low;

    const panelBorder = withAlpha(sidebarColors.border, 0.6);
    const panelBg = withAlpha(sidebarColors.backgroundSoft, 0.82);
    const panelSoftBg = withAlpha(sidebarColors.surface, 0.7);
    const tileBorder = withAlpha(sidebarColors.primary, 0.22);
    const tileBg = withAlpha(sidebarColors.backgroundSoft, 0.72);

    // ── Public threat-intel points ────────────────────────────────────────
    // Use publicLocations[] when the new backend supplies it (no _isPrivate
    // entries, coords already guaranteed to be for public IPs).
    // Fall back to filtering !_isPrivate from the legacy locations[] prop so
    // the component stays compatible with backends that don't split arrays yet.
    const points = useMemo(() => {
        const source = Array.isArray(publicLocations)
            ? publicLocations
            : (Array.isArray(locations) ? locations : []).filter((loc) => !loc._isPrivate);
        return source
            .filter((loc) => loc.latitude != null && loc.longitude != null)
            .map((loc) => ({
                name: loc.country,
                value: [loc.longitude, loc.latitude, loc.totalCount || 0],
                sourceCount: loc.sourceCount || 0,
                destCount: loc.destCount || 0,
                cities: loc.cities || [],
                ips: loc.ips || [],
            }));
    }, [locations, publicLocations]);

    // ── Private / internal network points ────────────────────────────────
    // Use privateLocations[] when provided; otherwise filter locations[].
    // Entries with null coords are excluded — they cannot be plotted, but
    // their existence is still detected by hasAnyPrivateData below.
    const privatePoints = useMemo(() => {
        const source = Array.isArray(privateLocations)
            ? privateLocations
            : (Array.isArray(locations) ? locations : []).filter((loc) => loc._isPrivate === true);
        return source
            .filter((loc) => loc.latitude != null && loc.longitude != null)
            .map((loc) => ({
                name: loc.country,
                value: [loc.longitude, loc.latitude, loc.totalCount || 0],
                sourceCount: loc.sourceCount || 0,
                destCount: loc.destCount || 0,
                cities: loc.cities || [],
                ips: loc.ips || [],
            }));
    }, [locations, privateLocations]);

    const lines = useMemo(() => (
        (Array.isArray(flows) ? flows : [])
            .filter((flow) =>
                flow.sourceCoords?.lat != null && flow.sourceCoords?.lon != null
                && flow.destCoords?.lat != null && flow.destCoords?.lon != null
                && flow.source !== flow.destination
            )
            .slice(0, 20)
            .map((flow) => {
                const sourceCoord = [flow.sourceCoords.lon, flow.sourceCoords.lat];
                const destCoord = [flow.destCoords.lon, flow.destCoords.lat];
                const lonDelta = Math.abs(flow.sourceCoords.lon - flow.destCoords.lon);
                const latDelta = Math.abs(flow.sourceCoords.lat - flow.destCoords.lat);
                const geoDistance = Math.hypot(lonDelta, latDelta);
                const curveness = Math.max(0.12, Math.min(0.34, geoDistance / 220));

                return {
                    fromName: flow.source,
                    toName: flow.destination,
                    sourceCoord,
                    destCoord,
                    coords: [sourceCoord, destCoord],
                    count: flow.count,
                    curve: curveness,
                    severity: flow.severity || {},
                };
            })
    ), [flows]);

    const flowVisuals = useMemo(() => (
        lines.map((flow) => {
            const count = flow.count || 0;

            if (count > 50) {
                return {
                    ...flow,
                    glowLineStyle: {
                        width: 6,
                        opacity: 0.72,
                        curveness: flow.curve,
                        color: withAlpha(flowColor, 0.36),
                        shadowBlur: 18,
                        shadowColor: withAlpha(flowColor, 0.5),
                        cap: 'round',
                    },
                    coreLineStyle: {
                        width: 2.3,
                        opacity: 0.96,
                        curveness: flow.curve,
                        color: withAlpha(flowHighlight, 0.96),
                        cap: 'round',
                    },
                };
            }

            if (count > 20) {
                return {
                    ...flow,
                    glowLineStyle: {
                        width: 4.8,
                        opacity: 0.68,
                        curveness: flow.curve,
                        color: withAlpha(flowColor, 0.3),
                        shadowBlur: 14,
                        shadowColor: withAlpha(flowColor, 0.42),
                        cap: 'round',
                    },
                    coreLineStyle: {
                        width: 1.9,
                        opacity: 0.9,
                        curveness: flow.curve,
                        color: withAlpha(flowHighlight, 0.9),
                        cap: 'round',
                    },
                };
            }

            return {
                ...flow,
                glowLineStyle: {
                    width: 3.6,
                    opacity: 0.6,
                    curveness: flow.curve,
                    color: withAlpha(flowColor, 0.24),
                    shadowBlur: 10,
                    shadowColor: withAlpha(flowColor, 0.32),
                    cap: 'round',
                },
                coreLineStyle: {
                    width: 1.5,
                    opacity: 0.84,
                    curveness: flow.curve,
                    color: withAlpha(flowHighlight, 0.84),
                    cap: 'round',
                },
            };
        })
    ), [lines, flowColor, flowHighlight]);

    const sourceNodes = useMemo(() => (
        flowVisuals.map((flow) => ({
            name: flow.fromName,
            value: [flow.sourceCoord[0], flow.sourceCoord[1], flow.count || 0],
        }))
    ), [flowVisuals]);

    const destinationNodes = useMemo(() => (
        flowVisuals.map((flow) => ({
            name: flow.toName,
            value: [flow.destCoord[0], flow.destCoord[1], flow.count || 0],
        }))
    ), [flowVisuals]);

    // ── Three-state data classification ──────────────────────────────────────
    //
    //   A. hasPublicGeoPoints   → render world map with threat-intel markers
    //   B1 hasPrivateGeoPoints  → render world map with gray internal markers
    //   B2 isPrivateOnlyNoCoords→ render internal-network banner (no coords)
    //   C. !hasAnyGeolocationData → show noDataComponent (true empty)

    /** State A — public coordinates are available to plot */
    const hasPublicGeoPoints = points.length > 0 || lines.length > 0;

    /** State B1 — private coords available (tenant defaults matched) */
    const hasPrivateGeoPoints = privatePoints.length > 0;

    /**
     * B-wide — any private data exists regardless of whether coords are known.
     * Resolution order (most reliable first):
     *   1. summary.privateIpCount from the new backend
     *   2. privateLocations[] from the new backend
     *   3. Legacy: scan locations[] and logEntries[] for _isPrivate flag
     */
    const hasAnyPrivateData = useMemo(() => {
        if (typeof summary.privateIpCount === 'number') return summary.privateIpCount > 0;
        if (Array.isArray(privateLocations) && privateLocations.length > 0) return true;
        const locs = Array.isArray(locations) ? locations : [];
        const logs = Array.isArray(logEntries) ? logEntries : [];
        return (
            locs.some((l) => l._isPrivate === true)
            || logs.some((e) => e.source?._isPrivate || e.destination?._isPrivate)
        );
    }, [summary.privateIpCount, privateLocations, locations, logEntries]);

    /** Union gate — anything at all counts as data */
    const hasAnyGeolocationData = (
        hasPublicGeoPoints
        || hasPrivateGeoPoints
        || hasAnyPrivateData
        || (summary.publicIpCount  > 0)
        || (summary.privateIpCount > 0)
    );

    /**
     * State B2 — private data exists but zero plottable coordinates.
     * Use summary.hasPrivateOnlyData when the new backend supplies it;
     * otherwise fall back to computing from local state.
     */
    const isPrivateOnlyNoCoords = (
        typeof summary.hasPrivateOnlyData === 'boolean'
            ? (summary.hasPrivateOnlyData && !hasPublicGeoPoints && !hasPrivateGeoPoints)
            : (hasAnyPrivateData && !hasPublicGeoPoints && !hasPrivateGeoPoints)
    );

    // ── Dev-mode debug log ────────────────────────────────────────────────────
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;
        const locs = Array.isArray(locations) ? locations : [];
        const logs = Array.isArray(logEntries) ? logEntries : [];
        // eslint-disable-next-line no-console
        console.debug('[GeoLocationMap] data state →', {
            branch: isPrivateOnlyNoCoords ? 'B2-private-no-coords'
                : hasPrivateGeoPoints    ? 'B1-private-with-coords'
                : hasPublicGeoPoints     ? 'A-public'
                : 'C-empty',
            locationCount:         locs.length,
            publicLocationsCount:  Array.isArray(publicLocations)  ? publicLocations.length  : '(legacy)',
            privateLocationsCount: Array.isArray(privateLocations) ? privateLocations.length : '(legacy)',
            logEntryCount:         logs.length,
            publicPointCount:      points.length,
            privatePointCount:     privatePoints.length,
            lineCount:             lines.length,
            summaryPublicIpCount:  summary.publicIpCount,
            summaryPrivateIpCount: summary.privateIpCount,
            summaryHasPrivateOnly: summary.hasPrivateOnlyData,
        });
    }, [locations, publicLocations, privateLocations, logEntries, points, privatePoints,
        lines, hasPublicGeoPoints, hasPrivateGeoPoints, hasAnyPrivateData,
        isPrivateOnlyNoCoords, summary]);

    const option = useMemo(() => ({
        backgroundColor: 'transparent',
        title: {
            text: '',
        },
        tooltip: {
            show: false,
            trigger: 'item',
            confine: true,
            backgroundColor: chartColors.ui.tooltip,
            borderColor: chartColors.ui.tooltipBorder,
            borderWidth: 1,
            textStyle: {
                color: sidebarColors.textPrimary,
                ...fontStyles.bodySmall,
            },
            padding: [10, 14],
            extraCssText: 'max-width:300px;white-space:normal;box-shadow:0 12px 30px rgba(0, 0, 0, 0.45);',
            formatter: (params) => {
                // Private / internal series — check by name first because it
                // is also an effectScatter series; name check takes precedence.
                if (params.seriesName === 'Private / Internal') {
                    const data = params.data || {};
                    return `
                        <div style="min-width:200px;">
                            <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:${sidebarColors.textPrimary};padding-bottom:6px;border-bottom:1px solid ${withAlpha(sidebarColors.borderStrong || sidebarColors.border, 0.45)};">
                                ${params.name}&nbsp;<span style="color:#999;font-size:11px;font-weight:400;">(Internal Network)</span>
                            </div>
                            <div style="color:#999;font-size:11px;margin-bottom:6px;">Private IP — coordinates are approximate</div>
                            <div style="display:grid;gap:4px;">
                                <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">Total Events</span><strong style="color:#bbb;">${data.value?.[2] || 0}</strong></div>
                                <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">As Source</span><strong style="color:#bbb;">${data.sourceCount || 0}</strong></div>
                                <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">As Destination</span><strong style="color:#bbb;">${data.destCount || 0}</strong></div>
                            </div>
                        </div>
                    `;
                }
                if (params.seriesType === 'effectScatter') {
                    const data = params.data || {};
                    return `
                        <div style="min-width:190px;">
                            <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:${sidebarColors.textPrimary};padding-bottom:6px;border-bottom:1px solid ${withAlpha(sidebarColors.borderStrong || sidebarColors.border, 0.45)};">
                                ${params.name}
                            </div>
                            <div style="display:grid;gap:4px;">
                                <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">Total Alerts</span><strong style="color:${chartColors.severity.medium};">${data.value?.[2] || 0}</strong></div>
                                <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">As Source</span><strong style="color:${chartColors.severity.high};">${data.sourceCount || 0}</strong></div>
                                <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">As Destination</span><strong style="color:${accent};">${data.destCount || 0}</strong></div>
                            </div>
                        </div>
                    `;
                }
                if (params.seriesType === 'lines') {
                    const data = params.data || {};
                    return `
                        <div style="min-width:190px;">
                            <div style="font-weight:700;font-size:14px;margin-bottom:8px;color:${sidebarColors.textPrimary};padding-bottom:6px;border-bottom:1px solid ${withAlpha(sidebarColors.borderStrong || sidebarColors.border, 0.45)};">
                                ${data.fromName || ''} → ${data.toName || ''}
                            </div>
                            <div style="display:flex;justify-content:space-between;"><span style="color:${sidebarColors.textSecondary};">Connections</span><strong style="color:${chartColors.severity.medium};">${data.count || 0}</strong></div>
                        </div>
                    `;
                }
                return params.name || '';
            },
        },
        geo: {
            map: 'world',
            roam: zoomEnabled ? true : 'move',
            zoom: 1.07,
            center: [8, 21],
            label: { show: false },
            itemStyle: {
                areaColor: sidebarColors.surface,
                borderColor: sidebarColors.border,
                borderWidth: 0.8,
            },
            emphasis: {
                label: {
                    show: true,
                    color: sidebarColors.textPrimary,
                    ...fontStyles.bodySmall,
                    fontWeight: 700,
                },
                itemStyle: {
                    areaColor: withAlpha(accent, 0.26),
                    borderColor: accent,
                    borderWidth: 1.9,
                    shadowBlur: 10,
                    shadowColor: withAlpha(accent, 0.55),
                },
            },
            regions: selectedRegion
                ? [
                    {
                        name: selectedRegion,
                        label: {
                            show: false,
                        },
                        itemStyle: {
                            areaColor: withAlpha(accent, 0.35),
                            borderColor: accent,
                            borderWidth: 2,
                        },
                        emphasis: {
                            label: {
                                show: true,
                                color: sidebarColors.textPrimary,
                                ...fontStyles.bodySmall,
                                fontWeight: 700,
                            },
                            itemStyle: {
                                areaColor: withAlpha(accent, 0.45),
                                borderColor: accent,
                                borderWidth: 2.2,
                            },
                        },
                    },
                ]
                : [],
        },
        series: [
            {
                name: 'Connection Glow',
                type: 'lines',
                coordinateSystem: 'geo',
                zlevel: 2,
                effect: {
                    show: false,
                },
                lineStyle: {
                    width: 4,
                    opacity: 0.65,
                    curveness: 0.22,
                    color: withAlpha(flowColor, 0.3),
                    shadowBlur: 18,
                    shadowColor: withAlpha(flowColor, 0.5),
                    cap: 'round',
                },
                data: flowVisuals.map((flow) => ({
                    ...flow,
                    lineStyle: flow.glowLineStyle,
                })),
            },
            {
                name: 'Connection Core',
                type: 'lines',
                coordinateSystem: 'geo',
                zlevel: 3,
                effect: {
                    show: false,
                },
                lineStyle: {
                    width: 1.8,
                    opacity: 0.9,
                    curveness: 0.22,
                    color: withAlpha(flowHighlight, 0.9),
                    cap: 'round',
                },
                data: flowVisuals.map((flow) => ({
                    ...flow,
                    lineStyle: flow.coreLineStyle,
                })),
            },
            {
                name: 'Flow Pulse',
                type: 'lines',
                coordinateSystem: 'geo',
                zlevel: 4,
                effect: {
                    show: true,
                    period: 4,
                    trailLength: 0.4,
                    symbol: 'circle',
                    symbolSize: 5,
                    color: sidebarColors.textPrimary,
                },
                lineStyle: {
                    width: 0,
                    opacity: 0,
                    curveness: 0.22,
                },
                data: flowVisuals,
                silent: true,
            },
            {
                name: 'Source Nodes',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 4,
                rippleEffect: {
                    brushType: 'stroke',
                    scale: 2.4,
                    period: 4.2,
                },
                symbolSize: (val) => Math.max(4, Math.min((val?.[2] || 0) / 18, 8)),
                itemStyle: {
                    color: flowHighlight,
                    shadowBlur: 10,
                    shadowColor: withAlpha(flowColor, 0.65),
                },
                label: { show: false },
                data: sourceNodes,
                silent: true,
            },
            {
                name: 'Destination Nodes',
                type: 'scatter',
                coordinateSystem: 'geo',
                zlevel: 4,
                symbolSize: (val) => Math.max(3, Math.min((val?.[2] || 0) / 22, 6)),
                itemStyle: {
                    color: sidebarColors.textPrimary,
                    opacity: 0.95,
                    borderColor: withAlpha(flowColor, 0.55),
                    borderWidth: 1,
                },
                label: { show: false },
                data: destinationNodes,
                silent: true,
            },
            {
                name: 'Threat Locations',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 3,
                rippleEffect: {
                    brushType: 'stroke',
                    scale: 3,
                    period: 4,
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'top',
                    color: sidebarColors.textPrimary,
                    ...fontStyles.bodySmall,
                    fontWeight: 'bold',
                    distance: 5,
                    textShadowColor: 'rgba(0, 0, 0, 0.65)',
                    textShadowBlur: 4,
                },
                symbolSize: (val) => Math.max(7, Math.min((val?.[2] || 0) / 7, 14)),
                itemStyle: {
                    color: (params) => {
                        const count = params.value?.[2] || 0;
                        if (count > 100) return threatColor;
                        if (count > 50) return withAlpha(threatColor, 0.85);
                        return withAlpha(threatColor, 0.65);
                    },
                    shadowBlur: 10,
                    shadowColor: withAlpha(threatColor, 0.8),
                    borderColor: withAlpha(threatColor, 0.55),
                    borderWidth: 1,
                },
                emphasis: {
                    scale: 1.1,
                    itemStyle: {
                        shadowBlur: 8,
                        shadowColor: withAlpha(threatColor, 0.55),
                    },
                },
                data: points,
            },
            // ── Private / internal network points ────────────────────────────
            // Hollow gray markers — visually distinct from public threat-red
            // markers so analysts can tell this is internal traffic at a glance.
            // Only rendered when privatePoints[] has plottable coordinates
            // (i.e. tenant geo defaults matched the private IP's tenant).
            {
                name: 'Private / Internal',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 3,
                rippleEffect: {
                    brushType: 'stroke',
                    scale: 2.6,
                    period: 5.5,
                    color: 'rgba(160, 160, 160, 0.45)',
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'top',
                    color: '#999',
                    ...fontStyles.bodySmall,
                    fontWeight: 'bold',
                    distance: 5,
                    textShadowColor: 'rgba(0, 0, 0, 0.55)',
                    textShadowBlur: 3,
                },
                symbolSize: (val) => Math.max(6, Math.min((val?.[2] || 0) / 7, 12)),
                itemStyle: {
                    color: 'rgba(160, 160, 160, 0.1)',
                    borderColor: 'rgba(180, 180, 180, 0.7)',
                    borderWidth: 1.5,
                    borderType: 'dashed',
                    shadowBlur: 6,
                    shadowColor: 'rgba(160, 160, 160, 0.35)',
                },
                emphasis: {
                    scale: 1.1,
                    itemStyle: {
                        shadowBlur: 8,
                        shadowColor: 'rgba(160, 160, 160, 0.5)',
                    },
                },
                data: privatePoints,
            },
        ],
    }), [zoomEnabled, flowVisuals, points, privatePoints, selectedRegion, sourceNodes, destinationNodes, accent, flowColor, flowHighlight, threatColor]);

    if (isLoading) {
        return loadingComponent;
    }

    if (error) {
        return (
            <div
                style={{
                    color: chartColors.severity.critical,
                    padding: spacing.lg,
                    ...fontStyles.body,
                }}
            >
                {error}
            </div>
        );
    }

    // State C: truly empty — no public data, no private data, no log entries.
    // This is the only branch that shows the generic "No geolocation data" message.
    if (!hasAnyGeolocationData) {
        return (
            <div
                style={{
                    color: sidebarColors.textSecondary,
                    padding: spacing.lg,
                    ...fontStyles.body,
                }}
            >
                {noDataComponent}
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 18,
                padding: `${spacing.md} ${spacing.md}`,
                border: `1px solid ${withAlpha(primary, 0.3)}`,
                background: `radial-gradient(1300px 520px at 62% 4%, ${withAlpha(sidebarColors.surfaceElevated || sidebarColors.surface, 0.9)} 0%, ${withAlpha(sidebarColors.surface, 0.85)} 35%, ${withAlpha(sidebarColors.backgroundSoft, 0.9)} 64%, ${sidebarColors.background} 100%)`,
                boxShadow: `inset 0 0 0 1px ${withAlpha(primary, 0.12)}, 0 26px 50px ${withAlpha(sidebarColors.backgroundDeep || sidebarColors.background, 0.42)}`,
            }}
        >


            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    backgroundImage: `linear-gradient(to right, ${withAlpha(primary, 0.055)} 1px, transparent 1px), linear-gradient(to bottom, ${withAlpha(primary, 0.04)} 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                    maskImage: 'radial-gradient(76% 62% at 52% 38%, #000 56%, transparent 100%)',
                    opacity: 0.65,
                }}
            />

            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: spacing.sm,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginBottom: spacing.md,
                }}
            >


                <button
                    style={{
                        background: zoomEnabled
                            ? `linear-gradient(135deg, ${withAlpha(primary, 0.36)} 0%, ${withAlpha(primary, 0.3)} 100%)`
                            : `linear-gradient(135deg, ${withAlpha(sidebarColors.surface, 0.84)} 0%, ${withAlpha(sidebarColors.backgroundSoft, 0.84)} 100%)`,
                        border: `1px solid ${zoomEnabled ? withAlpha(primary, 0.82) : withAlpha(primary, 0.4)}`,
                        color: zoomEnabled ? sidebarColors.textPrimary : sidebarColors.textSecondary,
                        borderRadius: 999,
                        padding: `${spacing.sm} ${spacing.md}`,
                        cursor: 'pointer',
                        transition: 'all 180ms ease',
                        ...fontStyles.bodySmall,
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                    }}
                    onClick={() => setZoomEnabled((prev) => !prev)}
                    type="button"
                >
                    {zoomEnabled ? 'Zoom Enabled' : 'Enable Zoom'}
                </button>
            </div>

            {showSummary ? (
                <div
                    style={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: spacing.sm,
                        marginBottom: spacing.md,
                    }}
                >
                    <div
                        style={{
                            border: `1px solid ${panelBorder}`,
                            borderRadius: 10,
                            backgroundColor: panelBg,
                            padding: `${spacing.sm} ${spacing.md}`,
                        }}
                    >
                        <p style={{ margin: 0, color: sidebarColors.textSecondary, ...fontStyles.caption }}>Countries</p>
                        <p style={{ margin: `${spacing.xs} 0 0`, color: sidebarColors.textPrimary, ...fontStyles.heading6 }}>
                            {(summary.totalCountries || locations.length).toLocaleString()}
                        </p>
                    </div>
                    <div
                        style={{
                            border: `1px solid ${panelBorder}`,
                            borderRadius: 10,
                            backgroundColor: panelBg,
                            padding: `${spacing.sm} ${spacing.md}`,
                        }}
                    >
                        <p style={{ margin: 0, color: sidebarColors.textSecondary, ...fontStyles.caption }}>Alerts</p>
                        <p style={{ margin: `${spacing.xs} 0 0`, color: threatColor, ...fontStyles.heading6 }}>
                            {(summary.totalAlerts || 0).toLocaleString()}
                        </p>
                    </div>
                    <div
                        style={{
                            border: `1px solid ${panelBorder}`,
                            borderRadius: 10,
                            backgroundColor: panelBg,
                            padding: `${spacing.sm} ${spacing.md}`,
                        }}
                    >
                        <p style={{ margin: 0, color: sidebarColors.textSecondary, ...fontStyles.caption }}>Flows</p>
                        <p style={{ margin: `${spacing.xs} 0 0`, color: flowHighlight, ...fontStyles.heading6 }}>
                            {(summary.totalFlows || flows.length).toLocaleString()}
                        </p>
                    </div>
                </div>
            ) : null}

            {/* ── State B2: private data, no plottable coords ────────────────────
                 Show an internal-network banner instead of the ECharts canvas.
                 The log-entry list below still renders so analysts can see
                 which IPs and timestamps were involved.                    */}
            {isPrivateOnlyNoCoords ? (
                <div
                    style={{
                        position: 'relative',
                        borderRadius: 12,
                        border: `1px dashed ${withAlpha(primary, 0.22)}`,
                        background: `linear-gradient(180deg, ${withAlpha(sidebarColors.backgroundSoft, 0.35)} 0%, ${withAlpha(sidebarColors.background, 0.55)} 100%)`,
                        padding: `${spacing.lg} ${spacing.md}`,
                        marginBottom: spacing.sm,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 180,
                        textAlign: 'center',
                        gap: spacing.sm,
                    }}
                >
                    <div style={{ fontSize: 32, lineHeight: 1, opacity: 0.4 }}>🔒</div>
                    <div
                        style={{
                            color: sidebarColors.textSecondary,
                            ...fontStyles.body,
                            fontWeight: 600,
                            maxWidth: 440,
                        }}
                    >
                        {noDataComponent}
                    </div>
                    <div
                        style={{
                            color: sidebarColors.textSecondary,
                            ...fontStyles.bodySmall,
                            maxWidth: 440,
                            lineHeight: 1.6,
                            opacity: 0.65,
                        }}
                    >
                        {summary.privateIpCount > 0
                            ? `${summary.privateIpCount.toLocaleString()} internal IP${summary.privateIpCount !== 1 ? 's' : ''} detected. Public geolocation data unavailable.`
                            : 'All detected traffic originated from private or internal network addresses.'
                        }
                        {logEntries.length > 0 ? ' Log details are shown below.' : ''}
                    </div>
                </div>
            ) : (
                /* ── States A & B1: plottable data exists — render the map ── */
                <div
                    style={{
                        position: 'relative',
                        borderRadius: 12,
                        border: `1px solid ${withAlpha(primary, 0.28)}`,
                        background: `linear-gradient(180deg, ${withAlpha(sidebarColors.backgroundSoft, 0.5)} 0%, ${withAlpha(sidebarColors.background, 0.75)} 100%)`,
                        padding: spacing.xs,
                        marginBottom: spacing.sm,
                    }}
                >
                    <ReactECharts
                        option={option}
                        style={{ height, width: '100%' }}
                        onEvents={{
                            click: (params) => {
                                const clickedName = params?.name || '';
                                if (clickedName) {
                                    setSelectedRegion((prev) => (prev === clickedName ? '' : clickedName));
                                }

                                if (params.componentType === 'series' || params.componentType === 'geo') {
                                    onClickCountry?.(clickedName, params);
                                }
                            },
                        }}
                        opts={{ renderer: 'canvas' }}
                    />
                </div>
            )}

            {showFlowList && flows.length > 0 ? (
                <div
                    style={{
                        position: 'relative',
                        marginTop: spacing.md,
                        padding: spacing.md,
                        borderRadius: 12,
                        border: `1px solid ${panelBorder}`,
                        backgroundColor: panelSoftBg,
                    }}
                >
                    <h3 style={{ ...fontStyles.heading6, color: sidebarColors.textPrimary, margin: `0 0 ${spacing.sm}` }}>
                        Top Connection Flows
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing.sm }}>
                        {flows.slice(0, 6).map((flow, idx) => (
                            <div
                                key={`${flow.source}-${flow.destination}-${idx}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: spacing.sm,
                                    borderRadius: 10,
                                    border: `1px solid ${tileBorder}`,
                                    padding: `${spacing.sm} ${spacing.md}`,
                                    backgroundColor: tileBg,
                                    ...fontStyles.bodySmall,
                                }}
                            >
                                <span style={{ color: chartColors.edges.critical }}>→</span>
                                <span style={{ color: sidebarColors.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {flow.source} → {flow.destination}
                                </span>
                                <span style={{ color: sidebarColors.textSecondary, fontWeight: 600 }}>{flow.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {showRecentLogs && logEntries.length > 0 ? (
                <div
                    style={{
                        position: 'relative',
                        marginTop: spacing.md,
                        padding: spacing.md,
                        borderRadius: 12,
                        border: `1px solid ${panelBorder}`,
                        backgroundColor: panelSoftBg,
                    }}
                >
                    <h3 style={{ ...fontStyles.heading6, color: sidebarColors.textPrimary, margin: `0 0 ${spacing.sm}` }}>
                        Recent High/Critical Connections
                    </h3>
                    <div style={{ display: 'grid', gap: spacing.sm, maxHeight: 220, overflowY: 'auto' }}>
                        {logEntries.slice(0, 5).map((entry, idx) => (
                            <div
                                key={`${entry.timestamp || idx}-${idx}`}
                                style={{
                                    borderRadius: 10,
                                    border: `1px solid ${tileBorder}`,
                                    padding: `${spacing.sm} ${spacing.md}`,
                                    backgroundColor: tileBg,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs, flexWrap: 'wrap' }}>
                                    <span
                                        style={{
                                            borderRadius: 999,
                                            padding: `${spacing.xs} ${spacing.sm}`,
                                            backgroundColor: entry.severity?.toLowerCase() === 'critical'
                                                ? withAlpha(chartColors.severity.critical, 0.2)
                                                : withAlpha(chartColors.severity.high, 0.2),
                                            color: entry.severity?.toLowerCase() === 'critical'
                                                ? chartColors.severity.critical
                                                : chartColors.severity.high,
                                            ...fontStyles.caption,
                                            fontWeight: 700,
                                            letterSpacing: '0.02em',
                                        }}
                                    >
                                        {entry.severity}
                                    </span>
                                    <span style={{ color: sidebarColors.textMuted, ...fontStyles.caption }}>
                                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                                    </span>
                                </div>
                                <div style={{ color: sidebarColors.textPrimary, ...fontStyles.body, fontWeight: 500 }}>
                                    {entry.connectionDescription}
                                </div>
                                <div style={{ color: sidebarColors.textSecondary, ...fontStyles.caption, marginTop: spacing.xs }}>
                                    {entry.source?.ip} → {entry.destination?.ip}
                                    {entry.protocol ? ` | ${entry.protocol}` : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
