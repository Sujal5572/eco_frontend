export const WS = "ws://localhost:8080";

export const DENSITY_CONFIG = {
  EMPTY:  { color: "#888780", bg: "#F1EFE8", label: "Empty",  bar: "#D3D1C7" },
  LOW:    { color: "#3B6D11", bg: "#EAF3DE", label: "Low",    bar: "#97C459" },
  MEDIUM: { color: "#185FA5", bg: "#E6F1FB", label: "Medium", bar: "#378ADD" },
  HIGH:   { color: "#854F0B", bg: "#FAEEDA", label: "High",   bar: "#EF9F27" },
  SURGE:  { color: "#A32D2D", bg: "#FCEBEB", label: "Surge",  bar: "#E24B4A" },
};

export const GUIDANCE_CONFIG = {
  CONTINUE: { color: "#3B6D11", icon: "→", label: "Continue" },
  SPEED_UP: { color: "#185FA5", icon: "↑", label: "Speed Up" },
  SLOW_DOWN: { color: "#854F0B", icon: "↓", label: "Slow Down" },
  SURGE_FORWARD: { color: "#A32D2D", icon: "⚡", label: "Surge Forward" },
};