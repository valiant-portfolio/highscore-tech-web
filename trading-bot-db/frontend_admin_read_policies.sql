-- Admin-only browser reads for the trading-bot dashboard.
--
-- Why this exists: the dashboard used to read the bot_* tables through Next.js
-- API routes (server-side, service_role). On Netlify every one of those routes
-- is a Function, and the live chart polled one every ~1.5s — a major driver of
-- the Functions-limit overage. Moving those reads into the browser (anon key +
-- the logged-in user's session) removes the routes entirely: Supabase alone,
-- no Netlify Function per tick.
--
-- Privacy is PRESERVED. Unlike frontend_read_policies.sql (which makes the data
-- public), this grants SELECT only to a logged-in user whose public.users row is
-- an admin, or a staff member with 'trading-bot' in admin_sections. Everyone
-- else — including anonymous visitors holding the anon key — still reads nothing.
-- The service_role bot writer is unaffected (it bypasses RLS).
--
-- Apply: Supabase dashboard > SQL editor > paste > run. Safe to re-run.

-- Who may view the trading data. SECURITY DEFINER so the policy can read
-- public.users regardless of that table's own RLS. STABLE + no row dependency
-- means it's evaluated once per query, not per row.
create or replace function public.is_bot_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and (u.role = 'admin' or 'trading-bot' = any(coalesce(u.admin_sections, '{}')))
  );
$$;

grant execute on function public.is_bot_viewer() to authenticated;

-- Apply the read policy to every table the dashboard reads from the browser.
-- RLS is force-enabled first so a table that somehow had it off can't leak.
do $$
declare
  t text;
  tables text[] := array[
    'bot_bars', 'bot_trades', 'bot_quotes', 'bot_market_state',
    'bot_symbols', 'bot_symbol_config', 'bot_equity_snapshots'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is null then
      continue; -- table not present in this project; skip
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_bot_viewer())',
      t || '_admin_read', t
    );
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;
