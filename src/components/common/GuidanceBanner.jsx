import { GUIDANCE_CONFIG, URGENCY_BG } from '../../config/constants';

export default function GuidanceBanner({ guidance, reason, urgency }) {
  if (!guidance) return null;
  const cfg  = GUIDANCE_CONFIG[guidance] || { icon: '→', label: guidance, color: '#555' };
  const bg   = URGENCY_BG[urgency]       || '#F1EFE8';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: bg, borderRadius: 12, padding: '14px 18px',
      border: `1.5px solid ${cfg.color}22`, marginBottom: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: cfg.color + '18', color: cfg.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      }}>
        {cfg.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: cfg.color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', fontSize: 13 }}>
          {cfg.label}
        </div>
        <div style={{ fontSize: 13, color: cfg.color, opacity: 0.75, marginTop: 2 }}>
          {reason || 'Maintaining current pace.'}
        </div>
      </div>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 20,
        background: cfg.color + '18', color: cfg.color,
      }}>
        {urgency}
      </span>
    </div>
  );
}