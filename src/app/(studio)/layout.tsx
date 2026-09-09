// Chrome for Highscore Studio (studio.highzcore.tech → /studio). Its own
// header rather than the agency one: different buyer, different journey.

import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { localBusinessSchema } from '@/components/seo/structured-data';
import { StudioHeader } from '@/components/studio/StudioHeader';
import { WhatsAppFloat } from '@/components/studio/WhatsAppFloat';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { CONTACT_LINKS } from '@/lib/studio/catalog';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

// Overrides the root template for every /studio route. Without this each page
// signed off "· Highscore Tech", which both buries the brand the visitor is
// actually looking at and pushes real words past Google's ~60-character cut.
export const metadata: Metadata = {
  title: {
    default: 'Highscore Studio — custom songs & jingles, Lagos',
    template: '%s · Highscore Studio',
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Emitted once for the whole Studio tree rather than per page. This is
          the node Google reads first when building an AI Overview for a local
          query, so it belongs on every Studio route and exactly once each. */}
      <JsonLd data={localBusinessSchema(SITE_URL)} />
      <a
        href="#studio-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:inline-flex focus:h-10 focus:items-center focus:px-3 focus:rounded-md focus:bg-brand focus:text-brand-fg focus:font-semibold"
      >
        Skip to content
      </a>
      <StudioHeader
        whatsapp={CONTACT_LINKS.whatsapp}
        telegram={CONTACT_LINKS.telegram}
        email={CONTACT_LINKS.email}
      />
      <main id="studio-content" className="flex-1">{children}</main>
      <MarketingFooter />
      <WhatsAppFloat whatsapp={CONTACT_LINKS.whatsapp} />
    </>
  );
}
