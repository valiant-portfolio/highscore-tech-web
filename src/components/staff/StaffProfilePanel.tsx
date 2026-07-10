'use client';

// The staff Profile tab (formerly "Settings"). View-only by default; an admin
// grants the 'profile-edit' capability to reveal the Edit button. In edit mode
// the staff member may change their photo, NIN, password, phone and personal
// email — but never their name or work email (admin-controlled).

import { useState } from 'react';
import { Pencil, X, CheckCircle2, Clock } from 'lucide-react';
import { StaffProfileForm } from './StaffProfileForm';
import { StaffPasswordForm } from './StaffPasswordForm';
import { StaffNinUpload } from './StaffNinUpload';
import { StaffPhotoUpload } from './StaffPhotoUpload';
import { StaffBankAccount } from './StaffBankAccount';
import { formatAccountNumber } from '@/lib/staff/bank';

interface Bank {
  name: string | null;
  accountNumber: string | null;
  accountName: string | null;
  updatedAt: string | null;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-bg-elevated ${className}`}>{children}</div>;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-fg-subtle">{label}</p>
      <p className="mt-1 text-sm text-fg break-words">{value || <span className="text-fg-subtle">—</span>}</p>
    </div>
  );
}

export function StaffProfilePanel({
  canEdit, slug, fullName, workEmail, phone, personalEmail, photoPublicUrl, ninUploaded, bank,
}: {
  canEdit: boolean;
  slug: string;
  fullName: string;
  workEmail: string;
  phone: string;
  personalEmail: string | null;
  photoPublicUrl: string | null;
  ninUploaded: boolean;
  bank: Bank;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Edit control — only when granted */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={[
              'inline-flex h-10 items-center gap-2 px-4 rounded-md text-sm font-semibold',
              editing
                ? 'border border-border bg-surface/60 text-fg-muted hover:text-fg'
                : 'bg-brand text-brand-fg hover:bg-brand-hover',
            ].join(' ')}
          >
            {editing ? <><X className="h-4 w-4" /> Done editing</> : <><Pencil className="h-4 w-4" /> Edit profile</>}
          </button>
        </div>
      )}

      {/* ── READ-ONLY VIEW ─────────────────────────────────────────── */}
      {!editing && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Your details</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Full name" value={fullName} />
              <Field label="Work email" value={workEmail} />
              <Field label="Phone" value={phone} />
              <Field label="Personal email" value={personalEmail} />
            </div>
          </Card>

          <Card className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Photo &amp; identity</h2>
            <div className="mt-5 flex items-center gap-4">
              {photoPublicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPublicUrl} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-surface-hover border border-border" />
              )}
              <div className="space-y-1.5 text-xs">
                <span className="flex items-center gap-1.5 text-fg-muted">
                  {photoPublicUrl ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Clock className="h-3.5 w-3.5 text-warning" />}
                  Passport photo {photoPublicUrl ? 'on file' : 'not uploaded'}
                </span>
                <span className="flex items-center gap-1.5 text-fg-muted">
                  {ninUploaded ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Clock className="h-3.5 w-3.5 text-warning" />}
                  NIN {ninUploaded ? 'uploaded' : 'not uploaded'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Bank account · for payroll</h2>
            {bank.accountNumber ? (
              <div className="mt-5 grid sm:grid-cols-3 gap-x-6 gap-y-4">
                <Field label="Bank" value={bank.name} />
                <Field label="Account number" value={formatAccountNumber(bank.accountNumber)} />
                <Field label="Account name" value={bank.accountName} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-fg-muted">No bank account on file yet.</p>
            )}
          </Card>

          {!canEdit && (
            <p className="lg:col-span-2 text-xs text-fg-subtle">
              Editing is turned off. Ask an admin to grant you profile access to update your photo, NIN, password, phone or personal email.
            </p>
          )}
        </div>
      )}

      {/* ── EDIT VIEW ──────────────────────────────────────────────── */}
      {editing && canEdit && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Profile</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Your name and work email are set by admin. Update your phone and add a personal email.
            </p>
            <div className="mt-6">
              <StaffProfileForm
                fullName={fullName}
                workEmail={workEmail}
                defaultPhone={phone}
                defaultPersonalEmail={personalEmail ?? ''}
              />
            </div>
          </Card>

          <Card className="p-5 md:p-7">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Change password</h2>
            <p className="mt-1 text-sm text-fg-muted">
              First-time login uses <code className="font-mono text-brand">Highscore-{slug}</code>. Change it here.
            </p>
            <div className="mt-6">
              <StaffPasswordForm />
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Bank account · for payroll</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Add the Nigerian bank account your monthly salary should land in. Changes are limited to once every 90 days.
            </p>
            <div className="mt-6">
              <StaffBankAccount
                initialBankName={bank.name}
                initialAccountNumber={bank.accountNumber}
                initialAccountName={bank.accountName}
                initialUpdatedAt={bank.updatedAt}
              />
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Passport photograph</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Add a clean head-and-shoulders shot. We crop to a square automatically and embed it on your staff ID card.
            </p>
            <div className="mt-6">
              <StaffPhotoUpload initialPhotoUrl={photoPublicUrl} />
            </div>
          </Card>

          <Card className="p-5 md:p-7 lg:col-span-2">
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">Identity (NIN)</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Upload your National Identification Number slip for HR compliance. Required for staff; private; only admin can view.
            </p>
            <div className="mt-6 max-w-[520px]">
              <StaffNinUpload alreadyUploaded={ninUploaded} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
