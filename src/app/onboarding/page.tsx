// Onboarding entry. Students must complete this before they can use the
// rest of the app. Admins and staff are exempt — their data lives in the
// staff table + admin account creation.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Logo from '@/components/brand/Logo';
import { PremiumCard } from '@/components/marketing/PremiumCard';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { getCurrentUser } from '@/lib/auth/queries';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Welcome to Highscore Tech — Onboarding',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/onboarding');

  // Staff and admin skip onboarding entirely.
  if (user.role === 'staff') redirect('/staff');
  if (user.role === 'admin') redirect('/admin');

  // Already onboarded → /profile.
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('onboarded_at').eq('id', user.id).maybeSingle();
  if (data?.onboarded_at) redirect('/profile');

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Brand header */}
      <header className="sticky top-0 z-30 bg-bg-elevated/85 backdrop-blur-md border-b border-border h-16">
        <div className="h-full mx-auto max-w-[1180px] px-4 md:px-8 flex items-center">
          <Logo size="sm" href={null} />
          <p className="ml-auto text-xs uppercase tracking-[0.18em] font-semibold text-fg-subtle">
            Step 1 of 1 · Onboarding
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 md:px-8 py-10 md:py-16">
        <div className="mx-auto max-w-[760px]">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand">Welcome</p>
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-extrabold tracking-[-0.025em] text-fg">
              A few details before we get going.
            </h1>
            <p className="mt-3 text-fg-muted">
              We use these to identify you, contact you about your cohort, and reach the right person in an emergency.
            </p>
          </div>

          <PremiumCard noLift>
            <div className="p-6 md:p-10">
              <OnboardingForm defaultPhone={user.phone ?? ''} />
            </div>
          </PremiumCard>
        </div>
      </main>
    </div>
  );
}
