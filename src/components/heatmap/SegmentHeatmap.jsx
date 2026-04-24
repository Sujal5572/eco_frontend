import { DENSITY_CONFIG } from "../../config/constants";

export default function SegmentHeatmap({ segments = [] }) {
  const max = Math.max(...segments.map(s => s.demandCount || 0), 1);

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {segments.map((s, i) => {
        const cfg = DENSITY_CONFIG[s.densityLevel];
        const height = (s.demandCount / max) * 100;

        return (
          <div
            key={i}
            style={{
              width: 20,
              height: `${height}%`,
              background: cfg.bar
            }}
          />
        );
      })}
    </div>
  );
}