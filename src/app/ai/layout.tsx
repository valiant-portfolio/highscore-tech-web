// Highscore AI — ai.highzcore.tech
//
// Its own product, in the same codebase. The whole subdomain is served from
// here (see src/proxy.ts), so this layout owns the shell every AI screen
// wears: the chrome, the theme, and the disclaimer that has to be on the page
// whatever else is.
//
// `data-app="ai"` is what switches the palette to emerald — see the scoped
// block in src/styles/tokens.css. Nothing else changes: the semantic token
// names are identical, so every component written elsewhere in this repo works
// here and simply wears the other colour.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AiNav } from '@/components/ai/AiNav';
import { AiFooter } from '@/components/ai/AiFooter';

export const metadata: Metadata = {
  title: {
    default: 'Highscore AI — a calmer way to read the market',
    template: '%s · Highscore AI',
  },
  description:
    'Charts for every market with AI that reads them. Ask a question, get a straight answer, and test it before you risk anything.',
};

export default function AiLayout({ children }: { children: ReactNode }) {
  return (
    // Dark only. A chart screen someone stares at for six hours is not a
    // brochure, so there is no light variant to maintain.
    <div data-app="ai" className="min-h-dvh bg-bg text-fg antialiased">
      <AiNav />
      <main>{children}</main>
      <AiFooter />
    </div>
  );
}
