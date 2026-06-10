import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot password — Highscore Tech',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline">Back to log in</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
