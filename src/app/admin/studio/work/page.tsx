// The Studio gallery — what shows on studio.highzcore.tech/work.
//
// Pieces live on YouTube; we keep the link. Adding one is pasting a URL, which
// means no upload wait, no storage bill, and the video earns reach on YouTube
// while it sells for us here.

import Link from 'next/link';
import { ExternalLink, Eye, EyeOff, Trash2, ArrowUp, ArrowDown, Film } from 'lucide-react';
import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { StudioWorkForm } from '@/components/admin/StudioWorkForm';
import { serviceClient } from '@/lib/supabase/service';
import { youtubeId, youtubeThumb } from '@/lib/studio/youtube';
import {
  toggleStudioWorkAction, deleteStudioWorkAction, reorderStudioWorkAction,
} from '@/lib/studio/work-actions';

export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  title: string;
  client: string | null;
  project_type: string | null;
  summary: string | null;
  video_url: string | null;
  poster_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
}

async function listAll(): Promise<Row[]> {
  const admin = serviceClient();
  const { data } = await admin
    .from('studio_works')
    .select('id, title, client, project_type, summary, video_url, poster_url, published, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Row[];
}

export default async function AdminStudioWorkPage() {
  const works = await listAll();
  const live = works.filter((w) => w.published).length;

  return (
    <>
      <PageHead
        title="Studio gallery"
        description="The work shown on the Studio site. Paste a YouTube link to add a piece."
        back={{ href: '/admin/studio', label: 'Back to orders' }}
      />

      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-6 items-start">
        <AdminCard>
          <div className="p-5">
            <h2 className="font-semibold text-fg">Add a piece</h2>
            <p className="mt-1 mb-5 text-xs text-fg-muted leading-relaxed">
              Upload the video to YouTube first, then paste its link here.
            </p>
            <StudioWorkForm />
          </div>
        </AdminCard>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-fg-subtle">
            {works.length} piece{works.length === 1 ? '' : 's'} · {live} live
          </p>

          {works.length === 0 ? (
            <AdminCard>
              <div className="p-10 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <Film className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-fg">Nothing in the gallery yet.</h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-fg-muted leading-relaxed">
                  The gallery is what closes the sale — until a piece is here, the Studio
                  page tells visitors the work is still being uploaded.
                </p>
              </div>
            </AdminCard>
          ) : (
            <div className="space-y-3">
              {works.map((w) => {
                const vid = youtubeId(w.video_url);
                return (
                  <AdminCard key={w.id}>
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.poster_url ?? (vid ? youtubeThumb(vid) : '')}
                        alt=""
                        className="h-24 w-full sm:w-40 shrink-0 rounded-lg object-cover bg-bg-elevated"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-fg leading-tight">{w.title}</h3>
                          <span
                            className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-bold uppercase tracking-wide ${
                              w.published ? 'bg-success/15 text-success' : 'bg-surface-hover text-fg-subtle'
                            }`}
                          >
                            {w.published ? 'Live' : 'Draft'}
                          </span>
                          {w.project_type && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                              {w.project_type}
                            </span>
                          )}
                        </div>
                        {w.client && <p className="mt-0.5 text-xs text-fg-subtle">{w.client}</p>}
                        {w.summary && (
                          <p className="mt-1.5 text-sm text-fg-muted leading-relaxed line-clamp-2">{w.summary}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {w.video_url && (
                            <a
                              href={w.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-fg-muted hover:text-fg"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> Watch
                            </a>
                          )}

                          <form action={toggleStudioWorkAction.bind(null, w.id, !w.published)}>
                            <button
                              type="submit"
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-fg-muted hover:text-fg"
                            >
                              {w.published ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" /> Publish
                                </>
                              )}
                            </button>
                          </form>

                          <form action={reorderStudioWorkAction.bind(null, w.id, 'up')}>
                            <button
                              type="submit"
                              title="Move up"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                          </form>
                          <form action={reorderStudioWorkAction.bind(null, w.id, 'down')}>
                            <button
                              type="submit"
                              title="Move down"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </form>

                          <form action={deleteStudioWorkAction.bind(null, w.id)} className="ml-auto">
                            <button
                              type="submit"
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-danger/40 px-2.5 text-xs font-semibold text-danger hover:bg-danger/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-fg-subtle">
            Live pieces appear on the{' '}
            <Link href="/studio/work" className="font-semibold text-brand hover:underline">
              Studio work page
            </Link>{' '}
            in the order shown here.
          </p>
        </div>
      </div>
    </>
  );
}
