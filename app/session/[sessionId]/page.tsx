"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ScaleOption, SCALE_LABELS } from "@/lib/scale";

type Question = {
  _id: string;
  text: string;
  category: string;
};

type Message = {
  role: "bot" | "user";
  text: string;
};

export default function SessionPage() {
  const router = useRouter();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // 🔹 Auto-scroll anchor
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Load current question
  const loadQuestion = async () => {
    try {
      const res = await axios.get(
        `/api/session?sessionId=${sessionId}`
      );

      const data = res.data;

      if (data.message === "Test completed") {
        setCompleted(true);
        return;
      }

      setCurrentQuestion(data);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.text },
      ]);
    } catch (error) {
      console.error("Failed to load question", error);
    }
  };

  // Initial load
  useEffect(() => {
    if (sessionId) {
      loadQuestion();
    }
  }, [sessionId]);

  // 🔹 Auto-scroll when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Submit selected scale option
  const submitAnswer = async (option: ScaleOption) => {
    if (!currentQuestion || loading) return;

    setLoading(true);

    // Show user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: SCALE_LABELS[option],
      },
    ]);

    try {
      await axios.post("/api/session/answer", {
        sessionId,
        questionId: currentQuestion._id,
        option,
      });

      setCurrentQuestion(null);
      await loadQuestion();
    } catch (error) {
      console.error("Failed to submit answer", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Redirect on completion (safe)
  useEffect(() => {
    if (completed) {
      router.push(`/session/${sessionId}/result`);
    }
  }, [completed, router, sessionId]);

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* Chat area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-xl px-4 py-2 text-sm leading-relaxed ${
              msg.role === "bot"
                ? "bg-neutral-200 text-neutral-800"
                : "ml-auto bg-green-600 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* 👇 Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scale options */}
      {currentQuestion && (
        <div className="border-t bg-white p-3">
          <div className="grid grid-cols-1 gap-2">
            {Object.values(ScaleOption).map((opt) => (
              <button
                key={opt}
                disabled={loading}
                onClick={() => submitAnswer(opt)}
                className="rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-600 hover:text-white disabled:opacity-50"
              >
                {SCALE_LABELS[opt]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
