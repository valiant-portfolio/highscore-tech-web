import { Button, Section, Text } from '@react-email/components';
import { EmailShell, h1, p, muted, button } from './shared';

interface Props {
  firstName: string;
  courseTitle: string;
  amountDue: string;       // formatted ₦
  dueDate: string;
  totalBalance: string;
  payHref: string;
}

export function InstallmentReminderEmail(props: Props) {
  return (
    <EmailShell preview={`Instalment due — ${props.amountDue} for ${props.courseTitle}`} eyebrow="ACADEMY · PAYMENT REMINDER">
      <Text style={h1}>Heads up, {props.firstName} — instalment due.</Text>
      <Text style={p}>
        Your next instalment for <strong>{props.courseTitle}</strong> is overdue.
      </Text>

      <Section style={{ background: '#F4F8FA', padding: '20px', borderRadius: '8px', margin: '14px 0' }}>
        <Text style={{ ...muted, margin: '0 0 4px' }}>Amount due</Text>
        <Text style={{ ...h1, margin: 0, fontSize: '28px' }}>{props.amountDue}</Text>
        <Text style={{ ...muted, margin: '4px 0 0' }}>Was due on {props.dueDate}.</Text>
      </Section>

      <Text style={p}>
        Pay now to keep your enrolment active. Your remaining course balance is <strong>{props.totalBalance}</strong>.
      </Text>

      <Button href={props.payHref} style={button}>
        Pay instalment
      </Button>

      <Text style={muted}>
        Need help? Reply to this email and the admin team will jump in.
      </Text>
    </EmailShell>
  );
}
