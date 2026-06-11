import { Button, Section, Text } from '@react-email/components';
import {
  EmailShell, h1, p, muted, button, LINE,
} from './shared';

interface Props {
  firstName: string;
  fullName: string;
  roleTitle: string;
  monthlySalary: string;
  startDate: string;
  nextPayday: string;
  dashboardHref: string;
  offerPdfHref: string;
  contractPdfHref: string;
  policyPdfHref: string;
  jobDescPdfHref: string;
  idCardPdfHref: string;
}

export function EmploymentConfirmationEmail(props: Props) {
  return (
    <EmailShell preview="Welcome to Highscore Tech" eyebrow="EMPLOYMENT · CONFIRMATION">
      <Text style={h1}>Welcome to Highscore Tech, {props.firstName}.</Text>

      <Text style={p}>
        Onboarding is complete. Your offer letter, employment contract (with NDA), and
        company policy have all been signed and are on file with your signature embedded.
        You're officially part of the team.
      </Text>

      <Section style={{ background: '#F4F8FA', padding: '20px', borderRadius: '8px', margin: '14px 0' }}>
        <Text style={{ ...muted, margin: '0 0 4px' }}>Position</Text>
        <Text style={{ ...h1, margin: 0, fontSize: '20px' }}>{props.roleTitle}</Text>
        <Text style={{ ...muted, margin: '8px 0 0' }}>
          {props.fullName} · Started {props.startDate}
        </Text>
      </Section>

      <table cellPadding={0} cellSpacing={0} style={{ width: '100%', marginTop: '14px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '10px 0', borderBottom: `1px solid ${LINE}`, color: '#5A7388', fontSize: '12px' }}>Monthly salary</td>
            <td style={{ padding: '10px 0', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#050E14', fontWeight: 700 }}>{props.monthlySalary}</td>
          </tr>
          <tr>
            <td style={{ padding: '10px 0', color: '#5A7388', fontSize: '12px' }}>Next payday</td>
            <td style={{ padding: '10px 0', textAlign: 'right', color: '#050E14', fontWeight: 700 }}>{props.nextPayday}</td>
          </tr>
        </tbody>
      </table>

      <Text style={{ ...p, marginTop: '24px' }}>
        Your signed copies of every document are available in your staff portal:
      </Text>

      <Section style={{ marginTop: '8px' }}>
        <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
          <tbody>
            <tr><td style={{ padding: '6px 0' }}><a href={props.offerPdfHref}    style={{ color: '#0A8EA8', textDecoration: 'underline', fontSize: '14px' }}>• Offer letter (PDF)</a></td></tr>
            <tr><td style={{ padding: '6px 0' }}><a href={props.contractPdfHref} style={{ color: '#0A8EA8', textDecoration: 'underline', fontSize: '14px' }}>• Employment contract + NDA (PDF)</a></td></tr>
            <tr><td style={{ padding: '6px 0' }}><a href={props.policyPdfHref}   style={{ color: '#0A8EA8', textDecoration: 'underline', fontSize: '14px' }}>• Company policy and staff agreement (PDF)</a></td></tr>
            <tr><td style={{ padding: '6px 0' }}><a href={props.jobDescPdfHref}  style={{ color: '#0A8EA8', textDecoration: 'underline', fontSize: '14px' }}>• Job description (PDF)</a></td></tr>
            <tr><td style={{ padding: '6px 0' }}><a href={props.idCardPdfHref}   style={{ color: '#0A8EA8', textDecoration: 'underline', fontSize: '14px' }}>• Staff ID card (PDF)</a></td></tr>
          </tbody>
        </table>
      </Section>

      <Button href={props.dashboardHref} style={button}>
        Open my staff portal
      </Button>

      <Text style={{ ...muted, marginTop: '24px' }}>
        Anything wrong with the records — wrong name, wrong role, anything — reply to this
        email and admin will fix it.
      </Text>
    </EmailShell>
  );
}
