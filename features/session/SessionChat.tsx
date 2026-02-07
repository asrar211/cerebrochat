"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DEFAULT_SCALE_OPTIONS } from "@/lib/scale";
import { requestJson, ApiClientError } from "@/lib/api/client";
import type { QuestionOption, SessionQuestionPayload } from "@/types/session";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAutoScroll } from "@/hooks/useAutoScroll";

type Message = {
  role: "bot" | "user";
  text: string;
};

export default function SessionChat() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<QuestionOption[]>([]);
  const [meta, setMeta] = useState<Pick<
    SessionQuestionPayload,
    "currentIndex" | "total" | "status"
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useAutoScroll([messages.length]);

  const progressLabel = useMemo(() => {
    if (!meta?.total) return "Screening";
    return `Question ${meta.currentIndex} of ${meta.total}`;
  }, [meta]);

  const loadQuestion = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await requestJson<SessionQuestionPayload>(
        `/api/session?sessionId=${sessionId}`
      );

      setMeta({
        currentIndex: data.currentIndex,
        total: data.total,
        status: data.status,
      });

      if (data.status === "completed") {
        router.push(`/session/${sessionId}/result`);
        return;
      }

      const question = data.question;

      if (!question) {
        setError("No question available right now.");
        return;
      }

      if (question.id !== currentQuestionId) {
        setCurrentQuestionId(question.id);
        const options =
          question.options && question.options.length > 0
            ? question.options
            : DEFAULT_SCALE_OPTIONS;
        setCurrentOptions(options);
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: question.text },
        ]);
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to load the next question");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadQuestion();
    }
  }, [sessionId]);

  const submitAnswer = async (option: QuestionOption) => {
    if (!currentQuestionId || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: option.label,
      },
    ]);

    setLoading(true);

    try {
      await requestJson<{ status: string }>("/api/session/answer", {
        method: "POST",
        body: {
          sessionId,
          questionId: currentQuestionId,
          option: option.value,
        },
      });

      await loadQuestion();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to submit your answer");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--app-bg)]">
      <div className="border-b border-emerald-100 bg-white/70 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <p className="text-sm font-semibold text-emerald-900">{progressLabel}</p>
          {meta?.total ? (
            <span className="text-xs text-emerald-700/80">
              {Math.round((meta.currentIndex / meta.total) * 100)}% complete
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {error ? <Alert>{error}</Alert> : null}

        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              msg.role === "bot"
                ? "bg-white text-emerald-900"
                : "ml-auto bg-emerald-700 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && messages.length > 0 ? (
          <div className="max-w-[70%] rounded-2xl bg-white px-4 py-3 text-sm text-emerald-800 shadow-sm">
            <div className="flex items-center gap-3">
              {/* <span className="text-xs uppercase tracking-[0.2em] text-emerald-500">
                Typing
              </span> */}
              <div className="typing-dots flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>
        ) : null}

        {loading && !messages.length ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-emerald-100 bg-white/90 px-4 py-4">
        <div className="mx-auto grid w-full max-w-3xl gap-2">
          {currentQuestionId ? (
            currentOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="secondary"
                className="w-full justify-start"
                disabled={loading}
                onClick={() => submitAnswer(opt)}
              >
                {opt.label}
              </Button>
            ))
          ) : (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700">
              Loading your next question.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
