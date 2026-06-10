// First-payment-received welcome email. Sent once per enrolment, when the
// student crosses paid_ngn from 0 → first instalment.

import { Button, Section, Text } from '@react-email/components';
import { EmailShell, h1, p, muted, button } from './shared';

interface Props {
  firstName: string;
  courseTitle: string;
  courseSlug: string;
  totalNgn: string;          // already formatted (₦200,000)
  paidNgn: string;
  isFullPayment: boolean;
  siteUrl: string;
}

export function EnrollmentEmail(props: Props) {
  return (
    <EmailShell
      preview={`Welcome to ${props.courseTitle}`}
      eyebrow="HIGHSCORE TECH ACADEMY"
    >
      <Text style={h1}>Welcome to {props.courseTitle}.</Text>
      <Text style={p}>
        Hi {props.firstName}, your seat is locked in. We're excited to have you join the next cohort.
      </Text>

      <Section style={{ background: '#F4F8FA', padding: '20px', borderRadius: '8px', margin: '16px 0' }}>
        <Text style={{ ...muted, margin: '0 0 4px' }}>What you paid</Text>
        <Text style={{ ...h1, margin: 0, fontSize: '28px' }}>{props.paidNgn}</Text>
        <Text style={{ ...muted, margin: '4px 0 0' }}>
          {props.isFullPayment
            ? `Full payment of ${props.totalNgn} received. You're all set.`
            : `First instalment received. Total course fee: ${props.totalNgn}.`}
        </Text>
      </Section>

      <Text style={p}>
        Your enrolment dashboard is the home for everything ahead — module progress, the next instalment if any, receipts, and cohort updates.
      </Text>

      <Button
        href={`${props.siteUrl}/profile`}
        style={button}
      >
        Open my dashboard
      </Button>

      <Text style={muted}>
        Cohort schedule, kickoff calls, and onboarding details are coming separately within the next working day.
      </Text>
    </EmailShell>
  );
}
