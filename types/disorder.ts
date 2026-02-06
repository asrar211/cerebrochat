export const DISORDER_KEYS = [
  "depression",
  "anxiety",
  "stress",
  "adhd",
  "ocd",
] as const;

export type DisorderKey = (typeof DISORDER_KEYS)[number];
