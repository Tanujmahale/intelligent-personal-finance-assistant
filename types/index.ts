export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Healthcare"
  | "Education"
  | "Travel"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

export type PaymentMethod =
  | "Cash"
  | "Card"
  | "UPI"
  | "Net Banking"
  | "Wallet"
  | "Unknown";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "Card",
  "UPI",
  "Net Banking",
  "Wallet",
  "Unknown",
];

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  expense_date: string; // ISO date (YYYY-MM-DD)
  payment_method: PaymentMethod;
  source: "manual" | "ai";
  created_at: string;
  updated_at: string;
}

export type NewExpenseInput = {
  amount: number;
  category: ExpenseCategory;
  description: string;
  expense_date: string;
  payment_method: PaymentMethod;
  source?: "manual" | "ai";
};

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export type BudgetStatus = "Under Budget" | "Near Limit" | "Over Budget";

export interface CategoryBreakdown {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrendPoint {
  month: string; // "Jan 2026"
  total: number;
}

export interface AnalyticsSummary {
  totalSpending: number;
  transactionCount: number;
  averageDailySpending: number;
  highestExpense: Expense | null;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendPoint[];
}

export interface DashboardData {
  totalSpendingThisMonth: number;
  monthlyBudget: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
  budgetStatus: BudgetStatus;
  transactionCount: number;
  topCategory: CategoryBreakdown | null;
  recentTransactions: Expense[];
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendPoint[];
}

export interface ExtractedExpense {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO date
  payment_method: PaymentMethod;
  confidence: "high" | "medium" | "low";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiSummaryResult {
  narrative: string;
  observations: string[];
  suggestions: string[];
}

export type ApiError = { error: string };
