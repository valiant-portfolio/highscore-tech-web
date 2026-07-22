// Trading-bot event alert — sent to the ops mailboxes when the bot places a
// pending order, fills into a position, or closes one. One event per email.

import { Text, Section, Row, Column } from '@react-email/components';
import { EmailShell, h1, p, muted, kvTable, kvKey, kvVal } from './shared';

export type BotAlertKind = 'pending_order' | 'position_opened' | 'position_closed';

const HEADING: Record<BotAlertKind, string> = {
  pending_order: 'New pending order',
  position_opened: 'Position opened',
  position_closed: 'Position closed',
};

const LEDE: Record<BotAlertKind, string> = {
  pending_order: 'The bot has placed a limit order that is now resting on the broker.',
  position_opened: 'A pending order filled — the bot is now in a live position.',
  position_closed: 'A position has closed.',
};

export function TradingBotAlertEmail({
  kind,
  rows,
}: {
  kind: BotAlertKind;
  rows: { label: string; value: string }[];
}) {
  return (
    <EmailShell preview={HEADING[kind]} eyebrow="HIGHSCORE TECH · TRADING BOT">
      <Text style={h1}>{HEADING[kind]}</Text>
      <Text style={p}>{LEDE[kind]}</Text>

      <Section style={kvTable}>
        {rows.map((r) => (
          <Row key={r.label}>
            <Column style={kvKey}>{r.label}</Column>
            <Column style={kvVal}>{r.value}</Column>
          </Row>
        ))}
      </Section>

      <Text style={muted}>
        Automated alert from the trading-bot monitor. You are not required to act — the bot manages
        entries and exits on its own.
      </Text>
    </EmailShell>
  );
}
