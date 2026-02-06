"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation/schemas";
import { zodErrorsToFieldMap } from "@/lib/validation/format";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldMap(parsed.error));
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const res = await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setFormError(res?.error);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError ? <Alert>{formError}</Alert> : null}

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
        placeholder="Your password"
        autoComplete="current-password"
        error={fieldErrors.password}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Spinner />
            Signing in
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
