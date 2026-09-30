# Project Overview

## Title
Intelligent Personal Finance Assistant Using Generative AI

## Purpose
An academic full-stack web application that helps a user understand and manage
personal spending. It combines a conventional expense-tracking CRUD app with
Generative AI (Google Gemini) for natural-language expense entry, automatic
categorization, a conversational financial assistant, and AI-written monthly
summaries.

## Problem Statement
Manually logging and categorizing expenses is tedious, and raw transaction
lists are hard to reason about. This project explores how generative AI can
reduce that friction (natural-language entry, categorization) and make
spending data more accessible (a conversational assistant, AI narrative
summaries) — while keeping the underlying numbers trustworthy by computing
every real calculation in application code, not inside the AI.

## Important Disclaimer
This is a **student project**, presented as a personal finance assistant.
It is **not** a professional financial advisor. AI-generated suggestions are
informational only, and the system prompts explicitly instruct Gemini not to
give regulated financial, investment, tax, or legal advice.

## Core Modules
1. Dashboard — monthly snapshot, budget progress, charts, recent transactions
2. Add Expense — manual form with validation
3. Natural-language expense entry — Gemini extraction + Zod validation + edit-before-save
4. Expense list — search, filter, sort, edit, delete
5. Analytics — category/trend/day-level breakdowns with Recharts
6. FinAI Assistant — chat grounded only in the user's stored expenses
7. AI Monthly Summary — code-calculated numbers + AI-written narrative
8. Budget management — set/track a monthly budget with status indicator
9. AI categorization — suggests a category for a typed description

## Who is "the user"?
This version uses a single fixed demo user (no login flow), which keeps setup
and deployment simple for a course submission. See `docs/ARCHITECTURE.md` for
how to evolve this into real multi-user Supabase Auth later.
