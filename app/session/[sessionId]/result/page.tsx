"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ScreeningResult = {
  depression: {
    score: number;
    severity: string;
  };
  anxiety: {
    score: number;
    severity: string;
  };
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

  const dominant =
  result.depression.score >= result.anxiety.score
    ? {
        title: "Depression (PHQ-9)",
        score: result.depression.score,
        severity: result.depression.severity,
      }
    : {
        title: "Anxiety (GAD-7)",
        score: result.anxiety.score,
        severity: result.anxiety.severity,
      }
      ;
      const hasNoSymptoms =
  result.depression.score === 0 &&
  result.anxiety.score === 0;
  return (
    <div className="flex h-dvh flex-col items-center justify-center px-4 text-center space-y-6">
      <h1 className="text-2xl font-semibold text-green-700">
        Screening Summary
      </h1>

      {hasNoSymptoms ? (
  <div className="w-full max-w-sm space-y-4">
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold text-green-700">
        No Significant Symptoms Detected
      </h2>
      <p className="text-sm text-neutral-600 mt-2">
        Your responses do not indicate notable symptoms of anxiety or depression
        based on this screening.
      </p>
    </div>
  </div>
) : (
  <div className="w-full max-w-sm space-y-4">
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold">{dominant.title}</h2>
      <p className="text-lg font-bold text-green-700">
        {dominant.severity}
      </p>
      <p className="text-sm text-neutral-600">
        Score: {dominant.score}
      </p>
    </div>
  </div>
)}



      <p className="text-xs text-neutral-500 max-w-md">
        These results are based on standardized screening questionnaires
        (PHQ-9 and GAD-7). They are not a medical diagnosis.
        If you feel distressed, please consult a qualified mental health
        professional.
      </p>
    </div>
  );
}
