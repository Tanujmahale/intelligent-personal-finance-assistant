import { z } from "zod";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/types";

export const categoryEnum = z.enum(
  EXPENSE_CATEGORIES as [string, ...string[]]
);
export const paymentMethodEnum = z.enum(
  PAYMENT_METHODS as [string, ...string[]]
);

/** Validates manual expense form submissions (client + server). */
export const newExpenseSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive")
    .max(10_000_000, "Amount seems unrealistically large"),
  category: categoryEnum,
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(280, "Description is too long"),
  expense_date: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Date must be valid"),
  payment_method: paymentMethodEnum,
  source: z.enum(["manual", "ai"]).optional(),
});

export const updateExpenseSchema = newExpenseSchema.partial();

/**
 * Validates Gemini's structured extraction output BEFORE it is ever shown
 * as "trusted" or written to the database. If this fails, the UI falls back
 * to manual entry with whatever fields did parse pre-filled where possible.
 */
export const extractedExpenseSchema = z.object({
  amount: z.number().min(0),
  category: categoryEnum,
  description: z.string().trim().min(1).max(280),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  payment_method: paymentMethodEnum,
  confidence: z.enum(["high", "medium", "low"]),
});

export const categorizationSchema = z.object({
  category: categoryEnum,
  confidence: z.enum(["high", "medium", "low"]),
});

export const budgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  amount: z.number().min(0).max(100_000_000),
});

export const chatRequestSchema = z.object({
  question: z.string().trim().min(1, "Please enter a question").max(500),
});

export const aiSummarySchema = z.object({
  narrative: z.string(),
  observations: z.array(z.string()).max(10),
  suggestions: z.array(z.string()).max(10),
});

export type NewExpenseFormValues = z.infer<typeof newExpenseSchema>;
