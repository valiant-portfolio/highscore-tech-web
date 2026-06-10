// Adds the staff.work_email column + index to a live database and updates
// the handle_new_user trigger to auto-promote matched-email signups to
// staff role. Idempotent.

import { Client } from 'pg';

if (!process.env.DATABASE_URL) { console.error('✗ DATABASE_URL required'); process.exit(1); }

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

console.log('• Adding staff.work_email column…');
await client.query(`
  ALTER TABLE staff ADD COLUMN IF NOT EXISTS work_email TEXT;
  CREATE UNIQUE INDEX IF NOT EXISTS staff_work_email_unique ON staff (work_email)
    WHERE work_email IS NOT NULL;
`);
console.log('  ✓ Column ready.');

console.log('• Replacing handle_new_user() trigger…');
await client.query(`
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
  AS $fn$
  DECLARE
    matched_staff_id UUID;
  BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;

    SELECT id INTO matched_staff_id
      FROM public.staff
     WHERE work_email = NEW.email AND status = 'active'
     LIMIT 1;

    IF matched_staff_id IS NOT NULL THEN
      UPDATE public.users SET role = 'staff' WHERE id = NEW.id;
      UPDATE public.staff SET user_id = NEW.id WHERE id = matched_staff_id;
    END IF;

    RETURN NEW;
  END;
  $fn$;
`);
console.log('  ✓ Trigger updated.');

console.log('\n✓ Done. Re-run seed.sql to populate work_email values.');

await client.end();
