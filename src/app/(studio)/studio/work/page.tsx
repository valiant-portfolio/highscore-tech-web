// The shop window. For creative work the portfolio closes the sale harder than
// any copy — so this page is deliberately just the work.
//
// Media is served from Cloudinary (it transcodes and delivers the heavy video);
// we store only the URLs. Until the first pieces are published, the page says so
// plainly rather than faking a gallery.

import type { Metadata } from 'next';
import { Music, Play, Sparkles } from 'lucide-react';
import { listStudioWorks } from '@/lib/studio/queries';
import { LinkButton } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Our work — Highscore Studio',
  description:
    'Hear and watch custom songs, jingles, promo videos and campaigns made by Highscore Studio for businesses, churches, weddings, birthdays and events.',
  alternates: { canonical: '/studio/work' },
};

export default async function StudioWorkPage() {
  const works = await listStudioWorks();

  return (
    <section className="px-4 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-[1180px]">
        <header className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-warning">Our work</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] text-fg">
            Hear it for yourself.
          </h1>
          <p className="mt-4 text-fg-muted leading-relaxed">
            Songs, jingles and videos we’ve made for businesses, churches, weddings and
            birthdays. This is the standard your order gets held to.
          </p>
        </header>

        {works.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Sparkles className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold text-fg">Our first pieces are being uploaded.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted leading-relaxed">
              We’re publishing the gallery now. In the meantime, message us and we’ll send
              samples for exactly the kind of job you have in mind.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <LinkButton href="/studio/order">Start an order</LinkButton>
              <LinkButton href="/contact" variant="secondary">Ask for samples</LinkButton>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((w) => (
              <figure key={w.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="relative aspect-video bg-bg-elevated">
                  {w.media_type === 'video' && w.video_url ? (
                    <video
                      src={w.video_url}
                      poster={w.poster_url ?? undefined}
                      controls
                      preload="none"
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : w.poster_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.poster_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-fg-subtle">
                      {w.media_type === 'audio' ? <Music className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                    </div>
                  )}
                </div>

                <figcaption className="flex flex-1 flex-col p-5">
                  {w.project_type && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warning">{w.project_type}</span>
                  )}
                  <h3 className="mt-1.5 font-semibold text-fg leading-tight">{w.title}</h3>
                  {w.client && <p className="mt-0.5 text-xs text-fg-subtle">{w.client}</p>}
                  {w.summary && <p className="mt-2.5 text-sm text-fg-muted leading-relaxed">{w.summary}</p>}

                  {w.media_type === 'audio' && w.audio_url && (
                    <audio src={w.audio_url} controls preload="none" className="mt-4 w-full" />
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] text-fg">
            Want one made for you?
          </h2>
          <div className="mt-6">
            <LinkButton href="/studio/order" size="lg">Start your order</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
