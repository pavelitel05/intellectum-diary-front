export function gradeTone(value: number, max: number): "high" | "mid" | "low" {
  const ratio = value / max;
  if (ratio >= 0.7) return "high";
  // if (ratio >= 0.5) return "mid";
  return "low";
}
