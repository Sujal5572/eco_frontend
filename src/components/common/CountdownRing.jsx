export default function CountdownRing({ minutesLeft, maxMinutes = 30 }) {
  const r      = 32;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - minutesLeft / maxMinutes);

  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--ink-10,#eee)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r}
          fill="none" stroke="#E8850A" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700 }}>
          {minutesLeft}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#888', letterSpacing: '0.08em' }}>
          MIN
        </span>
      </div>
    </div>
  );
}