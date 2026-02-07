import { z } from "zod";
import { DISORDER_KEYS } from "@/types/disorder";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be at most 80 characters"),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(320, "Email is too long")
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be at most 80 characters"),
    age: z
      .union([
        z
          .number()
          .int("Age must be a whole number")
          .min(18, "Age must be at least 18")
          .max(120, "Age must be 120 or less"),
        z.null(),
      ])
      .optional(),
    gender: z.enum(["male", "female"]).nullable().optional(),
  })
  .strict();

export const questionSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(5, "Question text is too short")
      .max(500, "Question text is too long"),
    category: z.enum(DISORDER_KEYS),
    type: z.literal("scale").default("scale"),
    order: z
      .number()
      .int("Order must be a whole number")
      .min(0, "Order must be 0 or greater"),
    weight: z
      .number()
      .min(0.5, "Weight must be at least 0.5")
      .max(2, "Weight must be at most 2")
      .optional(),
    isActive: z.boolean().optional(),
    options: z
      .array(
        z.object({
          value: z.string().trim().min(1, "Option value is required"),
          label: z.string().trim().min(1, "Option label is required"),
          score: z
            .number()
            .int("Score must be a whole number")
            .min(0, "Score must be at least 0")
            .max(4, "Score must be at most 4"),
        })
      )
      .min(2, "Provide at least two options")
      .optional(),
  })
  .strict();

export const questionInputSchema = z.union([
  questionSchema,
  z.array(questionSchema).min(1, "Provide at least one question"),
]);

export const sessionQuerySchema = z
  .object({
    sessionId: objectId,
  })
  .strict();

export const sessionsQuerySchema = z
  .object({
    limit: z
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(50, "Limit must be 50 or less")
      .optional(),
  })
  .strict();

export const answerSchema = z
  .object({
    sessionId: objectId,
    questionId: objectId,
    option: z.string().min(1, "Option is required"),
  })
  .strict();
