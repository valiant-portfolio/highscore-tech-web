'use server';

// Managing the Studio gallery — the pieces shown on studio.highzcore.tech/work.
//
// Work is hosted on YouTube and we store the link, so "uploading" here is
// pasting a URL. The video id is extracted and normalised on the way in, which
// means a malformed link is caught at the point someone pastes it rather than
// showing an empty player to a customer weeks later.

import { revalidatePath } from 'next/cache';
import { serviceClient } from '@/lib/supabase/service';
import { checkSection } from '@/lib/admin/access';
import { logAudit } from '@/lib/admin/audit';
import { youtubeId, youtubeWatchUrl, youtubeThumb } from '@/lib/studio/youtube';

export interface WorkFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

const SECTION = 'studio';

/** Both public pages that show the gallery. */
function refresh() {
  revalidatePath('/studio/work');
  revalidatePath('/studio');
  revalidatePath('/admin/studio/work');
}

export async function addStudioWorkAction(
  _prev: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  const access = await checkSection(SECTION);
  if (!access.ok) return { status: 'error', message: access.message };

  const title = String(formData.get('title') ?? '').trim();
  const rawUrl = String(formData.get('video_url') ?? '').trim();
  const client = String(formData.get('client') ?? '').trim() || null;
  const projectType = String(formData.get('project_type') ?? '').trim() || null;
  const summary = String(formData.get('summary') ?? '').trim() || null;
  const publish = formData.get('published') === 'on';

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'Give it a title.';
  const id = youtubeId(rawUrl);
  if (!rawUrl) fieldErrors.video_url = 'Paste the YouTube link.';
  else if (!id) fieldErrors.video_url = "That doesn't look like a YouTube link.";
  if (Object.keys(fieldErrors).length) {
    return { status: 'error', message: 'Fix the highlighted fields.', fieldErrors };
  }

  const admin = serviceClient();
  const { error } = await admin.from('studio_works').insert({
    title,
    client,
    project_type: projectType,
    summary,
    media_type: 'video',
    // Store the canonical watch URL, not whatever shape was pasted, so the
    // gallery renders consistently no matter where the link came from.
    video_url: youtubeWatchUrl(id!),
    poster_url: youtubeThumb(id!),
    published: publish,
  });
  if (error) return { status: 'error', message: error.message };

  await logAudit({ action: 'studio_work.add', targetType: 'studio_work', targetLabel: title });
  refresh();
  return { status: 'success', message: publish ? `“${title}” is live on the gallery.` : `“${title}” saved as a draft.` };
}

export async function toggleStudioWorkAction(id: string, published: boolean): Promise<void> {
  const access = await checkSection(SECTION);
  if (!access.ok) throw new Error(access.message);
  const admin = serviceClient();
  await admin.from('studio_works').update({ published }).eq('id', id);
  await logAudit({ action: published ? 'studio_work.publish' : 'studio_work.unpublish', targetType: 'studio_work', targetId: id });
  refresh();
}

export async function deleteStudioWorkAction(id: string): Promise<void> {
  const access = await checkSection(SECTION);
  if (!access.ok) throw new Error(access.message);
  const admin = serviceClient();
  await admin.from('studio_works').delete().eq('id', id);
  await logAudit({ action: 'studio_work.delete', targetType: 'studio_work', targetId: id });
  refresh();
}

/** Move a piece up or down the gallery. Lower sort_order shows first. */
export async function reorderStudioWorkAction(id: string, direction: 'up' | 'down'): Promise<void> {
  const access = await checkSection(SECTION);
  if (!access.ok) throw new Error(access.message);
  const admin = serviceClient();
  const { data: row } = await admin.from('studio_works').select('sort_order').eq('id', id).maybeSingle();
  if (!row) return;
  const next = (row.sort_order ?? 0) + (direction === 'up' ? -1 : 1);
  await admin.from('studio_works').update({ sort_order: next }).eq('id', id);
  refresh();
}
