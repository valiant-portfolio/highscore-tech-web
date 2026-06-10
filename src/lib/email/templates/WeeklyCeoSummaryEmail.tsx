import { Section, Text } from '@react-email/components';
import {
  EmailShell, h1, p, muted, LINE,
} from './shared';

interface StaffSummary {
  name: string;
  role: string;
  streak: number;
  reportsWeek: number;
  reportsMonth: number;
  selfFiledPct: number;
  ndaSigned: boolean;
}

interface Props {
  weekRange: string;
  activeStaff: number;
  newRevenueNgn: string;
  enrolledThisWeek: number;
  unreadContact: number;
  perStaff: StaffSummary[];
}

export function WeeklyCeoSummaryEmail(props: Props) {
  return (
    <EmailShell preview="Your weekly Highscore Tech summary" eyebrow="CEO · WEEKLY SUMMARY">
      <Text style={h1}>Weekly summary</Text>
      <Text style={p}>For {props.weekRange}.</Text>

      <Section style={{ background: '#F4F8FA', padding: '16px 20px', borderRadius: '8px', margin: '14px 0' }}>
        <table cellPadding={0} cellSpacing={0} style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}`, color: '#5A7388', fontSize: '12px' }}>Active staff</td>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#050E14', fontWeight: 700 }}>{props.activeStaff}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}`, color: '#5A7388', fontSize: '12px' }}>Revenue this week</td>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#050E14', fontWeight: 700 }}>{props.newRevenueNgn}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}`, color: '#5A7388', fontSize: '12px' }}>New enrolments</td>
              <td style={{ padding: '8px 0', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#050E14', fontWeight: 700 }}>{props.enrolledThisWeek}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#5A7388', fontSize: '12px' }}>Unread contact messages</td>
              <td style={{ padding: '8px 0', textAlign: 'right', color: props.unreadContact > 0 ? '#E5484D' : '#050E14', fontWeight: 700 }}>{props.unreadContact}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Text style={{ ...h1, fontSize: '18px', marginTop: '24px' }}>Team performance</Text>
      <Section style={{ marginTop: '8px' }}>
        <table cellPadding={0} cellSpacing={0} style={{ width: '100%', borderTop: `1px solid ${LINE}` }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 6px', borderBottom: `1px solid ${LINE}`, textAlign: 'left', color: '#0A8EA8', fontSize: '10px', letterSpacing: '1.2px', fontWeight: 800 }}>NAME</th>
              <th style={{ padding: '8px 6px', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#0A8EA8', fontSize: '10px', letterSpacing: '1.2px', fontWeight: 800 }}>STREAK</th>
              <th style={{ padding: '8px 6px', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#0A8EA8', fontSize: '10px', letterSpacing: '1.2px', fontWeight: 800 }}>7D</th>
              <th style={{ padding: '8px 6px', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#0A8EA8', fontSize: '10px', letterSpacing: '1.2px', fontWeight: 800 }}>30D</th>
              <th style={{ padding: '8px 6px', borderBottom: `1px solid ${LINE}`, textAlign: 'right', color: '#0A8EA8', fontSize: '10px', letterSpacing: '1.2px', fontWeight: 800 }}>SELF%</th>
              <th style={{ padding: '8px 6px', borderBottom: `1px solid ${LINE}`, textAlign: 'center', color: '#0A8EA8', fontSize: '10px', letterSpacing: '1.2px', fontWeight: 800 }}>NDA</th>
            </tr>
          </thead>
          <tbody>
            {props.perStaff.map((s) => (
              <tr key={s.name} style={{ borderBottom: `1px solid ${LINE}` }}>
                <td style={{ padding: '8px 6px', color: '#050E14', fontWeight: 700, fontSize: '12px' }}>
                  {s.name}
                  <div style={{ color: '#5A7388', fontWeight: 400, fontSize: '11px' }}>{s.role}</div>
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: s.streak >= 3 ? '#1FB479' : s.streak > 0 ? '#F4A623' : '#E5484D' }}>{s.streak}d</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: '#050E14' }}>{s.reportsWeek}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: '#5A7388' }}>{s.reportsMonth}</td>
                <td style={{ padding: '8px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', color: '#5A7388' }}>{Math.round(s.selfFiledPct * 100)}%</td>
                <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', color: s.ndaSigned ? '#1FB479' : '#F4A623' }}>{s.ndaSigned ? '✓' : '○'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Text style={{ ...muted, marginTop: '20px' }}>
        Sent every Friday from cron. Full detail at the admin dashboard.
      </Text>
    </EmailShell>
  );
}
