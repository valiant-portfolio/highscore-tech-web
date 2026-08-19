// Start an order. The form branches by project type — a church brief asks
// different questions than a birthday.

import type { Metadata } from 'next';
import { OrderForm } from '@/components/studio/OrderForm';

export const metadata: Metadata = {
  title: 'Start your order — Highscore Studio',
  description:
    'Tell us what you want made — a custom song, jingle, promo video or full campaign. Pay securely and get a delivery date straight away.',
  alternates: { canonical: '/studio/order' },
};

export default async function StudioOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: pkg } = await searchParams;

  return (
    <section className="px-4 md:px-8 py-12 md:py-16">
      <div className="mx-auto max-w-[820px]">
        <header className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-warning">Your order</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.03em] text-fg">
            Let’s make something.
          </h1>
          <p className="mt-4 text-fg-muted leading-relaxed">
            Four quick steps. The more you tell us in the brief, the better the work comes
            back — the details are what make a song feel like it was written for you.
          </p>
        </header>

        <OrderForm initialPackage={pkg} />
      </div>
    </section>
  );
}
