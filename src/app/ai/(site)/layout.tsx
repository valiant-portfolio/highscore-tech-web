// The marketing chrome: nav on top, footer beneath.
//
// Scoped to this group so the workspace at /app does not inherit it — an app
// screen with a landing-page footer under the chart reads as a mistake.

import type { ReactNode } from 'react';
import { AiNav } from '@/components/ai/AiNav';
import { AiFooter } from '@/components/ai/AiFooter';

export default function AiSiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AiNav />
      <main>{children}</main>
      <AiFooter />
    </>
  );
}
