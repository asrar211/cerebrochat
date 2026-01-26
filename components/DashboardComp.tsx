"use client"

import { CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardComp() {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="flex h-dvh flex-col items-center justify-center px-4 text-center">
      <Link href="/profile">
        <button className="absolute right-3 top-0 rounded-full bg-white p-1 shadow">
          <CircleUserRound />
        </button>
      </Link>

      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-green-700">
          Before You Start
        </h1>

        <ul className="list-disc space-y-2 text-left text-sm text-neutral-700 pl-5">
          <li>This session is not a clinical diagnosis.</li>
          <li>Your answers should be honest for better results.</li>
          <li>Results are for awareness purposes only.</li>
          <li>Your data will remain private and secure.</li>
        </ul>

        <div className="flex items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            id="terms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-green-600"
          />
          <label htmlFor="terms">
            I agree to the{" "}
            <Link href="/" className="text-green-600 underline">
              Terms & Conditions
            </Link>
          </label>
        </div>

        <button
          disabled={!accepted}
          className={`w-full rounded-full px-4 py-2 text-sm font-semibold shadow-md transition
            ${
              accepted
                ? "cursor-pointer bg-green-600 text-white hover:bg-green-700"
                : "cursor-not-allowed bg-green-200 text-green-700"
            }
          `}
        >
          Start Your Session
        </button>
      </div>
    </div>
    )
};
