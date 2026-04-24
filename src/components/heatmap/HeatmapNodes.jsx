export default function HeatmapNodes({ segments = [] }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            padding: "6px",
            border: "1px solid #ccc",
            borderRadius: "6px"
          }}
        >
          {s.segmentIndex}
        </div>
      ))}
    </div>
  );
}