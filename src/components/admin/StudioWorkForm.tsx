'use client';

// Add a piece to the Studio gallery. The whole form is one YouTube link plus
// the words around it — the video itself lives on YouTube, so there is no
// upload to wait for and nothing to store.

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { Input, Textarea, Select, Button } from '@/components/ui';
import { addStudioWorkAction, type WorkFormState } from '@/lib/studio/work-actions';
import { youtubeId, youtubeThumb } from '@/lib/studio/youtube';

const INITIAL: WorkFormState = { status: 'idle' };

const TYPES = [
  { value: 'Business',  label: 'Business' },
  { value: 'Church',    label: 'Church' },
  { value: 'Birthday',  label: 'Birthday' },
  { value: 'Wedding',   label: 'Wedding' },
  { value: 'Event',     label: 'Event' },
  { value: 'Jingle',    label: 'Jingle' },
  { value: 'Advert',    label: 'Advert' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} leftIcon={pending ? undefined : <Plus className="h-4 w-4" />}>
      {pending ? 'Adding…' : 'Add to gallery'}
    </Button>
  );
}

export function StudioWorkForm() {
  const [state, formAction] = useActionState(addStudioWorkAction, INITIAL);
  const [url, setUrl] = useState('');

  // Show the thumbnail the moment a valid link is pasted, so a wrong video is
  // caught here rather than on the live site.
  const id = youtubeId(url);

  return (
    <form action={formAction} className="space-y-4">
      {state.status === 'success' && (
        <div className="flex items-start gap-2.5 rounded-md border border-success/30 bg-success/5 p-3 text-sm">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}
      {state.status === 'error' && !state.fieldErrors && (
        <div className="flex items-start gap-2.5 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm">
          <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          <p className="text-fg">{state.message}</p>
        </div>
      )}

      <Input
        name="video_url"
        label="YouTube link"
        required
        placeholder="https://www.youtube.com/watch?v=…"
        helper="Paste the link from YouTube — watch, share or Shorts all work."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={state.fieldErrors?.video_url}
      />

      {id && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={youtubeThumb(id)} alt="" className="h-14 w-24 rounded object-cover" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-success">Link looks good</p>
            <p className="truncate font-mono text-[11px] text-fg-subtle">{id}</p>
          </div>
        </div>
      )}

      <Input name="title" label="Title" required placeholder="e.g. Mama Nkechi Foods — jingle" error={state.fieldErrors?.title} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input name="client" label="Client" placeholder="Who it was made for (optional)" />
        <Select name="project_type" label="Type" options={TYPES} placeholder="Pick one" />
      </div>

      <Textarea name="summary" label="Short description" rows={3} placeholder="One or two lines about the piece. Shown under the video." />

      <label className="flex items-center gap-2.5 text-sm text-fg">
        <input type="checkbox" name="published" defaultChecked className="h-4 w-4 rounded border-border" />
        Publish to the gallery straight away
      </label>

      <SubmitButton />
    </form>
  );
}
