import { useState, useEffect } from 'react';
import { listCorridors, getCorridorDemand } from '../api/client';
import { DEMO_CORRIDORS, DEMO_SEGMENTS, DENSITY_CONFIG } from '../config/constants';
import DensityPill from '../components/common/DensityPill';

const DEMO = DEMO_CORRIDORS.map(c => ({
  ...c,
  segments: DEMO_SEGMENTS(c.totalSegments),
}));

const S = {
  shell: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'Syne, sans-serif' },
  sidebar: { background: '#0f0e0e', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 8, position: 'sticky', top: 0, height: '100vh' },
  logo: { fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: '#E8850A', padding: '8px 12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 },
  main: { background: '#F7F5F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', background: '#fff', borderBottom: '1px solid rgba(15,14,14,0.08)' },
  content: { padding: '24px 28px', display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, overflow: 'auto', flex: 1 },
  card: { background: '#fff', border: '1px solid rgba(15,14,14,0.08)', borderRadius: 14, padding: 20 },
  cardTitle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(15,14,14,0.5)', marginBottom: 14 },
  kpiGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  kpi: { background: '#F7F5F0', borderRadius: 10, padding: 14 },
  kpiLabel: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' },
  kpiVal: { fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, lineHeight: 1, marginTop: 4 },
};

export default function OpsDashboard() {
  const [corridors, setCorridors] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [alerts,    setAlerts]    = useState([]);

  useEffect(() => {
    listCorridors()
      .then(data => {
        const enriched = data.length ? data : DEMO;
        setCorridors(enriched);
        setSelected(enriched[0]);
      })
      .catch(() => { setCorridors(DEMO); setSelected(DEMO[0]); });

    setAlerts([
      { id: 1, level: 'SURGE',  msg: 'GG_GM Segment 3 — 14 waiting, 1 driver', time: '2m ago' },
      { id: 2, level: 'HIGH',   msg: 'GG_GM Segment 4 — ratio 3.5x',           time: '4m ago' },
      { id: 3, level: 'MEDIUM', msg: 'PJ_BR Segment 1 — ratio 3.0x',           time: '6m ago' },
    ]);
  }, []);

  const allSegs      = corridors.flatMap(c => c.segments || []);
  const totalDemand  = allSegs.reduce((s, x) => s + (x.demandCount || 0), 0);
  const totalDrivers = allSegs.reduce((s, x) => s + (x.driverCount || 0), 0);
  const surgeCount   = allSegs.filter(s => s.densityLevel === 'SURGE').length;

  const selectedSegs   = selected?.segments || [];
  const maxD           = Math.max(...selectedSegs.map(s => s.demandCount), 1);

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}>Eco<span style={{ color: '#fff' }}>Cab</span></div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 4px 4px' }}>Corridors</div>
        {corridors.map(c => (
          <button key={c.id} onClick={() => setSelected(c)} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', borderRadius: 8, border: 'none', background: selected?.id === c.id ? 'rgba(232,133,10,0.15)' : 'rgba(255,255,255,0.04)', color: selected?.id === c.id ? '#E8850A' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'Syne, sans-serif', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700 }}>{c.code}</span>
            <span style={{ fontSize: 11 }}>{c.name}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.15)', padding: '12px 4px 0' }}>OPS · Patna Pilot</div>
      </aside>

      <div style={S.main}>
        <div style={S.topbar}>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>Operations Centre</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', marginTop: 2 }}>Patna Pilot — All corridors</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EAF3DE', color: '#3B6D11', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6D11' }} />LIVE
          </div>
        </div>

        <div style={S.content}>
          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* KPIs */}
            <div style={S.card}>
              <div style={S.cardTitle}>Network KPIs</div>
              <div style={S.kpiGrid}>
                {[['Active demand', totalDemand, '#E8850A'], ['Online drivers', totalDrivers, '#0f0e0e'], ['Surge segments', surgeCount, '#A32D2D'], ['Avg ratio', totalDrivers ? (totalDemand / totalDrivers).toFixed(1) + 'x' : '—', '#185FA5']].map(([l, v, c]) => (
                  <div key={l} style={S.kpi}><div style={S.kpiLabel}>{l}</div><div style={{ ...S.kpiVal, color: c }}>{v}</div></div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div style={S.card}>
              <div style={S.cardTitle}>Live Alerts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {alerts.map(a => {
                  const cfg = DENSITY_CONFIG[a.level] || DENSITY_CONFIG.MEDIUM;
                  return (
                    <div key={a.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: cfg.bg, borderRadius: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{a.msg}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: cfg.color, opacity: 0.65, marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
            {/* All corridors mini heatmaps */}
            <div style={S.card}>
              <div style={S.cardTitle}>All Corridors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {corridors.map(c => {
                  const segs  = c.segments || [];
                  const maxDc = Math.max(...segs.map(s => s.demandCount), 1);
                  const hasSurge = segs.some(s => s.densityLevel === 'SURGE');
                  return (
                    <div key={c.id} onClick={() => setSelected(c)} style={{ padding: '12px 14px', background: selected?.id === c.id ? '#FAEEDA' : '#F7F5F0', border: `1.5px solid ${selected?.id === c.id ? '#E8850A' : 'transparent'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700 }}>{c.code}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                        </div>
                        {hasSurge && <DensityPill level="SURGE" />}
                      </div>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 32 }}>
                        {segs.map((s, i) => {
                          const cfg = DENSITY_CONFIG[s.densityLevel] || DENSITY_CONFIG.EMPTY;
                          const pct = Math.max(4, (s.demandCount / maxDc) * 100);
                          return <div key={i} style={{ flex: 1, height: `${pct}%`, background: cfg.bar, borderRadius: '2px 2px 0 0', minHeight: 3 }} />;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected corridor detail table */}
            {selected && (
              <div style={S.card}>
                <div style={S.cardTitle}>{selected.code} · Segment Detail</div>
                {/* Nodes */}
                <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                  {selectedSegs.map((s, i) => {
                    const cfg = DENSITY_CONFIG[s.densityLevel] || DENSITY_CONFIG.EMPTY;
                    return (
                      <div key={i} style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 10, background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: cfg.color, opacity: 0.7 }}>S{i}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: cfg.color }}>{s.demandCount}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['Seg', 'Demand', 'Drivers', 'Ratio', 'Density'].map(h => (
                      <th key={h} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid rgba(15,14,14,0.08)' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {selectedSegs.map(s => (
                      <tr key={s.segmentIndex} style={{ transition: 'background 0.1s' }}>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, padding: '10px', borderBottom: '1px solid rgba(15,14,14,0.06)', fontSize: 13 }}>S{s.segmentIndex}</td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, padding: '10px', borderBottom: '1px solid rgba(15,14,14,0.06)', fontSize: 13, color: s.demandCount > 8 ? '#A32D2D' : '#0f0e0e' }}>{s.demandCount}</td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', padding: '10px', borderBottom: '1px solid rgba(15,14,14,0.06)', fontSize: 13 }}>{s.driverCount}</td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', padding: '10px', borderBottom: '1px solid rgba(15,14,14,0.06)', fontSize: 13 }}>{s.driverCount > 0 ? (s.demandCount / s.driverCount).toFixed(1) + 'x' : '∞'}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid rgba(15,14,14,0.06)' }}><DensityPill level={s.densityLevel} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}