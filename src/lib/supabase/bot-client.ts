// Browser client for the TRADING BOT's Supabase project.
//
// The app's own browser client (@/lib/supabase/client) points at the main
// project — users, staff, payments. The bot_* tables live in a separate project,
// so anything reading them from the browser needs this one instead.
//
// Note there is no cross-project session: the logged-in user's token is issued
// by the main project, so `auth.uid()` is always null here. Reads therefore
// depend on the bot project's own RLS policies, not on who is logged in.

import { createBrowserClient } from '@supabase/ssr';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultDb = any;

export const createBotClient = <D = DefaultDb>() =>
  createBrowserClient<D>(
    process.env.NEXT_PUBLIC_BOT_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_BOT_SUPABASE_ANON_KEY!,
  );
