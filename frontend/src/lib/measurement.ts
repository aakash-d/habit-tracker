import { Measurement } from "./types";

export interface CountMeasurement {
  type: "count";
  target: number;
  unit: string;
  direction: "atLeast" | "atMost";
}

/** Returns the count config if this habit is measurable, else null. */
export function asCount(
  measurement?: Measurement | null
): CountMeasurement | null {
  if (!measurement || measurement.type !== "count") return null;
  return measurement;
}

/** Short label, e.g. "2 L" or "max 2 cups". */
export function measurementLabel(measurement?: Measurement | null): string | null {
  const m = asCount(measurement);
  if (!m) return null;
  return m.direction === "atMost"
    ? `max ${m.target} ${m.unit}`
    : `${m.target} ${m.unit}`;
}