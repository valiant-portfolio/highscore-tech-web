// Trading-bot end-of-day digest — one calm summary email to the ops mailboxes,
// separate from the per-event alerts. Sent once a day by the daily cron.

import { Text, Section, Row, Column, Hr } from '@react-email/components';
import { EmailShell, h1, p, muted, divider, kvTable, kvKey, kvVal } from './shared';

export function TradingBotDailyEmail({
  dateLabel,
  online,
  netTodayLabel,
  netTodayPositive,
  rows,
  movers,
}: {
  dateLabel: string;
  online: boolean;
  netTodayLabel: string;
  netTodayPositive: boolean;
  rows: { label: string; value: string }[];
  movers: { market: string; value: string; positive: boolean }[];
}) {
  return (
    <EmailShell preview={`Trading bot · ${dateLabel} · ${netTodayLabel}`} eyebrow="HIGHSCORE TECH · TRADING BOT">
      <Text style={h1}>Daily summary — {dateLabel}</Text>
      <Text style={p}>
        {online ? 'The bot is online.' : '⚠ The bot appears offline (no recent writes).'} Today’s realized
        result: <strong style={{ color: netTodayPositive ? '#1F9D55' : '#D64545' }}>{netTodayLabel}</strong>.
      </Text>

      <Section style={kvTable}>
        {rows.map((r) => (
          <Row key={r.label}>
            <Column style={kvKey}>{r.label}</Column>
            <Column style={kvVal}>{r.value}</Column>
          </Row>
        ))}
      </Section>

      {movers.length > 0 && (
        <>
          <Hr style={divider} />
          <Text style={{ ...muted, fontWeight: 700 }}>By market (today)</Text>
          <Section style={kvTable}>
            {movers.map((m) => (
              <Row key={m.market}>
                <Column style={kvKey}>{m.market}</Column>
                <Column style={{ ...kvVal, color: m.positive ? '#1F9D55' : '#D64545' }}>{m.value}</Column>
              </Row>
            ))}
          </Section>
        </>
      )}

      <Text style={muted}>
        Automated end-of-day digest from the trading-bot monitor. Per-event alerts (orders, opens,
        closes) are sent separately as they happen.
      </Text>
    </EmailShell>
  );
}
