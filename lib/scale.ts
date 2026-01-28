// Stable identifiers (never change)
export enum ScaleOption {
  NOT_AT_ALL = "not_at_all",
  SEVERAL_DAYS = "several_days",
  MORE_THAN_HALF = "more_than_half",
  NEARLY_EVERY_DAY = "nearly_every_day",
}

// Numeric meaning (PHQ-9 / GAD-7 compliant)
export const SCALE_SCORE_MAP: Record<ScaleOption, number> = {
  [ScaleOption.NOT_AT_ALL]: 0,
  [ScaleOption.SEVERAL_DAYS]: 1,
  [ScaleOption.MORE_THAN_HALF]: 2,
  [ScaleOption.NEARLY_EVERY_DAY]: 3,
};

// UI labels (safe to change / localize)
export const SCALE_LABELS: Record<ScaleOption, string> = {
  [ScaleOption.NOT_AT_ALL]: "Not at all",
  [ScaleOption.SEVERAL_DAYS]: "Several days",
  [ScaleOption.MORE_THAN_HALF]: "More than half the days",
  [ScaleOption.NEARLY_EVERY_DAY]: "Nearly every day",
};
