import React, { useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';

// ── echarts + custom chart/card wrappers (the EagleEye chart layer) ──
import AreaChartWrapper from '../../chartsComponents/chartWrappers/areaChart.jsx';
import LineChartWrapper from '../../chartsComponents/chartWrappers/lineChart.jsx';
import VerticalBarChartWrapper from '../../chartsComponents/chartWrappers/verticalBarChart.jsx';
import HorizontalBarChartWrapper from '../../chartsComponents/chartWrappers/horizontalBarChart.jsx';
import DonutChartWrapper from '../../chartsComponents/chartWrappers/donutChart.jsx';
import { NightingaleChartWrapper } from '../../chartsComponents/chartWrappers/nightingaleChart.jsx';
import { HeatmapChartWrapper } from '../../chartsComponents/chartWrappers/heatmapChart.jsx';
import GeoLocationMapWrapper from '../../chartsComponents/chartWrappers/geoLocationMap.jsx';
import CardWrapper from '../../chartsComponents/chartWrappers/card.jsx';
import RiskScoreCardWrapper from '../../chartsComponents/chartWrappers/leftCard.jsx';
import ListCardWrapper from '../../chartsComponents/chartWrappers/listCard.jsx';
import TopCard from '../../chartsComponents/chartWrappers/topCards.jsx';
import TableWrapper from '../../chartsComponents/chartWrappers/tableWrapper.jsx';
import MttdMttrCardsWrapper from '../../chartsComponents/chartWrappers/mttdMttrCards.jsx';
import ThreatListCardWrapper from '../../chartsComponents/chartWrappers/threatListCard.jsx';
import ExploitAttemptsCardWrapper from '../../chartsComponents/chartWrappers/exploitAttemptsCard.jsx';
import MalwareThreatActorsCardWrapper from '../../chartsComponents/chartWrappers/malwareThreatActorsCard.jsx';
import EagleEyeLoader from '../../chartsComponents/chartWrappers/EagleEyeLoader.jsx';

/* ── Demo datasets (threat-intel flavoured) ─────────────────────────── */

const TS = (h) => `2026-06-23T${String(h).padStart(2, '0')}:00:00`;

const timeSeries = Array.from({ length: 12 }, (_, i) => ({
  timestamp: TS(i * 2),
  critical: Math.round(20 + 30 * Math.sin(i / 2) + i * 3),
  high: Math.round(40 + 25 * Math.cos(i / 3) + i * 2),
  medium: Math.round(60 + 20 * Math.sin(i / 1.5)),
}));

const barData = [
  { name: 'Phishing', value: 482 },
  { name: 'Malware', value: 351 },
  { name: 'C2', value: 274 },
  { name: 'Exploit', value: 198 },
  { name: 'Recon', value: 143 },
  { name: 'DDoS', value: 96 },
];

const groupedBar = [
  { name: 'Mon', blocked: 120, allowed: 30 },
  { name: 'Tue', blocked: 180, allowed: 42 },
  { name: 'Wed', blocked: 150, allowed: 28 },
  { name: 'Thu', blocked: 210, allowed: 55 },
  { name: 'Fri', blocked: 240, allowed: 60 },
];

const donutData = [
  { name: 'Critical', value: 368 },
  { name: 'High', value: 1204 },
  { name: 'Medium', value: 892 },
  { name: 'Low', value: 245 },
];

const heatmapData = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => ({
    weekday: d + 1,
    hour: h,
    failure_count: Math.round(Math.abs(Math.sin((d + 1) * h) * 18)),
    success_count: Math.round(40 + Math.abs(Math.cos(h) * 30)),
  }))
).flat();

const geoLocations = [
  { country: 'United States', latitude: 38.0, longitude: -97.0, totalCount: 1240, sourceCount: 800, destCount: 440, cities: [], ips: [] },
  { country: 'Russia', latitude: 61.5, longitude: 105.3, totalCount: 870, sourceCount: 700, destCount: 170, cities: [], ips: [] },
  { country: 'China', latitude: 35.8, longitude: 104.2, totalCount: 1530, sourceCount: 1300, destCount: 230, cities: [], ips: [] },
  { country: 'India', latitude: 22.3, longitude: 78.9, totalCount: 640, sourceCount: 300, destCount: 340, cities: [], ips: [] },
  { country: 'Germany', latitude: 51.2, longitude: 10.4, totalCount: 410, sourceCount: 220, destCount: 190, cities: [], ips: [] },
  { country: 'Brazil', latitude: -14.2, longitude: -51.9, totalCount: 295, sourceCount: 150, destCount: 145, cities: [], ips: [] },
];

const cardData = [
  { id: '1', title: 'Critical Alerts', value: 368, variant: 'critical' },
  { id: '2', title: 'High Alerts', value: 1204, variant: 'high' },
  { id: '3', title: 'Medium Alerts', value: 892, variant: 'medium' },
  { id: '4', title: 'Low Alerts', value: 245, variant: 'low' },
];

const listData = [
  { name: 'Emotet', value: 412 },
  { name: 'TrickBot', value: 308 },
  { name: 'Cobalt Strike', value: 264 },
  { name: 'AgentTesla', value: 187 },
  { name: 'QakBot', value: 142 },
];

const tableData = [
  { name: 'source.ip', events: 18234, blocked: 4021, status: 'active' },
  { name: 'destination.ip', events: 14920, blocked: 880, status: 'active' },
  { name: 'user.name', events: 9210, blocked: 142, status: 'idle' },
  { name: 'event.action', events: 7345, blocked: 23, status: 'active' },
  { name: 'host.name', events: 5102, blocked: 9, status: 'idle' },
];

const mttdCards = [
  { id: 'mttd', label: 'MTTD', display: '2h 14m', color: '#0ea5e9', icon: 'alarm-clock', subData: ['Detection latency', '↓ 18% vs last week'] },
  { id: 'mttr', label: 'MTTR', display: '5h 48m', color: '#3FBF8C', icon: 'refresh', subData: ['Response latency', '↓ 7% vs last week'] },
  { id: 'cases', label: 'Open Cases', display: 37, color: '#E6A93C', icon: 'clipboard', subData: ['12 high priority'] },
  { id: 'uptime', label: 'Sensor Uptime', display: '99.97%', color: '#3FBF8C', icon: 'clock', subData: ['All sensors nominal'] },
];

const threatItems = [
  { name: 'Emotet', subtitle: 'Banking trojan', signal: 5 },
  { name: 'LockBit 3.0', subtitle: 'Ransomware', signal: 5 },
  { name: 'Cobalt Strike', subtitle: 'C2 framework', signal: 4 },
  { name: 'AgentTesla', subtitle: 'Infostealer', signal: 3 },
  { name: 'QakBot', subtitle: 'Loader', signal: 3 },
];

const exploitData = [
  { id: '1', device: 'edge-fw-01', cve: 'CVE-2026-0042', cvss: 9.8, attempts: 142, status: 'Active' },
  { id: '2', device: 'web-app-03', cve: 'CVE-2026-1187', cvss: 8.1, attempts: 87, status: 'Active' },
  { id: '3', device: 'vpn-gw-02', cve: 'CVE-2025-9921', cvss: 7.4, attempts: 53, status: 'Active' },
  { id: '4', device: 'mail-relay-01', cve: 'CVE-2025-7780', cvss: 6.2, attempts: 21, status: 'Mitigated' },
];

const malwares = [
  { name: 'Emotet', actor: 'TA542' },
  { name: 'TrickBot', actor: 'Wizard Spider' },
  { name: 'LockBit', actor: 'Bitwise Spider' },
];
const actors = [
  { name: 'APT29 (Cozy Bear)' },
  { name: 'APT28 (Fancy Bear)' },
  { name: 'Lazarus Group' },
  { name: 'FIN7' },
];

/* ── layout helpers ─────────────────────────────────────────────────── */

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border bg-card ${className}`}>
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/* ── the charts view ────────────────────────────────────────────────── */

export default function ChartsDemo() {
  const [showGeo, setShowGeo] = useState(false);

  return (
    <div className="space-y-10">
      <Section title="Time-series — Area & Line (echarts)">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Alert volume over time" subtitle="Stacked area, last 24h">
            <AreaChartWrapper data={timeSeries} xAxisField="timestamp" height={300} />
          </ChartCard>
          <ChartCard title="Severity trend" subtitle="Multi-series line">
            <LineChartWrapper data={timeSeries} xAxisField="timestamp" height={300} />
          </ChartCard>
        </div>
      </Section>

      <Section title="Categorical — Bars">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Top attack categories" subtitle="Vertical bar (3D single-series)">
            <VerticalBarChartWrapper data={barData} xAxisField="name" height={300} />
          </ChartCard>
          <ChartCard title="Blocked vs allowed" subtitle="Horizontal grouped bar">
            <HorizontalBarChartWrapper data={groupedBar} xAxisField="name" height={300} />
          </ChartCard>
        </div>
      </Section>

      <Section title="Distribution — Donut & Nightingale">
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Alerts by severity" subtitle="Donut">
            <DonutChartWrapper data={donutData} height={320} />
          </ChartCard>
          <ChartCard title="Alerts by severity" subtitle="Nightingale (rose)">
            <NightingaleChartWrapper data={donutData} height={320} />
          </ChartCard>
        </div>
      </Section>

      <Section title="Heatmap — Failure rate by hour / weekday">
        <ChartCard title="Auth failures" subtitle="7 days × 24 hours">
          <HeatmapChartWrapper data={heatmapData} height={240} />
        </ChartCard>
      </Section>

      <Section title="Metric & summary cards">
        <CardWrapper cards={cardData} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TopCard value={128430} title="Total IOCs Swept" icon={<Search className="size-5" />} />
          <TopCard value={368} title="Critical Open" icon={<ShieldAlert className="size-5" />} />
          <RiskScoreCardWrapper fixedScore={7.4} maxScore={10} title="Composite Risk" height={180} />
          <RiskScoreCardWrapper fixedScore={3.1} maxScore={10} title="Asset Exposure" height={180} />
        </div>
        <MttdMttrCardsWrapper cards={mttdCards} />
      </Section>

      <Section title="Lists, tables & threat panels">
        <div className="grid gap-4 lg:grid-cols-2">
          <ListCardWrapper data={listData} itemSuffix="detections" />
          <ThreatListCardWrapper title="Top Malwares" icon="🦠" items={threatItems} />
        </div>
        <TableWrapper
          data={tableData}
          rowNameLabel="Field"
          columns={[
            { key: 'name', label: 'Field', isRowName: true, align: 'left' },
            { key: 'events', label: 'Events' },
            { key: 'blocked', label: 'Blocked' },
            { key: 'status', label: 'Status' },
          ]}
        />
        <ExploitAttemptsCardWrapper data={exploitData} pagination={{ enabled: true, pageSize: 3 }} />
        <MalwareThreatActorsCardWrapper malwares={malwares} actors={actors} />
      </Section>

      <Section title="Geo-location map (echarts geo)">
        <p className="text-sm text-muted-foreground">
          Loads a world map from a CDN and patches India geometry — render on demand.
        </p>
        {showGeo ? (
          <GeoLocationMapWrapper publicLocations={geoLocations} height={520} rangeText="Last 24 hours" />
        ) : (
          <button
            type="button"
            onClick={() => setShowGeo(true)}
            className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent"
          >
            Render geo map
          </button>
        )}
      </Section>

      <Section title="EagleEyeLoader (chart loading state)">
        <div className="flex flex-wrap items-center gap-10 rounded-xl border border-border bg-card p-8">
          <EagleEyeLoader size={120} text="Loading telemetry…" />
          <EagleEyeLoader size={80} showText={false} />
        </div>
      </Section>
    </div>
  );
}
