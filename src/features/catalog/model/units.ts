/** Units offered while typing (any other may be typed). */
export const COMMON_UNITS = [
  "un",
  "cx",
  "pct",
  "kg",
  "g",
  "L",
  "mL",
  "m",
  "m²",
  "m³",
  "par",
  "rolo",
  "galão",
  "saco",
  "serviço",
  "hora",
  "mês",
] as const;

export const UNIT_OPTIONS = COMMON_UNITS.map((unit) => ({
  value: unit,
  label: unit,
}));
