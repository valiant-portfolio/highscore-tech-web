-- =============================================================================
-- wipe.sql — Full data + user reset for the Highscore Tech schema
-- =============================================================================
-- Clears every row from every public table this app owns AND every Supabase
-- Auth user. Schema, types, functions, RLS, triggers all survive.
--
-- Paste into the Supabase SQL editor and run.
--
-- After it finishes you have an empty database. To restart:
--   1. Open the app and sign up fresh via /signup.
--   2. Run seed.sql to (re)populate portfolio + promote yourself to admin.
-- =============================================================================

-- 1. Truncate every app table. CASCADE clears FK-dependent rows in order;
--    RESTART IDENTITY resets any sequences.
TRUNCATE
  contact_messages,
  payments,
  installments,
  enrollments,
  course_modules,
  courses,
  portfolio_projects,
  staff,
  users
RESTART IDENTITY CASCADE;

-- 2. Clear Supabase Auth. `public.users.id` is FK'd to auth.users(id) ON
--    DELETE CASCADE — we already truncated public.users; this empties the
--    auth side and cascades through auth.identities / auth.sessions /
--    auth.refresh_tokens.
DELETE FROM auth.users;

-- 3. Confirm — every count should read 0.
SELECT 'users'              AS table_name, COUNT(*) FROM users
UNION ALL SELECT 'staff',              COUNT(*) FROM staff
UNION ALL SELECT 'portfolio_projects', COUNT(*) FROM portfolio_projects
UNION ALL SELECT 'courses',            COUNT(*) FROM courses
UNION ALL SELECT 'course_modules',     COUNT(*) FROM course_modules
UNION ALL SELECT 'enrollments',        COUNT(*) FROM enrollments
UNION ALL SELECT 'installments',       COUNT(*) FROM installments
UNION ALL SELECT 'payments',           COUNT(*) FROM payments
UNION ALL SELECT 'contact_messages',   COUNT(*) FROM contact_messages
UNION ALL SELECT 'auth.users',         COUNT(*) FROM auth.users;
