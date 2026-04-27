import { useState, useEffect, useRef, useCallback } from 'react';
import { listCorridors, registerDriver, updateDriverStatus, updateLocation, getCorridorHeatmap, startTrip, recordPickup, endTrip } from '../api/client';
import { DEMO_CORRIDORS, DEMO_SEGMENTS, DENSITY_CONFIG, GUIDANCE_CONFIG, URGENCY_BG } from '../config/constants';
import GuidanceBanner from '../components/common/GuidanceBanner';
import useWebSocket from '../hooks/useWebSocket';

const S = {
  shell: { display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', fontFamily: 'Syne, sans-serif' },
  sidebar: { background: '#0a0909', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 12, position: 'sticky', top: 0, height: '100vh', borderRight: '1px solid rgba(255,255,255,0.05)' },
  logo: { fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: '#fff', padding: '8px 12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 },
  main: { background: '#F7F5F0', display: 'flex', flexDirection: 'column' },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', background: '#fff', borderBottom: '1px solid rgba(15,14,14,0.08)', position: 'sticky', top: 0, zIndex: 10 },
  content: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' },
  card: { background: '#fff', border: '1px solid rgba(15,14,14,0.08)', borderRadius: 14, padding: 20 },
  cardTitle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(15,14,14,0.5)', marginBottom: 14 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 },
  statCard: { background: '#F7F5F0', borderRadius: 10, padding: 14 },
  statLabel: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' },
  statVal: { fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 700, lineHeight: 1, marginTop: 4 },
  btn: (v) => ({ padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.15s', ...(v === 'saffron' ? { background: '#E8850A', color: '#fff' } : v === 'ghost' ? { background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', color: '#fff' } : v === 'danger' ? { background: '#FCEBEB', color: '#A32D2D', border: '1px solid #F09595' } : { background: '#fff', border: '1.5px solid rgba(15,14,14,0.12)', color: '#0f0e0e' }) }),
};

export default function DriverView({ user }) {
  const [step,        setStep]        = useState('register'); // register | offline | online
  const [driver,      setDriver]      = useState(null);
  const [corridors,   setCorridors]   = useState([]);
  const [selCorridor, setSelCorridor] = useState(null);
  const [heatmap,     setHeatmap]     = useState(null);
  const [guidance,    setGuidance]    = useState(null);
  const [trip,        setTrip]        = useState(null);
  const [error,       setError]       = useState(null);
  const [regForm,     setRegForm]     = useState({ name: user.name, phoneNumber: '', vehicleNumber: '', vehicleType: 'AUTO' });
  const pingRef = useRef(null);

  useEffect(() => {
    listCorridors().then(setCorridors).catch(() => setCorridors(DEMO_CORRIDORS));
  }, []);

  const onWsMessage = useCallback((msg) => {
    if (msg.type === 'HEATMAP_UPDATE') setHeatmap(msg.heatmap);
    if (msg.type === 'SEGMENT_UPDATE') setHeatmap(prev => {
      if (!prev) return prev;
      return { ...prev, segments: prev.segments.map(s => s.segmentIndex === msg.segmentIndex ? { ...s, demandCount: msg.demandCount } : s) };
    });
  }, []);
  useWebSocket(driver?.id, selCorridor?.code, onWsMessage);

  const register = async () => {
    try {
      const d = await registerDriver(regForm);
      setDriver(d);
    } catch {
      setDriver({ id: 'demo-driver-' + Date.now(), ...regForm, status: 'OFFLINE' });
    }
    setStep('offline');
  };

  const goOnline = async () => {
    if (!selCorridor) return;
    try { await updateDriverStatus(driver.id, 'ONLINE', selCorridor.id); } catch {}
    setStep('online');
    loadHeatmap();
    pingRef.current = setInterval(pingLocation, 10000);
  };

  const goOffline = async () => {
    clearInterval(pingRef.current);
    try { await updateDriverStatus(driver.id, 'OFFLINE'); } catch {}
    setStep('offline'); setGuidance(null); setHeatmap(null); setTrip(null);
  };

  const loadHeatmap = async () => {
    try {
      const h = await getCorridorHeatmap(driver.id);
      if (h?.segments?.length) { setHeatmap(h); return; }
    } catch {}
    setHeatmap({ corridorId: selCorridor?.id, corridorCode: selCorridor?.code, totalSegments: selCorridor?.totalSegments || 8, segments: DEMO_SEGMENTS(selCorridor?.totalSegments || 8) });
  };

  const pingLocation = async () => {
    try {
      const resp = await updateLocation(driver.id, 25.5941 + Math.random() * 0.01, 85.1376 + Math.random() * 0.01, 20 + Math.random() * 15);
      setGuidance(resp);
    } catch {
      const actions = ['CONTINUE', 'SPEED_UP', 'SURGE_FORWARD'];
      const action  = actions[Math.floor(Math.random() * actions.length)];
      setGuidance({ currentSegmentIndex: Math.floor(Math.random() * 8), demandAhead: Math.floor(Math.random() * 20), driversAhead: Math.floor(Math.random() * 3), guidance: action, recommendedSegment: Math.floor(Math.random() * 8), guidanceReason: action === 'SURGE_FORWARD' ? 'High demand ahead — rush forward' : 'Demand balanced, maintain pace', urgency: action === 'SURGE_FORWARD' ? 'HIGH' : 'NONE' });
      loadHeatmap();
    }
  };

  useEffect(() => () => clearInterval(pingRef.current), []);

  const doStartTrip  = async () => { try { setTrip(await startTrip(driver.id)); } catch { setTrip({ id: 'demo-trip', status: 'IN_PROGRESS', passengersPickedUp: 0 }); } };
  const doPickup     = async () => { try { setTrip(await recordPickup(driver.id, trip.id)); } catch { setTrip(t => ({ ...t, passengersPickedUp: (t.passengersPickedUp || 0) + 1 })); } };
  const doEndTrip    = async () => { try { await endTrip(driver.id, trip.id); } catch {} setTrip(null); };

  const maxD = heatmap ? Math.max(...heatmap.segments.map(s => s.demandCount), 1) : 1;

  /* ── Register step ── */
  if (step === 'register') return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.logo}>Eco<span style={{ color: '#E8850A' }}>Cab</span></div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: 12, marginTop: 'auto' }}>DRIVER MODE</div>
      </aside>
      <div style={{ ...S.main, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...S.card, width: '100%', maxWidth: 460 }}>
          <div style={S.cardTitle}>Driver Registration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['Full Name', 'name', 'text', 'Sujal Arya'], ['Phone Number', 'phoneNumber', 'tel', '9800000000'], ['Vehicle Number', 'vehicleNumber', 'text', 'BR01AB1234']].map(([label, key, type, ph]) => (
              <div key={key}>
                <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5 }}>{label}</label>
                <input type={type} value={regForm[key]} placeholder={ph}
                  onChange={e => setRegForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(15,14,14,0.12)', fontFamily: 'Syne, sans-serif', fontSize: 14, outline: 'none' }} />
              </div>
            ))}
            <div>
              <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5 }}>Vehicle Type</label>
              <select value={regForm.vehicleType} onChange={e => setRegForm(f => ({ ...f, vehicleType: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid rgba(15,14,14,0.12)', fontFamily: 'Syne, sans-serif', fontSize: 14 }}>
                <option value="AUTO">Auto</option>
                <option value="E_RICKSHAW">E-Rickshaw</option>
                <option value="MINI_BUS">Mini Bus</option>
              </select>
            </div>
            <button onClick={register} style={{ ...S.btn('saffron'), width: '100%', padding: '12px', fontSize: 15 }}>Register & Continue</button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Sidebar shared ── */
  const Sidebar = () => (
    <aside style={S.sidebar}>
      <div style={S.logo}>Eco<span style={{ color: '#E8850A' }}>Cab</span></div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px', marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{driver?.name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{regForm.vehicleNumber} · {regForm.vehicleType}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: step === 'online' ? '#97C459' : '#888' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: step === 'online' ? '#97C459' : '#888' }}>{step === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
      {step === 'offline' && (
        <>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 4px 4px' }}>Select corridor</div>
          {corridors.map(c => (
            <button key={c.id} onClick={() => setSelCorridor(c)} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 12px', borderRadius: 8, border: 'none', background: selCorridor?.id === c.id ? 'rgba(232,133,10,0.15)' : 'rgba(255,255,255,0.04)', color: selCorridor?.id === c.id ? '#E8850A' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'Syne, sans-serif', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700 }}>{c.code}</span>
              <span style={{ fontSize: 11 }}>{c.name}</span>
            </button>
          ))}
          <button onClick={goOnline} disabled={!selCorridor} style={{ ...S.btn('saffron'), marginTop: 8, opacity: selCorridor ? 1 : 0.4 }}>Go Online</button>
        </>
      )}
      {step === 'online' && (
        <>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Corridor</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#E8850A', marginTop: 2 }}>{selCorridor?.code}</div>
          </div>
          {!trip ? <button onClick={doStartTrip} style={S.btn('saffron')}>Start Trip</button>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Picked up</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#E8850A' }}>{trip.passengersPickedUp || 0}</div>
                </div>
                <button onClick={doPickup} style={{ ...S.btn('ghost'), fontSize: 12 }}>+ Passenger</button>
                <button onClick={doEndTrip} style={{ ...S.btn('ghost'), color: '#F09595', fontSize: 12 }}>End Trip</button>
              </div>
            )
          }
          <div style={{ flex: 1 }} />
          <button onClick={goOffline} style={{ ...S.btn('ghost'), fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Go Offline</button>
        </>
      )}
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.15)', padding: '12px 4px 0' }}>DRIVER · {user.name}</div>
    </aside>
  );

  return (
    <div style={S.shell}>
      <Sidebar />
      <div style={S.main}>
        <div style={S.topbar}>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>Driver Dashboard</div><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#888', marginTop: 2 }}>{ step === 'online' ? `Online · ${selCorridor?.code}` : 'Go online to see demand' }</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: step === 'online' ? '#EAF3DE' : '#F1EFE8', color: step === 'online' ? '#3B6D11' : '#888', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, padding: '5px 10px', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            {step === 'online' ? 'LIVE' : 'OFFLINE'}
          </div>
        </div>
        <div style={S.content}>
          {step === 'offline' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 64, color: '#888' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, opacity: 0.15 }}>🛺</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Select a corridor and go online</span>
              <span style={{ fontSize: 13 }}>Pick a corridor from the sidebar to start seeing live demand</span>
            </div>
          )}
          {step === 'online' && guidance && <GuidanceBanner guidance={guidance.guidance} reason={guidance.guidanceReason} urgency={guidance.urgency || 'NONE'} />}
          {step === 'online' && guidance && (
            <div style={S.statGrid}>
              {[['Segment', guidance.currentSegmentIndex, '#0f0e0e'], ['Demand ahead', guidance.demandAhead, '#E8850A'], ['Drivers ahead', guidance.driversAhead, '#0f0e0e'], ['Go to seg', guidance.recommendedSegment, '#185FA5']].map(([l, v, c]) => (
                <div key={l} style={S.statCard}><div style={S.statLabel}>{l}</div><div style={{ ...S.statVal, color: c }}>{v}</div></div>
              ))}
            </div>
          )}
          {step === 'online' && heatmap && (
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={S.cardTitle}>{heatmap.corridorCode} · Demand heatmap</div>
                <button onClick={loadHeatmap} style={{ ...S.btn('outline'), fontSize: 12, padding: '5px 12px' }}>↻ Refresh</button>
              </div>
              {/* Node row */}
              <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 4 }}>
                {heatmap.segments.map((s, i) => {
                  const cfg = DENSITY_CONFIG[s.densityLevel] || DENSITY_CONFIG.EMPTY;
                  const isCurrent = guidance?.currentSegmentIndex === i;
                  const isRec     = guidance?.recommendedSegment === i;
                  return (
                    <div key={i} style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 10, background: cfg.bg, border: `${isCurrent ? 2 : 1.5}px ${isRec ? 'dashed' : 'solid'} ${isCurrent || isRec ? cfg.color : cfg.bg}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, position: 'relative' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700, color: cfg.color, opacity: 0.7 }}>S{i}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: cfg.color }}>{s.demandCount}</span>
                      {s.densityLevel === 'SURGE' && <span style={{ position: 'absolute', top: -5, right: -5, background: '#E24B4A', color: '#fff', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 4 }}>!</span>}
                    </div>
                  );
                })}
              </div>
              {/* Bar chart */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56, marginTop: 12 }}>
                {heatmap.segments.map((s, i) => {
                  const cfg = DENSITY_CONFIG[s.densityLevel] || DENSITY_CONFIG.EMPTY;
                  const pct = Math.max(5, (s.demandCount / maxD) * 100);
                  const isCurrent = guidance?.currentSegmentIndex === i;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${pct}%`, background: cfg.bar, borderRadius: '3px 3px 0 0', outline: isCurrent ? `2px solid ${cfg.color}` : 'none', outlineOffset: 2 }} />
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#888' }}>{s.demandCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {step === 'online' && !guidance && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 48, color: '#888' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, opacity: 0.15 }}>⬡</span>
              <span style={{ fontSize: 14 }}>Waiting for first GPS ping…</span>
              <button onClick={pingLocation} style={{ ...S.btn('outline'), padding: '8px 16px' }}>Simulate ping</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}