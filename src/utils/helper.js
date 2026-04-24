export function classifyDensity(ratio) {
  if (ratio === 0) return "EMPTY";
  if (ratio < 1) return "LOW";
  if (ratio < 3) return "MEDIUM";
  if (ratio < 6) return "HIGH";
  return "SURGE";
}