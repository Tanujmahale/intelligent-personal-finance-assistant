# Database

Supabase PostgreSQL. Full schema: `supabase/schema.sql`. Demo data:
`supabase/seed.sql` (also available as an in-app button and `npm run seed`).

## Tables

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | matches `auth.users.id` if you add Supabase Auth |
| display_name | text | |
| currency | text | default `INR` |
| created_at / updated_at | timestamptz | auto-managed |

### `expenses`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK -> profiles(id) | indexed |
| amount | numeric(12,2) | must be > 0 |
| category | text | constrained to the 9 fixed categories |
| description | text | |
| expense_date | date | indexed |
| payment_method | text | Cash / Card / UPI / Net Banking / Wallet / Unknown |
| source | text | `manual` or `ai` (how the row was created) |
| created_at / updated_at | timestamptz | auto-managed |

Indexes: `user_id`, `expense_date`, `category`, and a composite
`(user_id, expense_date desc)` for the common "recent transactions" query.

### `budgets`
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK -> profiles(id) | |
| month | int | 1-12 |
| year | int | |
| amount | numeric(12,2) | |
| created_at / updated_at | timestamptz | auto-managed |

Unique constraint on `(user_id, month, year)` — one budget row per user per
month, upserted from the Budget page.

## Row Level Security

RLS is enabled on all three tables with permissive `using (true)` policies,
because this version has no real Supabase Auth session to check `auth.uid()`
against — see `docs/ARCHITECTURE.md` for how to tighten this once you add
real authentication.
