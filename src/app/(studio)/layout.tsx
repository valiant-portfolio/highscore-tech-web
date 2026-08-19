// Chrome for Highscore Studio (studio.highzcore.tech → /studio). Its own
// header rather than the agency one: different buyer, different journey.

import { StudioHeader } from '@/components/studio/StudioHeader';
import { WhatsAppFloat } from '@/components/studio/WhatsAppFloat';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { CONTACT_LINKS } from '@/lib/studio/catalog';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
