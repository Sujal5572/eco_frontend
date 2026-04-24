import { DENSITY_CONFIG } from "../../config/constants";

export default function DensityPill({ level }) {
  const c = DENSITY_CONFIG[level] || DENSITY_CONFIG.EMPTY;

  return (
    <span style={{ background: c.bg, color: c.color, padding: "4px 8px", borderRadius: 12 }}>
      {c.label}
    </span>
  );
}