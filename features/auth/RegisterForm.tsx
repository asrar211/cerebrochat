"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validation/schemas";
import { zodErrorsToFieldMap } from "@/lib/validation/format";
import { requestJson, ApiClientError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldMap(parsed.error));
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await requestJson<{ userId: string }>("/api/auth/register", {
        method: "POST",
        body: parsed.data,
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof ApiClientError) {
        setFormError(error.message);
        if (error.fieldErrors) {
          setFieldErrors(error.fieldErrors);
        }
      } else {
        setFormError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError ? <Alert>{formError}</Alert> : null}

      <TextField
        label="Full name"
        name="name"
        type="text"
        value={form.name}
        onChange={handleChange}
        placeholder="Jordan Patel"
        autoComplete="name"
        error={fieldErrors.name}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@company.com"
        autoComplete="email"
        error={fieldErrors.email}
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        hint="Use at least 8 characters for stronger security."
        error={fieldErrors.password}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Creating account
          </span>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
