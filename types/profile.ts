import type { DisorderKey } from "@/types/disorder";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  gender: "male" | "female" | null;
  profileCompleted: boolean;
};

export type SessionDominant = {
  key: DisorderKey;
  label: string;
  severity: string;
  score: number;
  normalizedScore: number;
};

export type SessionSummary = {
  id: string;
  createdAt: string;
  status: "in_progress" | "completed";
  answersCount: number;
  totalQuestions: number;
  dominant: SessionDominant | null;
};

export type SessionsResponse = {
  sessions: SessionSummary[];
};
