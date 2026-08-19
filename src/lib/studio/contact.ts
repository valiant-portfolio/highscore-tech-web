// Turning the configured contact values into real links.
//
// Each channel accepts either form, because both are things you naturally have
// to hand: a full link (a wa.me/message/… click-to-chat short link, or a
// t.me/… URL) or a bare number / @handle. Stripping non-digits from a short
// link would quietly produce a dead URL, so check for a URL first.

import { CONTACT_LINKS } from '@/lib/studio/catalog';

export function chatHref(value: string, kind: 'whatsapp' | 'telegram'): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (kind === 'whatsapp') return `https://wa.me/${v.replace(/[^\d]/g, '')}`;
  return `https://t.me/${v.replace(/^@/, '')}`;
}

export interface StudioChannel {
  key: 'whatsapp' | 'telegram' | 'email';
  label: string;
  /** What to show the customer, e.g. the handle or address. */
  handle: string;
  href: string;
  blurb: string;
}

/** The channels that are actually configured — nothing half-wired is shown. */
export function studioChannels(): StudioChannel[] {
  const out: StudioChannel[] = [];
  if (CONTACT_LINKS.whatsapp) {
    out.push({
      key: 'whatsapp',
      label: 'WhatsApp',
      handle: 'Chat with us',
      href: chatHref(CONTACT_LINKS.whatsapp, 'whatsapp'),
      blurb: 'Fastest way to reach us. Send a voice note if it’s easier.',
    });
  }
  if (CONTACT_LINKS.telegram) {
    out.push({
      key: 'telegram',
      label: 'Telegram',
      handle: CONTACT_LINKS.telegram.replace(/^https?:\/\/t\.me\//i, '@'),
      href: chatHref(CONTACT_LINKS.telegram, 'telegram'),
      blurb: 'Prefer Telegram? We’re there too.',
    });
  }
  out.push({
    key: 'email',
    label: 'Email',
    handle: CONTACT_LINKS.email,
    href: `mailto:${CONTACT_LINKS.email}`,
    blurb: 'Best for briefs, files and anything you need in writing.',
  });
  return out;
}
