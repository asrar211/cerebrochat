"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type DisorderResult = {
  key: string;
  label: string;
  score: number;
  severity: string;
};

type ScreeningResult = {
  results: DisorderResult[];
  dominant: DisorderResult | null;
};

export default function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session");
      setLoading(false);
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await axios.get(
          `/api/session/result?sessionId=${sessionId}`
        );
        setResult(res.data);
      } catch (err) {
        setError("Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        Loading…
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-red-600">
        {error ?? "Something went wrong"}
      </div>
    );
  }

  const hasNoSymptoms = result.results.every(
    (r) => r.score === 0
  );

  return (
    <div className="flex h-dvh flex-col items-center justify-center px-4 text-center space-y-6">
      <h1 className="text-2xl font-semibold text-green-700">
        Screening Summary
      </h1>

      {hasNoSymptoms ? (
        <div className="w-full max-w-sm">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold text-green-700">
              No Significant Symptoms Detected
            </h2>
            <p className="text-sm text-neutral-600 mt-2">
              Your responses do not indicate elevated screening symptoms
              based on this assessment.
            </p>
          </div>
        </div>
      ) : result.dominant ? (
        <div className="w-full max-w-sm">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold">
              {result.dominant.label}
            </h2>
            <p className="text-lg font-bold text-green-700">
              {result.dominant.severity}
            </p>
            <p className="text-sm text-neutral-600">
              Score: {result.dominant.score}
            </p>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-neutral-500 max-w-md">
        These results are based on standardized screening questionnaires.
        They are not a medical diagnosis.
        If you feel distressed, please consult a qualified mental health
        professional.
      </p>
    </div>
  );
}
