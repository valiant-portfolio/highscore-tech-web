'use client';

// Contact form — client component bound to the submitContactForm server
// action via React 19's useActionState. Inline validation + a single
// success/error banner. The banner replaces the form on success.

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { submitContactForm, type ContactFormState } from '@/lib/contact/actions';

const SUBJECT_OPTIONS = [
  { value: 'project',     label: 'Project enquiry' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'academy',     label: 'Academy enrolment' },
  { value: 'press',       label: 'Press / media' },
  { value: 'other',       label: 'Something else' },
];

const INITIAL: ContactFormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      loading={pending}
      rightIcon={pending ? undefined : <Send className="h-4 w-4" />}
    >
      Send message
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
        <h3 className="mt-4 text-xl font-semibold text-fg">Message sent</h3>
        <p className="mt-2 text-fg-muted leading-relaxed">{state.message}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.status === 'error' && !state.fieldErrors && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-danger/30 bg-danger/5 p-4 text-sm"
        >
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          name="name"
          label="Your name"
          required
          autoComplete="name"
          placeholder="Jane Doe"
          error={state.fieldErrors?.name}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
          placeholder="jane@example.com"
          error={state.fieldErrors?.email}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          name="phone"
          type="tel"
          label="Phone (optional)"
          autoComplete="tel"
          placeholder="+234 …"
        />
        <Select
          name="subject"
          label="What's this about?"
          options={SUBJECT_OPTIONS}
          placeholder="Pick one"
        />
      </div>

      <Textarea
        name="message"
        label="Message"
        required
        rows={6}
        placeholder="Tell us about your project, timeline, and what success looks like."
        error={state.fieldErrors?.message}
      />

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
