// Shared layout chrome for transactional emails. Mirrors the brand
// (cyan/navy + Inter) using inline-friendly styles that survive Gmail and
// Outlook's CSS sanitisers.

import {
  Body, Container, Head, Hr, Html, Img, Link, Preview, Section, Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

export const BRAND      = '#18C2DC';
export const BRAND_DEEP = '#0A8EA8';
export const INK        = '#050E14';
export const FG         = '#0F1923';
export const MUTED      = '#5A7388';
export const LINE       = '#E2E8EE';
export const PAPER      = '#FFFFFF';
export const BG         = '#ECEFF2';

const main = {
  backgroundColor: BG,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
  padding: '32px 12px',
  margin: 0,
};

const container = {
  backgroundColor: PAPER,
  maxWidth: '600px',
  margin: '0 auto',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(5,14,20,0.06)',
};

const header = {
  background: 'linear-gradient(135deg, #050E14 0%, #102733 60%, #06677F 100%)',
  padding: '24px 32px',
  color: PAPER,
};

const body = {
  padding: '32px',
};

const footerStyle = {
  padding: '20px 32px 28px',
  borderTop: `1px solid ${LINE}`,
  color: MUTED,
  fontSize: '11px',
  lineHeight: 1.6,
};

interface Props {
  preview: string;
  eyebrow?: string;
  children: ReactNode;
}

export function EmailShell({ preview, eyebrow = 'HIGHSCORE TECH', children }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header band */}
          <Section style={header}>
            <table cellPadding={0} cellSpacing={0} border={0} style={{ width: '100%' }}>
              <tr>
                <td style={{ verticalAlign: 'middle', width: '48px', paddingRight: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '20px',
                      background:
                        'radial-gradient(circle at 30% 30%, #6CE8FA 0%, #18C2DC 55%, #0A8EA8 100%)',
                      color: INK,
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      lineHeight: '40px',
                    }}
                  >
                    H
                  </div>
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <Text style={{ color: BRAND, fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.2px' }}>
                    Highscore Tech
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', margin: '3px 0 0', letterSpacing: '2px' }}>
                    {eyebrow}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Body */}
          <Section style={body}>{children}</Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={{ margin: 0, color: MUTED }}>
              Highscore Tech · AI development &amp; Academy ·{' '}
              <Link href={SITE_URL} style={{ color: BRAND_DEEP, textDecoration: 'none' }}>
                highzcore.tech
              </Link>
            </Text>
            <Text style={{ margin: '6px 0 0', color: MUTED }}>
              You're receiving this because you signed up or contacted us. If something looks off, reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Re-usable bits ──────────────────────────────────────────────────────────
export const h1 = {
  color: INK,
  fontSize: '24px',
  fontWeight: 800,
  letterSpacing: '-0.4px',
  margin: '0 0 16px',
  lineHeight: 1.25,
};

export const p = {
  color: FG,
  fontSize: '15px',
  lineHeight: 1.6,
  margin: '0 0 14px',
};

export const muted = {
  color: MUTED,
  fontSize: '13px',
  lineHeight: 1.55,
  margin: '0 0 12px',
};

export const button = {
  display: 'inline-block',
  backgroundColor: BRAND,
  color: INK,
  padding: '12px 22px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
};

export const divider = {
  borderColor: LINE,
  margin: '24px 0',
};

export const kvTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  margin: '12px 0',
};

export const kvKey = {
  padding: '6px 0',
  color: MUTED,
  fontSize: '13px',
  width: '40%',
};

export const kvVal = {
  padding: '6px 0',
  color: INK,
  fontSize: '13px',
  fontWeight: 600,
  textAlign: 'right' as const,
};

// Silence unused-import warning for items consumed via inline styles.
void Hr; void Img;
