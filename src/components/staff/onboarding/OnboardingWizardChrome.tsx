// Stepped progress bar shown at the top of every onboarding step.

import { Check } from 'lucide-react';

type Step = 'offer' | 'nda' | 'done';

interface Props {
  current: Step;
  offerSigned: boolean;
  ndaSigned: boolean;
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'offer', label: 'Offer letter' },
  { id: 'nda',   label: 'Contract & NDA' },
  { id: 'done',  label: 'Done' },
];

export function OnboardingWizardChrome({ current, offerSigned, ndaSigned }: Props) {
  function statusOf(id: Step): 'done' | 'current' | 'pending' {
    if (id === 'offer') {
      if (offerSigned) return 'done';
      if (current === 'offer') return 'current';
      return 'pending';
    }
    if (id === 'nda') {
      if (ndaSigned) return 'done';
      if (current === 'nda') return 'current';
      return 'pending';
    }
    return current === 'done' ? 'current' : 'pending';
  }

  return (
    <ol className="flex items-center gap-2 sm:gap-3 mb-8">
      {STEPS.map((s, idx) => {
        const status = statusOf(s.id);
        return (
          <li key={s.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  status === 'done'    ? 'bg-success text-paper' :
                  status === 'current' ? 'bg-brand text-brand-fg' :
                                         'bg-surface-hover text-fg-subtle'
                }`}
              >
                {status === 'done' ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <span className={`text-xs sm:text-sm font-semibold truncate ${
                status === 'pending' ? 'text-fg-subtle' : 'text-fg'
              }`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className={`flex-1 mx-2 sm:mx-3 h-px ${
                status === 'done' ? 'bg-success' : 'bg-border'
              }`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
