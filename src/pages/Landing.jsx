import { useState } from 'react';
import { DEMO_SEGMENTS, DENSITY_CONFIG } from '../config/constants';

const ROLES = [
  { id: 'PASSENGER', emoji: '🧍', title: 'Passenger', desc: 'Signal intent, board anywhere on the corridor' },
  { id: 'DRIVER',    emoji: '🛺', title: 'Driver',    desc: 'See live demand heatmap, earn more per trip' },
  { id: 'OPS',       emoji: '📡', title: 'Operations', desc: 'Monitor all corridors in real time' },
];

const demoSegs = DEMO_SEGMENTS(8);

export default function Landing({ onEnter }) {
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const proceed = () => {
    if (!role || !name.trim()) return;
    onEnter({ role, name: name.trim(), phone });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'Syne, sans-serif' }}>

      {/* ── Left panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px', gap: 32, background: '#F7F5F0' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888' }}>
          EcoCab · Patna Pilot 2025
        </div>

        <div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,58px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Shared autos,<br /><span style={{ color: '#E8850A' }}>smarter</span> corridors.
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 400 }}>
            No driver assignment, no surge pricing. Passengers signal demand — drivers follow the heatmap. The corridor self-organises.
          </p>
        </div>

        {/* Role selector */}
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>
            I am a —
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${role === r.id ? '#E8850A' : '#E2DED5'}`,
                background: role === r.id ? '#FAEEDA' : '#fff',
                fontFamily: 'Syne, sans-serif', textAlign: 'left', width: '100%',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 22 }}>{r.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Name + phone + CTA */}
        {role && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5 }}>Name *</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Sujal Arya"
                  onKeyDown={e => e.key === 'Enter' && proceed()}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2DED5', fontFamily: 'Syne, sans-serif', fontSize: 14, outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 5 }}>Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX" maxLength={10}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2DED5', fontFamily: 'Syne, sans-serif', fontSize: 14, outline: 'none' }} />
              </div>
            </div>
            <button onClick={proceed} disabled={!name.trim()} style={{
              padding: '13px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: name.trim() ? '#E8850A' : '#ddd', color: '#fff',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
              transition: 'all 0.15s', opacity: name.trim() ? 1 : 0.5,
            }}>
              Enter as {ROLES.find(r => r.id === role)?.title} →
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel — live preview ── */}
      <div style={{ background: '#0f0e0e', padding: '64px', display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: '#E8850A', opacity: 0.04, top: -100, right: -100 }} />

        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
          GG_GM Corridor · Live preview
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 20 }}>
          <div style={{ fontWeight: 700, color: '#fff', marginBottom: 14, fontSize: 14 }}>Gai Ghat → Gandhi Maidan</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 80 }}>
            {demoSegs.map((s, i) => {
              const cfg = DENSITY_CONFIG[s.densityLevel];
              const pct = Math.max(8, (s.demandCount / 14) * 100);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: `${pct}%`, background: cfg.bar, borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{i}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {[['38', 'Waiting'], ['12', 'Drivers'], ['3.2x', 'Avg ratio']].map(([v, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 12px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#fff' }}>{v}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        <div>
          {[
            { t: '2m ago', m: 'SURGE at GG_GM segment 3 — 14 waiting, 1 driver' },
            { t: '4m ago', m: 'Driver RK moved to segment 4' },
            { t: '6m ago', m: 'New signal: PJ_BR segment 2' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', marginTop: 2 }}>{a.t}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{a.m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}