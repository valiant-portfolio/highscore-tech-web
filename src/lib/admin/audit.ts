'use server';

// Audit logger. Every admin mutation calls this so we keep an immutable
// record of who did what, when, to which row, and how it changed. RLS on
// audit_log denies any UPDATE/DELETE, so even a future code bug can't
// rewrite history.
//
// Note: `computeDiff` is a sync utility and lives in ./audit-helpers.ts
// because 'use server' files can only export async functions.

import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { serviceClient } from '@/lib/supabase/service';

export interface AuditPayload {
  action: string;
  targetType?: string;
  targetId?: string | null;
  targetLabel?: string | null;
  diff?: Record<string, { before: unknown; after: unknown }>;
  notes?: string;
}

export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = serviceClient();

    await admin.from('audit_log').insert({
      actor_user_id: user?.id ?? null,
      actor_email:   user?.email ?? null,
      action:        payload.action,
      target_type:   payload.targetType ?? null,
      target_id:     payload.targetId  ?? null,
      target_label:  payload.targetLabel ?? null,
      diff:          payload.diff ?? null,
      notes:         payload.notes ?? null,
    });
  } catch (err) {
    // Audit failures must never block the actual mutation.
    console.error('[audit] insert failed:', err);
  }
}
