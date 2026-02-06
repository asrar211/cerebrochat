"use client";

import { useEffect, useMemo, useState } from "react";
import { requestJson, ApiClientError } from "@/lib/api/client";
import type { SessionsResponse, SessionSummary, UserProfile } from "@/types/profile";
import { profileUpdateSchema } from "@/lib/validation/schemas";
import { zodErrorsToFieldMap } from "@/lib/validation/format";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";

const genderOptions = [
  { value: "", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const;

export default function ProfilePage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setProfileError(null);
      setSessionsError(null);

      const [profileResult, sessionsResult] = await Promise.allSettled([
        requestJson<UserProfile>("/api/profile"),
        requestJson<SessionsResponse>("/api/profile/sessions"),
      ]);

      if (profileResult.status === "fulfilled") {
        const profileData = profileResult.value;
        setForm({
          name: profileData.name,
          email: profileData.email,
          age: profileData.age ? String(profileData.age) : "",
          gender: profileData.gender ?? "",
        });
      } else {
        const error = profileResult.reason;
        if (error instanceof ApiClientError) {
          setProfileError(error.message);
        } else {
          setProfileError("Failed to load profile");
        }
      }

      if (sessionsResult.status === "fulfilled") {
        setSessions(sessionsResult.value.sessions);
      } else {
        const error = sessionsResult.reason;
        if (error instanceof ApiClientError) {
          setSessionsError(error.message);
        } else {
          setSessionsError("Failed to load sessions");
        }
      }

      setLoading(false);
    };

    load();
  }, []);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    setSaveMessage(null);
    setProfileError(null);

    const ageValue = form.age.trim();
    const age = ageValue === "" ? null : Number(ageValue);

    const payload = {
      name: form.name.trim(),
      age: ageValue === "" ? null : age,
      gender: form.gender ? (form.gender as "male" | "female") : null,
    };

    const parsed = profileUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldMap(parsed.error));
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const updated = await requestJson<UserProfile>("/api/profile", {
        method: "PUT",
        body: parsed.data,
      });

      setForm({
        name: updated.name,
        email: updated.email,
        age: updated.age ? String(updated.age) : "",
        gender: updated.gender ?? "",
      });
      setSaveMessage("Profile updated successfully.");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setProfileError(error.message);
        if (error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
        }
      } else {
        setProfileError("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-(--app-bg) px-6 py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </Card>
          <Card className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-(--app-bg) px-6 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-emerald-950">Profile</h1>
          <p className="text-sm text-emerald-800/80">
            Update your details and review your screening history.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-emerald-950">
                Personal details
              </h2>
              <p className="text-sm text-emerald-800/70">
                Keep your profile up to date. Your email is read-only.
              </p>
            </div>

            {profileError ? <Alert>{profileError}</Alert> : null}
            {saveMessage ? <Alert variant="info">{saveMessage}</Alert> : null}

            <div className="space-y-4">
              <TextField
                label="Full name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={fieldErrors.name}
              />

              <TextField
                label="Email"
                name="email"
                value={form.email}
                disabled
                className="bg-emerald-50 text-emerald-700"
              />

              <TextField
                label="Age"
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                placeholder="18"
                error={fieldErrors.age}
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="gender"
                  className="text-sm font-semibold text-emerald-950"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm text-emerald-950 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.gender ? (
                  <p className="text-xs font-medium text-rose-600">
                    {fieldErrors.gender}
                  </p>
                ) : null}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </Card>

          <Card className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-emerald-950">
                Your sessions
              </h2>
              <p className="text-sm text-emerald-800/70">
                Review past screenings or continue a session.
              </p>
            </div>

            {sessionsError ? <Alert>{sessionsError}</Alert> : null}

            {sessions.length === 0 ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-700">
                You have not started any sessions yet.
                <div className="mt-3">
                  <ButtonLink href="/dashboard" variant="secondary">
                    Start a screening
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((sessionItem) => {
                  const progressLabel = sessionItem.totalQuestions
                    ? `${sessionItem.answersCount}/${sessionItem.totalQuestions}`
                    : `${sessionItem.answersCount} answered`;
                  const createdAt = formatter.format(
                    new Date(sessionItem.createdAt)
                  );

                  return (
                    <div
                      key={sessionItem.id}
                      className="rounded-xl border border-emerald-100 bg-white px-4 py-4 shadow-sm"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-semibold text-emerald-900">
                            {createdAt}
                          </p>
                          <p className="text-xs text-emerald-700/70">
                            {progressLabel} answered
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            sessionItem.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {sessionItem.status === "completed"
                            ? "Completed"
                            : "In progress"}
                        </span>
                      </div>

                      {sessionItem.dominant ? (
                        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-800">
                          <span className="font-semibold">
                            {sessionItem.dominant.label}
                          </span>{" "}
                          · {sessionItem.dominant.severity} (score {sessionItem.dominant.score})
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3">
                        {sessionItem.status === "completed" ? (
                          <ButtonLink
                            href={`/session/${sessionItem.id}/result`}
                            variant="secondary"
                          >
                            View summary
                          </ButtonLink>
                        ) : (
                          <ButtonLink
                            href={`/session/${sessionItem.id}`}
                            variant="secondary"
                          >
                            Continue session
                          </ButtonLink>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
