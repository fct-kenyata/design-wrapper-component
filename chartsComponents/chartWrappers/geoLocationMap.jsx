import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import sidebarColors, { chartColors, fontStyles } from '../../colors';
import { spacing } from '../../spacing';
import EagleEyeLoader from './EagleEyeLoader';

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
    privateIpList = [],        // unique private IPs with role + topConnectedPublicIp
    flows = [],
    logEntries = [],
    summary = {},
    isLoading = false,
    error = null,
    rangeText = '',
    onClickCountry,
    loadingComponent = <EagleEyeLoader size={80} text="Loading map" theme="dark" />,
    noDataComponent = 'No geolocation data available',
    emptyMessage = null,         // overlay text shown when widget has no data at all
    height = 600,
    showSummary = true,
    showFlowList = true,
    showRecentLogs = true,
}) {
    const [zoomEnabled, setZoomEnabled] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [mapReady, setMapReady] = useState(false);
    const chartRef = useRef(null);

    // ─── Map Loading & Patching Logic ────────────────────────────────────
    useEffect(() => {
        let isMounted = true;

        const loadAndPatchMap = async () => {
            // If the map is already registered globally by ECharts, skip fetching
            if (echarts.getMap('world')) {
                if (isMounted) setMapReady(true);
                return;
            }

            try {
                const [worldRes, indiaRes] = await Promise.all([
                    fetch('https://cdn.jsdelivr.net/npm/echarts@4/map/json/world.json'),
                    fetch('https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson')
                ]);

                const world = await worldRes.json();
                const india = await indiaRes.json();

                if (india && india.features && india.features.length > 0) {
                    const idx = world.features.findIndex(f =>
                        f.properties && (f.properties.name === 'India' || f.properties.iso_a3 === 'IND' || f.properties.ISO_A3 === 'IND')
                    );

                    if (idx >= 0) {
                        const allCoords = [];
                        india.features.forEach(f => {
                            const g = f.geometry;
                            if (!g) return;
                            if (g.type === 'Polygon') allCoords.push(g.coordinates);
                            else if (g.type === 'MultiPolygon') g.coordinates.forEach(c => allCoords.push(c));
                        });

                        world.features[idx] = {
                            type: 'Feature',
                            properties: world.features[idx].properties,
                            geometry: { type: 'MultiPolygon', coordinates: allCoords }
                        };
                    }
                }

                echarts.registerMap('world', world);
                
                if (isMounted) {
                    setMapReady(true);
                }
            } catch (err) {
                console.error('Failed to load or patch map data:', err);
                // Fallback: unblock the UI if fetch fails
                if (isMounted) setMapReady(true); 
            }
        };

        loadAndPatchMap();

        return () => {
            isMounted = false;
        };
    }, []);

    console.log('[GeoMap] props received:', {
        publicLocations: publicLocations?.length,
        privateIpList: privateIpList?.length,
        flows: flows?.length,
        logEntries: logEntries?.length,
        summary,
    });

    useEffect(() => {
        const el = chartRef.current?.ele || chartRef.current?.getEchartsInstance?.().getDom?.();
        console.log('[GeoMap] container size:', el?.clientWidth, 'x', el?.clientHeight);
    }, [publicLocations]);

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

    // ── Unmapped public entries (null lat/lon from geo API) ───────────────────
    // Cannot be plotted, but we still list their country names in a footer.
    const unmapped = useMemo(() => {
        const source = Array.isArray(publicLocations)
            ? publicLocations
            : (Array.isArray(locations) ? locations : []).filter((l) => !l._isPrivate);
        return source.filter((l) => l.latitude == null || l.longitude == null);
    }, [locations, publicLocations]);

    // ── Internal arcs: private IP → best public endpoint ─────────────────────
    // Each entry in privateIpList has a topConnectedPublicIp. We resolve that
    // IP's coordinates from logEntries and draw a dashed arc from a fixed
    // off-screen anchor (representing "internal network") to that endpoint.
    const internalArcsData = useMemo(() => {
        const ipCoordMap = new Map();
        for (const entry of (Array.isArray(logEntries) ? logEntries : [])) {
            const src = entry.source;
            const dst = entry.destination;
            const pub = (src && !src._isPrivate) ? src : ((dst && !dst._isPrivate) ? dst : null);
            if (pub?.ip && pub.latitude != null && pub.longitude != null) {
                if (!ipCoordMap.has(pub.ip)) {
                    ipCoordMap.set(pub.ip, [pub.longitude, pub.latitude]);
                }
            }
        }
        return (Array.isArray(privateIpList) ? privateIpList : [])
            .filter((p) => p.topConnectedPublicIp && ipCoordMap.has(p.topConnectedPublicIp))
            .map((p) => ({
                coords: [[0, 20], ipCoordMap.get(p.topConnectedPublicIp)],
                ip: p.ip,
                count: p.count,
            }));
    }, [privateIpList, logEntries]);

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
    //   A. hasPublicGeoPoints  → render world map with threat-intel markers
    //   B1 hasPrivateGeoPoints → render world map with gray internal markers
    //   B2 isPrivateOnlyNoCoords→ render internal-network banner (no coords)
    //   C. !hasAnyGeolocationData → show noDataComponent (true empty)

    /** State A — public coordinates are available to plot */
    const hasPublicGeoPoints = points.length > 0;  // do NOT gate on lines.length

    /** State B1 — private coords available (tenant defaults matched) */
    const hasPrivateGeoPoints = privatePoints.length > 0;

    /**
     * B-wide — any private data exists regardless of whether coords are known.
     * Resolution order (most reliable first):
     * 1. summary.privateIpCount from the new backend
     * 2. privateLocations[] from the new backend
     * 3. Legacy: scan locations[] and logEntries[] for _isPrivate flag
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
            // ── Private / Internal series intentionally omitted ────────────────
            // Private IPs have no reliable public coordinates and must not appear
            // on the geographic map. They are shown in the dedicated private-IP
            // panel below the map instead.

            // ── Internal arcs: private→public dashed lines ────────────────────
            // Drawn from a fixed off-map anchor [0,20] to each top-connected
            // public IP, using grey dashed style so they are visually distinct
            // from the red flows-based arcs. silent:true → no tooltips.
            {
                name: 'Internal Arcs',
                type: 'lines',
                coordinateSystem: 'geo',
                zlevel: 2,
                effect: { show: false },
                lineStyle: {
                    width: 1.2,
                    opacity: 0.55,
                    curveness: 0.3,
                    color: 'rgba(180, 180, 180, 0.7)',
                    type: 'dashed',
                },
                data: internalArcsData,
                silent: true,
            },
        ],
    }), [zoomEnabled, flowVisuals, points, selectedRegion, sourceNodes, destinationNodes,
        accent, flowColor, flowHighlight, threatColor, internalArcsData]);

    if (isLoading || !mapReady) {
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
    // Render the map shell with an inline message instead of a standalone empty widget.
    // The product owner never wants users to see a blank "No Data Available" card.
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
                            {(summary.totalPublicCountries ?? (Array.isArray(publicLocations) ? publicLocations.length : points.length)).toLocaleString()}
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
                        <p style={{ margin: 0, color: sidebarColors.textSecondary, ...fontStyles.caption }}>Alert Logs</p>
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
                    {(summary.privateIpCount ?? (Array.isArray(privateIpList) ? privateIpList.length : 0)) > 0 && (
                        <div
                            style={{
                                border: `1px solid ${panelBorder}`,
                                borderRadius: 10,
                                backgroundColor: panelBg,
                                padding: `${spacing.sm} ${spacing.md}`,
                            }}
                        >
                            <p style={{ margin: 0, color: sidebarColors.textSecondary, ...fontStyles.caption }}>Private IPs</p>
                            <p style={{ margin: `${spacing.xs} 0 0`, color: infoColor, ...fontStyles.heading6 }}>
                                {(summary.privateIpCount ?? privateIpList.length).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            ) : null}

            {/* ── State C / no-public-data: inline message inside map shell ──────
                 Never return a standalone empty-state widget.               */}
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
                    <div style={{ fontSize: 32, lineHeight: 1, opacity: 0.4 }}>
                        {!hasAnyGeolocationData ? '🔍' : '🔒'}
                    </div>
                    <div
                        style={{
                            color: sidebarColors.textSecondary,
                            ...fontStyles.body,
                            fontWeight: 600,
                            maxWidth: 440,
                        }}
                    >
                        {!hasAnyGeolocationData
                            ? 'No threat events in selected range'
                            : noDataComponent}
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
                        {!hasAnyGeolocationData
                            ? 'Adjust the time range or check that your index contains high/critical severity events.'
                            : summary.privateIpCount > 0
                                ? `${summary.privateIpCount.toLocaleString()} internal IP${summary.privateIpCount !== 1 ? 's' : ''} detected. Public geolocation data unavailable.`
                                : 'All detected traffic originated from private or internal network addresses.'}
                        {logEntries.length > 0 && hasAnyGeolocationData ? ' Log details are shown below.' : ''}
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
                    {console.log('[GeoMap] ECharts option:', JSON.stringify({
                        geoExists: !!option.geo,
                        geoMap: option.geo?.map,
                        seriesCount: option.series?.length,
                        series0Type: option.series?.[0]?.type,
                        series0CoordSystem: option.series?.[0]?.coordinateSystem,
                        series0DataLen: option.series?.[0]?.data?.length,
                        series0Data0: option.series?.[0]?.data?.[0],
                        series1Type: option.series?.[1]?.type,
                        series1DataLen: option.series?.[1]?.data?.length,
                        series1Data0: option.series?.[1]?.data?.[0],
                    }, null, 2))}
                    <ReactECharts
                        ref={chartRef}
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
                    {/* emptyMessage overlay: shown when there is genuinely no data */}
                    {emptyMessage && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                zIndex: 5,
                            }}
                        >
                            <span
                                style={{
                                    color: sidebarColors.textSecondary,
                                    ...fontStyles.body,
                                    background: withAlpha(sidebarColors.backgroundSoft, 0.88),
                                    borderRadius: 8,
                                    padding: `${spacing.sm} ${spacing.md}`,
                                }}
                            >
                                {emptyMessage}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Unmapped countries footer: countries returned by backend that have
                 no geo coordinates available so they couldn't be plotted on the map */}
            {unmapped.length > 0 && (
                <p
                    style={{
                        color: sidebarColors.textMuted,
                        ...fontStyles.caption,
                        textAlign: 'center',
                        margin: `0 0 ${spacing.sm}`,
                        opacity: 0.7,
                    }}
                >
                    Unmapped (no coordinates): {unmapped.map((l) => l.country).join(', ')}
                </p>
            )}

            {/* ── Private IP panel ──────────────────────────────────────────────────
                 Shows internal/private IPs in a dedicated list panel.
                 Private IPs are NOT plotted on the geographic map.       */}
            {privateIpList.length > 0 && (
                <div
                    style={{
                        position: 'relative',
                        marginTop: spacing.md,
                        padding: spacing.md,
                        borderRadius: 12,
                        border: `1px solid ${withAlpha(sidebarColors.border, 0.5)}`,
                        backgroundColor: withAlpha(sidebarColors.backgroundSoft, 0.6),
                    }}
                >
                    <h3 style={{ ...fontStyles.heading6, color: sidebarColors.textSecondary, margin: `0 0 ${spacing.sm}`, display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                        <span style={{ fontSize: 14, opacity: 0.7 }}>🔒</span>
                        Internal / Private IPs
                        <span style={{ ...fontStyles.caption, color: sidebarColors.textMuted, fontWeight: 400, marginLeft: spacing.xs }}>
                            ({privateIpList.length} unique)
                        </span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: spacing.sm }}>
                        {privateIpList.slice(0, 12).map((entry) => (
                            <div
                                key={entry.ip}
                                style={{
                                    borderRadius: 8,
                                    border: `1px solid ${withAlpha(sidebarColors.border, 0.35)}`,
                                    padding: `${spacing.sm} ${spacing.md}`,
                                    backgroundColor: withAlpha(sidebarColors.surface, 0.5),
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    ...fontStyles.bodySmall,
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ color: sidebarColors.textPrimary, fontFamily: 'monospace', fontSize: 12 }}>
                                        {entry.ip}
                                    </span>
                                    {entry.topConnectedPublicIp && (
                                        <span style={{ color: sidebarColors.textMuted, fontSize: 11 }}>
                                            → {entry.topConnectedPublicIp}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                                    <span
                                        style={{
                                            borderRadius: 4,
                                            padding: '1px 6px',
                                            backgroundColor: withAlpha(sidebarColors.border, 0.35),
                                            color: sidebarColors.textSecondary,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        {entry.role}
                                    </span>
                                    <span style={{ color: sidebarColors.textMuted, fontSize: 11 }}>{entry.count} events</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {privateIpList.length > 12 && (
                        <p style={{ ...fontStyles.caption, color: sidebarColors.textMuted, margin: `${spacing.sm} 0 0`, textAlign: 'center' }}>
                            … and {privateIpList.length - 12} more internal IPs
                        </p>
                    )}
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
                                    {/* [INTERNAL] badge for entries that involve a private/RFC-1918 IP */}
                                    {(entry.source?._isPrivate || entry.destination?._isPrivate) && (
                                        <span
                                            style={{
                                                borderRadius: 999,
                                                padding: `${spacing.xs} ${spacing.sm}`,
                                                backgroundColor: withAlpha(sidebarColors.border, 0.4),
                                                color: sidebarColors.textSecondary,
                                                ...fontStyles.caption,
                                                fontWeight: 700,
                                                letterSpacing: '0.04em',
                                            }}
                                        >
                                            [INTERNAL]
                                        </span>
                                    )}
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