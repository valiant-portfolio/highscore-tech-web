// Per-payment receipt email. PDF attached + linked.

import { Button, Section, Text } from '@react-email/components';
import {
  EmailShell, h1, p, muted, button, kvTable, kvKey, kvVal, LINE,
} from './shared';

interface Props {
  firstName: string;
  courseTitle: string;
  amountPaid: string;          // formatted ₦
  totalCourseFee: string;
  paidToDate: string;
  balance: string;
  reference: string;
  paidOn: string;
  receiptUrl: string;          // absolute URL to receipt PDF
}

export function ReceiptEmail(props: Props) {
  return (
    <EmailShell preview={`Receipt — ${props.amountPaid} for ${props.courseTitle}`} eyebrow="HIGHSCORE TECH · RECEIPT">
      <Text style={h1}>Payment received.</Text>
      <Text style={p}>
        Hi {props.firstName}, we got your payment of <strong>{props.amountPaid}</strong> for{' '}
        <strong>{props.courseTitle}</strong>. The official PDF receipt is attached and also lives on your dashboard.
      </Text>

      <table cellPadding={0} cellSpacing={0} style={kvTable}>
        <tbody>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Course</td>
            <td style={kvVal}>{props.courseTitle}</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Amount</td>
            <td style={kvVal}>{props.amountPaid}</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Course total</td>
            <td style={kvVal}>{props.totalCourseFee}</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Paid to date</td>
            <td style={kvVal}>{props.paidToDate}</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Balance</td>
            <td style={kvVal}>{props.balance}</td>
          </tr>
          <tr style={{ borderBottom: `1px solid ${LINE}` }}>
            <td style={kvKey}>Date</td>
            <td style={kvVal}>{props.paidOn}</td>
          </tr>
          <tr>
            <td style={kvKey}>Reference</td>
            <td style={{ ...kvVal, fontFamily: 'monospace', fontSize: '11px' }}>{props.reference}</td>
          </tr>
        </tbody>
      </table>

      <Section style={{ margin: '20px 0' }}>
        <Button href={props.receiptUrl} style={button}>
          Download receipt
        </Button>
      </Section>

      <Text style={muted}>
        Keep this email for your records. Any questions, just reply to it.
      </Text>
    </EmailShell>
  );
}
