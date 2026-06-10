import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in — Highscore Tech',
  description: 'Log in to your Highscore Tech account.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your Highscore Tech account."
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="font-semibold text-brand hover:underline">Sign up</Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
