export type DisorderKey =
  | "depression"
  | "anxiety"
  | "stress"
  | "sleep"
  | "burnout";

export const DISORDER_CONFIG: Record<
  DisorderKey,
  {
    label: string;
    testName: string;
    severity: (score: number) => string;
  }
> = {
  depression: {
    label: "Depression",
    testName: "PHQ-9",
    severity: (score) => {
      if (score <= 4) return "Minimal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      if (score <= 19) return "Moderately Severe";
      return "Severe";
    },
  },

  anxiety: {
    label: "Anxiety",
    testName: "GAD-7",
    severity: (score) => {
      if (score <= 4) return "Minimal";
      if (score <= 9) return "Mild";
      if (score <= 14) return "Moderate";
      return "Severe";
    },
  },

  stress: {
    label: "Stress",
    testName: "PSS",
    severity: (score) => {
      if (score <= 3) return "Low";
      if (score <= 6) return "Moderate";
      return "High";
    },
  },

  sleep: {
    label: "Sleep Disturbance",
    testName: "ISI",
    severity: (score) => {
      if (score <= 2) return "Minimal";
      if (score <= 5) return "Mild";
      return "Significant";
    },
  },

  burnout: {
    label: "Burnout",
    testName: "MBI",
    severity: (score) => {
      if (score <= 3) return "Low";
      if (score <= 6) return "Moderate";
      return "High";
    },
  },
};
