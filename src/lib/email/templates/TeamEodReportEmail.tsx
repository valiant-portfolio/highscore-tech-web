import { Section, Text } from '@react-email/components';
import {
  EmailShell, h1, p, muted, LINE,
} from './shared';

interface Entry {
  full_name: string;
  did_work: boolean;
  notes: string;
}

interface Props {
  reportDate: string;       // e.g. "12 June 2026"
  postedBy: string;         // "Olivia Olije Amehs"
  summary: string;
  entries: Entry[];
  dashboardHref: string;    // link to /admin/reports
}

export function TeamEodReportEmail(props: Props) {
  const worked = props.entries.filter((e) => e.did_work);
  const off    = props.entries.filter((e) => !e.did_work);

  return (
    <EmailShell preview={`Team EOD for ${props.reportDate}`} eyebrow="ADMIN · TEAM EOD">
      <Text style={h1}>Team EOD — {props.reportDate}</Text>
      <Text style={p}>
        <strong>{props.postedBy}</strong> just posted the day's team report.
        {' '}{worked.length} worked · {off.length} did not.
      </Text>

      {props.summary && (
        <Section style={{ background: '#F4F8FA', padding: '14px 18px', borderRadius: '6px', margin: '12px 0' }}>
          <Text style={{ ...muted, margin: '0 0 4px', fontSize: '11px' }}>OVERALL SUMMARY</Text>
          <Text style={{ ...p, margin: 0, color: '#050E14' }}>{props.summary}</Text>
        </Section>
      )}

      {/* Worked */}
      {worked.length > 0 && (
        <>
          <Text style={{ ...h1, fontSize: '15px', marginTop: '24px', color: '#1FB479' }}>
            ✓ Worked ({worked.length})
          </Text>
          <Section style={{ marginTop: '6px' }}>
            {worked.map((e) => (
              <div
                key={e.full_name}
                style={{ borderLeft: '3px solid #1FB479', paddingLeft: '12px', marginBottom: '12px' }}
              >
                <Text style={{ margin: '0 0 4px', color: '#050E14', fontWeight: 700, fontSize: '13px' }}>{e.full_name}</Text>
                <Text style={{ margin: 0, color: '#3B4651', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                  {e.notes || <span style={{ color: '#9aa3ad', fontStyle: 'italic' }}>No notes from {e.full_name.split(' ')[0]}.</span>}
                </Text>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* Off */}
      {off.length > 0 && (
        <>
          <Text style={{ ...h1, fontSize: '15px', marginTop: '24px', color: '#E5484D' }}>
            ✗ Did not work ({off.length})
          </Text>
          <Section style={{ marginTop: '6px' }}>
            {off.map((e) => (
              <div
                key={e.full_name}
                style={{ borderLeft: '3px solid #E5484D', paddingLeft: '12px', marginBottom: '12px' }}
              >
                <Text style={{ margin: '0 0 4px', color: '#050E14', fontWeight: 700, fontSize: '13px' }}>{e.full_name}</Text>
                <Text style={{ margin: 0, color: '#3B4651', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                  {e.notes
                    ? <><strong>Reason given:</strong> {e.notes}</>
                    : <span style={{ color: '#9aa3ad', fontStyle: 'italic' }}>No reason given.</span>}
                </Text>
              </div>
            ))}
          </Section>
        </>
      )}

      <table cellPadding={0} cellSpacing={0} style={{ width: '100%', marginTop: '24px', borderTop: `1px solid ${LINE}` }}>
        <tbody>
          <tr>
            <td style={{ paddingTop: '12px', fontSize: '12px', color: '#5A7388' }}>
              View all past EODs in the admin reports section.
            </td>
            <td style={{ paddingTop: '12px', textAlign: 'right' }}>
              <a href={props.dashboardHref} style={{ color: '#0A8EA8', textDecoration: 'underline', fontSize: '13px', fontWeight: 600 }}>
                Open reports →
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </EmailShell>
  );
}
