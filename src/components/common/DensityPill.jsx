import { getDensityCfg } from '../../utils/helper';

export default function DensityPill({ level }) {
  const c = getDensityCfg(level);
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      textTransform: 'uppercase', padding: '3px 8px',
      borderRadius: 20, background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  );
}