"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const { sessionId } = useParams<{ sessionId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Fetch current question
  const loadQuestion = async () => {
    const res = await fetch(`/api/session?sessionId=${sessionId}`);
    const data = await res.json();

    if (data.message === "Test completed") {
      setCompleted(true);
      return;
    }

    setCurrentQuestion(data);
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: data.text },
    ]);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const submitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return;

    setLoading(true);

    // Show user message
    setMessages((prev) => [
      ...prev,
      { role: "user", text: answer },
    ]);

    await fetch("/api/session/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        questionId: currentQuestion._id,
        answer,
      }),
    });

    setAnswer("");
    setCurrentQuestion(null);
    setLoading(false);

    // Load next question
    loadQuestion();
  };

  if (completed) {
    return (
      <div className="flex h-dvh items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-semibold text-green-700">
            Session Completed
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Thank you for completing the assessment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Chat Area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.role === "bot"
                ? "bg-neutral-100 text-neutral-800"
                : "ml-auto bg-green-600 text-white"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={submitAnswer}
            disabled={loading}
            className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-green-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
