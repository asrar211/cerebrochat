import type { DisorderKey } from "@/types/disorder";

export type QuestionOption = {
  value: string;
  label: string;
  score: number;
};

export type QuestionDTO = {
  id: string;
  text: string;
  category: DisorderKey;
  type: "scale";
  options?: QuestionOption[];
};

export type SessionQuestionPayload = {
  status: "in_progress" | "completed";
  question: QuestionDTO | null;
  currentIndex: number;
  total: number;
};

export type SessionResultItem = {
  key: DisorderKey;
  label: string;
  testName: string;
  score: number;
  severity: string;
  normalizedScore: number;
};

export type SessionResultPayload = {
  results: SessionResultItem[];
  dominant: SessionResultItem | null;
  safetyFlag: boolean;
};
