-- ============================================================================
-- Demo / seed data — Intelligent Personal Finance Assistant
-- Safe to re-run: it upserts the demo profile and clears only that user's
-- previous demo expenses/budget before inserting fresh sample rows.
-- ============================================================================

-- Fixed demo user id (matches NEXT_PUBLIC_DEMO_USER_ID in .env.example)
insert into public.profiles (id, display_name, currency)
values ('00000000-0000-0000-0000-000000000001', 'Demo User', 'INR')
on conflict (id) do nothing;

delete from public.expenses where user_id = '00000000-0000-0000-0000-000000000001';
delete from public.budgets where user_id = '00000000-0000-0000-0000-000000000001';

insert into public.budgets (user_id, month, year, amount)
values (
  '00000000-0000-0000-0000-000000000001',
  extract(month from current_date)::int,
  extract(year from current_date)::int,
  25000
)
on conflict (user_id, month, year) do update set amount = excluded.amount;

-- Realistic, clearly-labelled DEMO expenses across the current month.
-- (These are illustrative sample values, not real personal financial data.)
insert into public.expenses (user_id, amount, category, description, expense_date, payment_method, source)
values
  ('00000000-0000-0000-0000-000000000001', 320.00, 'Food', 'Groceries - weekly shop (demo)', date_trunc('month', current_date) + interval '1 day', 'UPI', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 450.00, 'Food', 'Dinner at restaurant (demo)', date_trunc('month', current_date) + interval '2 day', 'Card', 'ai'),
  ('00000000-0000-0000-0000-000000000001', 180.00, 'Transport', 'Cab ride to office (demo)', date_trunc('month', current_date) + interval '2 day', 'UPI', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 2500.00, 'Shopping', 'New pair of shoes (demo)', date_trunc('month', current_date) + interval '3 day', 'Card', 'ai'),
  ('00000000-0000-0000-0000-000000000001', 999.00, 'Entertainment', 'Movie tickets + snacks (demo)', date_trunc('month', current_date) + interval '4 day', 'UPI', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 3200.00, 'Bills', 'Electricity bill (demo)', date_trunc('month', current_date) + interval '5 day', 'Net Banking', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 1200.00, 'Healthcare', 'Pharmacy + consultation (demo)', date_trunc('month', current_date) + interval '6 day', 'Cash', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 1500.00, 'Education', 'Online course subscription (demo)', date_trunc('month', current_date) + interval '7 day', 'Card', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 640.00, 'Transport', 'Fuel top-up (demo)', date_trunc('month', current_date) + interval '8 day', 'Card', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 275.00, 'Food', 'Lunch with colleagues (demo)', date_trunc('month', current_date) + interval '9 day', 'UPI', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 5200.00, 'Travel', 'Weekend trip - train + stay (demo)', date_trunc('month', current_date) + interval '10 day', 'Net Banking', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 350.00, 'Entertainment', 'Streaming subscriptions (demo)', date_trunc('month', current_date) + interval '11 day', 'Card', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 420.00, 'Food', 'Groceries top-up (demo)', date_trunc('month', current_date) + interval '13 day', 'UPI', 'manual'),
  ('00000000-0000-0000-0000-000000000001', 150.00, 'Other', 'Miscellaneous purchase (demo)', date_trunc('month', current_date) + interval '14 day', 'Cash', 'manual');
