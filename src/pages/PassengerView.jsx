import { useState, useEffect, useRef } from 'react';
import { listCorridors, getCorridorDemand, createDemandSignal, cancelDemandSignal } from '../api/client';
import { DEMO_CORRIDORS, DEMO_SEGMENTS, DENSITY_CONFIG } from '../config/constants';
import DensityPill from '../components/common/DensityPill';
import CountdownRing from '../components/common/CountdownRing';

const S = {
  shell: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: 'Syne, sans-serif' },
  sidebar: { background: '#0f0e0e', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 8, position: 'sticky', top: 0, height: '100vh' },
  logo: { fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: '#E8850A', padding: '8px 12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: active ? 'rgba(232,133,10,0.18)' : 'transparent', color: active ? '#E8850A' : 'rgba(255,255,255,0.45)', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }),
  main: { background: '#F7F5F0', display: 'flex', flexDirection: 'column' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', background: '#fff', borderBottom: '1px solid rgba(15,14,14,0.08)', position: 'sticky', top: 0, zIndex: 10 },
  content: { padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 },
  card: { background: '#fff', border: '1px solid rgba(15,14,14,0.08)', borderRadius: 14, padding: 22 },
  cardTitle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(15,14,14,0.5)', marginBottom: 16 },
  btn: (variant) => ({
    padding: '11px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, transition: 'all 0.15s', width: '100%',
    ...(variant === 'primary' ? { background: '#E8850A', color: '#fff' } :
        variant === 'danger'  ? { background: '#FCEBEB', color: '#A32D2D', border: '1px solid #F09595' } :
                                { background: 'transparent', color: '#0f0e0e', border: '1.5px solid rgba(15,14,14,0.12)' }),
  }),
};

export default function PassengerView({ user }) {
  const [corridors,  setCorridors]  = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [heatmap,    setHeatmap]    = useState(null);
  const [signal,     setSignal]     = useState(null);
  const [minutesLeft,setMinutes]    = useState(30);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    listCorridors().then(setCorridors).catch(() => setCorridors(DEMO_CORRIDORS));
  }, []);

  const selectCorridor = async (c) => {
    setSelected(c);
    setHeatmap(null);
    try {
      const h = await getCorridorDemand(c.id);
      setHeatmap(h?.segments?.length ? h : makeDemoHeatmap(c));
    } catch { setHeatmap(makeDemoHeatmap(c)); }
  };

  const makeDemoHeatmap = (c) => ({
    corridorId: c.id, corridorCode: c.code, totalSegments: c.totalSegments,
    segments: DEMO_SEGMENTS(c.totalSegments),
  });

  const sendSignal = async () => {
    setLoading(true); setError(null);
    try {
      const data = await createDemandSignal(user.id, selected.id, 25.5941, 85.1376);
      setSignal(data);
    } catch {
      setSignal({ signalId: 'demo-' + Date.now(), corridorId: selected.id, corridorCode: selected.code, segmentIndex: 3, currentDemandCount: 14, expiresAt: new Date(Date.now() + 30 * 60000).toISOString() });
      setError('Backend unavailable — showing demo signal');
    } finally {
      setLoading(false);
      setMinutes(30);
      timerRef.current = setInterval(() => setMinutes(m => { if (m <= 1) { clearInterval(timerRef.current); cancelSignal(); return 0; } return m - 1; }), 60000);
    }
  };

  const cancelSignal = async () => {
    clearInterval(timerRef.current);
    try { if (signal && user.id) await cancelDemandSignal(user.id, signal.signalId); } catch {}
    setSignal(null); setSelected(null); setHeatmap(null);
  };

  const maxDemand = heatmap ? Math.max(...heatmap.segments.map(s => s.demandCount), 1) : 1;

  if (signal) return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}>Eco<span style={{ color: '#fff' }}>Cab</span></div>
        <button style={S.navItem(true)}>📡 Active Signal</button>
        <div style={{ flex: 1 }} />
        <button style={{ ...S.navItem(false), color: 'rgba(255,255,255,0.25)' }} onClick={cancelSignal}>⟵ Exit</button>
      </aside>
      <div style={S.main}>
        <div style={S.topbar}>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>Signal Active</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', marginTop: 2 }}>{signal.corridorCode} · Segment {signal.segmentIndex}</div></div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EAF3DE', color: '#3B6D11', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B6D11', display: 'inline-block', animation: 'none' }} />LIVE
          </span>
        </div>
        <div style={{ ...S.content, alignItems: 'center', maxWidth: '100%', padding: '48px 32px' }}>
          {error && <div style={{ background: '#FAEEDA', color: '#854F0B', padding: '10px 16px', borderRadius: 8, fontSize: 13, border: '1px solid #EF9F27', width: '100%', maxWidth: 480 }}>{error}</div>}
          <div style={{ ...S.card, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📡</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Your signal is live</div>
              <div style={{ fontSize: 14, color: '#888', marginTop: 8, lineHeight: 1.6 }}>
                Stand anywhere on <strong>{signal.corridorCode}</strong>. Autos will stop for you.
              </div>
            </div>
            <CountdownRing minutesLeft={minutesLeft} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              {[['Segment', signal.segmentIndex], ['Demand here', signal.currentDemandCount]].map(([l, v]) => (
                <div key={l} style={{ background: '#F7F5F0', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>{l}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: l === 'Demand here' ? '#E8850A' : '#0f0e0e' }}>{v}</div>
                </div>
              ))}
            </div>
            <button style={{ ...S.btn('danger'), maxWidth: 200 }} onClick={cancelSignal}>Cancel Signal</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}>Eco<span style={{ color: '#fff' }}>Cab</span></div>
        <button style={S.navItem(true)}>🧍 Board</button>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: 12 }}>PASSENGER · {user.name}</div>
      </aside>
      <div style={S.main}>
        <div style={S.topbar}>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>Board a Corridor</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', marginTop: 2 }}>Welcome, {user.name}</div></div>
        </div>
        <div style={S.content}>

          <div style={S.card}>
            <div style={S.cardTitle}>Select Corridor</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {corridors.map(c => (
                <button key={c.id} onClick={() => selectCorridor(c)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: selected?.id === c.id ? '#FAEEDA' : '#F7F5F0',
                  border: `2px solid ${selected?.id === c.id ? '#E8850A' : 'transparent'}`,
                  borderRadius: 10, cursor: 'pointer', fontFamily: 'Syne, sans-serif', width: '100%', transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, background: 'rgba(15,14,14,0.08)', padding: '3px 8px', borderRadius: 5 }}>{c.code}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888' }}>{c.totalSegments} stops →</span>
                </button>
              ))}
            </div>
          </div>

          {heatmap && (
            <div style={S.card}>
              <div style={S.cardTitle}>Live Demand · {heatmap.corridorCode}</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 72 }}>
                {heatmap.segments.map((s, i) => {
                  const cfg = DENSITY_CONFIG[s.densityLevel] || DENSITY_CONFIG.EMPTY;
                  const pct = Math.max(6, (s.demandCount / maxDemand) * 100);
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${pct}%`, background: cfg.bar, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#888' }}>{i}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                {heatmap.segments.map((s, i) => <DensityPill key={i} level={s.densityLevel} />)}
              </div>
              <div style={{ height: 1, background: 'rgba(15,14,14,0.08)', margin: '16px 0' }} />
              <button style={S.btn('primary')} onClick={sendSignal} disabled={loading}>
                {loading ? 'Sending…' : '📡  Signal my intent to board'}
              </button>
            </div>
          )}

          {!selected && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 48, color: '#888' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, opacity: 0.2 }}>∴</span>
              <span style={{ fontSize: 14 }}>Choose a corridor above to see live demand</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}