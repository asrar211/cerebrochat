"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { requestJson, ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

type DashboardPanelProps = {
  userName?: string | null;
};

export default function DashboardPanel({ userName }: DashboardPanelProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const startSession = async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await requestJson<{ sessionId: string }>("/api/session", {
        method: "POST",
      });

      router.push(`/session/${data.sessionId}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-(--app-bg) px-4">
      <Link
        href="/profile"
        className="absolute right-4 top-4 rounded-full border border-emerald-100 bg-white p-2 shadow-sm"
        aria-label="View profile"
      >
        <CircleUserRound className="h-5 w-5 text-emerald-700" />
      </Link>

      <Card className="w-full max-w-lg space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Welcome{userName ? `, ${userName}` : ""}
          </p>
          <h1 className="text-2xl font-semibold text-emerald-950">
            Before you start
          </h1>
          <p className="text-sm text-emerald-800/80">
            This screening takes about 5 minutes. Answer honestly for the most
            helpful summary.
          </p>
        </div>

        {error ? <Alert>{error}</Alert> : null}

        <ul className="space-y-2 text-sm text-emerald-800/80">
          <li>Not a clinical diagnosis, only an educational screening.</li>
          <li>Your responses are private and used only for this session.</li>
          <li>Pause anytime and return later.</li>
          <li>Results highlight trends, not definitive outcomes.</li>
        </ul>

        <div className="flex items-start gap-3 text-sm text-emerald-800/80">
          <input
            type="checkbox"
            id="terms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-emerald-200 text-emerald-700"
          />
          <label htmlFor="terms">
            I agree to the{" "}
            <Link href="/" className="font-semibold text-emerald-800 underline">
              Terms & Conditions
            </Link>
          </label>
        </div>

        <Button
          onClick={startSession}
          disabled={!accepted || loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Starting
            </span>
          ) : (
            "Start screening"
          )}
        </Button>
      </Card>
    </div>
  );
}
