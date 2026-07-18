-- Read-only access for a frontend dashboard.
--
-- The bot writes with the service_role key, which bypasses RLS. By default the
-- bot_* tables have RLS on with NO policy, so the anon/authenticated keys (what a
-- browser uses) can read nothing. Apply this file to let a frontend READ the
-- dashboard tables. Nothing here grants write access.
--
--   ⚠  SECURITY: these policies make the listed tables publicly readable to anyone
--      holding your project's anon key + URL. That is normal for a public
--      read-only dashboard, but do NOT apply it if the data must stay private.
--      It exposes trading activity only — never touches your app's users/payments.
--
-- Apply: Supabase dashboard > SQL editor > paste > run. Safe to re-run.

-- The live per-market snapshot — the main thing a dashboard renders.
drop policy if exists bot_market_state_read on bot_market_state;
create policy bot_market_state_read on bot_market_state
    for select using (true);

-- Trade history + equity curve, for a fuller dashboard. Comment out if unwanted.
drop policy if exists bot_trades_read on bot_trades;
create policy bot_trades_read on bot_trades
    for select using (true);

drop policy if exists bot_equity_read on bot_equity_snapshots;
create policy bot_equity_read on bot_equity_snapshots
    for select using (true);

-- Grant the anon/authenticated roles SELECT on the reporting views too.
grant select on bot_market_state, bot_trades, bot_equity_snapshots to anon, authenticated;
grant select on bot_v_daily_pnl, bot_v_open_positions to anon, authenticated;
