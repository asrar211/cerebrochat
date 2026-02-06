"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { requestJson, ApiClientError } from "@/lib/api/client";
import type { SessionResultPayload } from "@/types/session";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export default function ResultSummary() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [result, setResult] = useState<SessionResultPayload | null>(null);
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
        const data = await requestJson<SessionResultPayload>(
          `/api/session/result?sessionId=${sessionId}`
        );
        setResult(data);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message);
        } else {
          setError("Failed to load results");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  const dominant = useMemo(() => result?.dominant ?? null, [result]);
  const hasNoSymptoms = useMemo(
    () => result?.results.every((item) => item.score === 0) ?? false,
    [result]
  );

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-(--app-bg) px-4">
        <Card className="w-full max-w-xl space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-(--app-bg) px-4">
        <Card className="w-full max-w-xl space-y-4">
          <Alert>{error ?? "Something went wrong"}</Alert>
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Return to dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-(--app-bg) px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-emerald-950">
            Screening Summary
          </h1>
          <p className="text-sm text-emerald-800/80">
            A brief snapshot of your responses based on standardized tools.
          </p>
        </div>

        {hasNoSymptoms ? (
          <Card>
            <h2 className="text-lg font-semibold text-emerald-900">
              No significant symptoms detected
            </h2>
            <p className="mt-2 text-sm text-emerald-800/80">
              Your responses did not indicate elevated screening symptoms in any
              category.
            </p>
          </Card>
        ) : dominant ? (
          <Card>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
              Primary signal
            </p>
            <h2 className="mt-2 text-xl font-semibold text-emerald-950">
              {dominant.label}
            </h2>
            <p className="text-sm text-emerald-800/80">
              Screening tool: {dominant.testName}
            </p>
            <p className="mt-3 text-2xl font-semibold text-emerald-800">
              {dominant.severity}
            </p>
            <p className="text-sm text-emerald-800/80">
              Score: {dominant.score}
            </p>
          </Card>
        ) : null}

        <Card>
          <h3 className="text-base font-semibold text-emerald-950">
            All categories
          </h3>
          <div className="mt-4 grid gap-3">
            {result.results.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-emerald-700/80">
                    {item.testName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-900">
                    {item.severity}
                  </p>
                  <p className="text-xs text-emerald-700/80">{item.score}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 text-sm text-emerald-800/80">
          <p>
            These results are based on screening questionnaires (PHQ-9, GAD-7,
            PSS). They are not a clinical diagnosis.
          </p>
          <p>
            If you are feeling distressed, please consider reaching out to a
            qualified mental health professional.
          </p>
        </Card>

        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
