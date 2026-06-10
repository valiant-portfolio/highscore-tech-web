// Server-only reads against audit_log.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface AuditEntry {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  diff: Record<string, { before: unknown; after: unknown }> | null;
  notes: string | null;
  created_at: string;
}

export interface AuditFilters {
  action?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  limit?: number;
}

export async function listAudit(filters: AuditFilters = {}): Promise<AuditEntry[]> {
  const supabase = serviceClient();
  let q = supabase
    .from('audit_log')
    .select('id, actor_user_id, actor_email, action, target_type, target_id, target_label, diff, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 200);
  if (filters.action)     q = q.eq('action', filters.action);
  if (filters.actorEmail) q = q.eq('actor_email', filters.actorEmail);
  if (filters.targetType) q = q.eq('target_type', filters.targetType);
  const { data } = await q;
  return (data ?? []) as AuditEntry[];
}

export async function listAuditActions(): Promise<string[]> {
  const supabase = serviceClient();
  const { data } = await supabase
    .from('audit_log')
    .select('action')
    .limit(2000);
  const set = new Set<string>();
  for (const r of data ?? []) set.add(r.action as string);
  return Array.from(set).sort();
}

export async function listAuditActors(): Promise<string[]> {
  const supabase = serviceClient();
  const { data } = await supabase
    .from('audit_log')
    .select('actor_email')
    .not('actor_email', 'is', null)
    .limit(2000);
  const set = new Set<string>();
  for (const r of data ?? []) if (r.actor_email) set.add(r.actor_email as string);
  return Array.from(set).sort();
}
