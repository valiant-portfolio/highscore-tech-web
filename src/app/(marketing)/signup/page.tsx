import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign up — Highscore Tech',
  description: 'Create your Highscore Tech account to enrol in the academy.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join Highscore Tech Academy and reserve your seat in the next cohort."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-72" />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
