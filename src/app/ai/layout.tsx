// Highscore AI — ai.highzcore.tech
//
// This layout is the THEME only. The marketing chrome (nav, footer) lives in
// the (site) group beside it, because the workspace is a full-height app
// screen: it owns its own rail and must not be wrapped in a landing-page nav
// or trailed by a footer.
//
// `data-app="ai"` is what switches the palette to emerald — see the scoped
// block in src/styles/tokens.css. Nothing else changes: the semantic token
// names are identical, so every component written elsewhere in this repo works
// here and simply wears the other colour.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

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
      {children}
    </div>
  );
}
