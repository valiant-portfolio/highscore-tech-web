// /admin/settings — company-level settings the CEO controls. Currently
// limited to the CEO signature; more company-wide defaults will live
// here later (letterhead, signing officers, brand tweaks, etc.).

import { PageHead, AdminCard } from '@/components/admin/AdminPage';
import { CeoSignatureManager } from '@/components/admin/CeoSignatureManager';
import { ceoSignatureExists } from '@/lib/admin/ceo-signature-actions';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const sigExists = await ceoSignatureExists();

  return (
    <>
      <PageHead
        title="Company settings"
        description="The CEO controls company-wide settings here. Right now: your signature, embedded into every signed document and onboarding preview across the platform."
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <AdminCard>
          <div className="p-5 md:p-7">
            <h2 className="font-display text-xl font-bold text-fg">CEO signature</h2>
            <p className="mt-1 text-sm text-fg-muted leading-relaxed">
              Upload a photo of your signature on plain white paper. We'll crop
              it to the area you select, strip the paper background, and store
              the transparent PNG. Every staff offer letter, employment
              contract, and ID card will embed this image automatically.
            </p>
            <div className="mt-6">
              <CeoSignatureManager initiallyExists={sigExists} />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <div className="p-5 md:p-7">
            <h2 className="font-display text-base font-bold text-fg">How it's used</h2>
            <ul className="mt-4 space-y-3 text-sm text-fg-muted">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Offer letter PDFs — left signature slot.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Employment contract PDFs — &quot;For Highscore Tech&quot; slot.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Staff onboarding wizard preview pages.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <span>Future: receipts, customer-facing letters.</span>
              </li>
            </ul>
            <p className="mt-5 text-xs text-fg-subtle border-t border-border pt-4">
              Stored privately in the <code className="font-mono text-fg-muted">signatures</code> bucket.
              Only signed-in admins and staff can resolve a preview URL (5-min expiry).
            </p>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
