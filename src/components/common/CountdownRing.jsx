export default function CountdownRing({ minutesLeft, maxMinutes = 30 }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = minutesLeft / maxMinutes;
  const offset = circ * (1 - pct);

  return (
    <svg width="80" height="80">
      <circle cx="40" cy="40" r={r} stroke="#eee" strokeWidth="6" fill="none" />
      <circle
        cx="40"
        cy="40"
        r={r}
        stroke="orange"
        strokeWidth="6"
        fill="none"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  );
}