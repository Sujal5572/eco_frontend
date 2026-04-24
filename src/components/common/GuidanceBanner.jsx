import { GUIDANCE_CONFIG } from "../../config/constants";

export default function GuidanceBanner({ guidance, reason, urgency }) {
  if (!guidance) return null;

  const cfg = GUIDANCE_CONFIG[guidance] || {
    color: "#555",
    icon: "→",
    label: guidance
  };

  return (
    <div
      style={{
        border: `2px solid ${cfg.color}`,
        padding: "10px",
        borderRadius: "8px",
        margin: "10px 0",
        background: "#f9f9f9"
      }}
    >
      <strong style={{ color: cfg.color }}>
        {cfg.icon} {cfg.label}
      </strong>
      <div>{reason}</div>
      <small>Urgency: {urgency}</small>
    </div>
  );
}