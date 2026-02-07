import { DisorderKey } from "@/types/disorder";

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
    testName: "PSS-10",
    severity: (score) => {
      if (score <= 13) return "Low";
      if (score <= 26) return "Moderate";
      return "High";
    },
  },

  adhd: {
    label: "ADHD",
    testName: "ASRS v1.1",
    severity: (score) => {
      if (score >= 4) return "Positive screen";
      return "Negative screen";
    },
  },

  ocd: {
    label: "Obsessive-Compulsive Disorder",
    testName: "Y-BOCS",
    severity: (score) => {
      if (score <= 7) return "Subclinical";
      if (score <= 15) return "Mild";
      if (score <= 23) return "Moderate";
      if (score <= 31) return "Severe";
      return "Extreme";
    },
  },
};
