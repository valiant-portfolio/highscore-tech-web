import 'server-only';

// Confirmation mail for a paid Studio order: the customer gets a receipt with
// their invoice attached, and we get the brief in the inbox so work can start
// without opening the dashboard.

import { createElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { sendEmail, emailConfig } from '@/lib/email/client';
import { serviceClient } from '@/lib/supabase/service';
import { StudioInvoicePdf } from '@/lib/studio/InvoicePdf';
import { COUNTRY_NAME } from '@/lib/studio/countries';
import { PROJECT_TYPE_BY_KEY } from '@/lib/studio/catalog';
import type { StudioOrder } from '@/lib/studio/queries';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const GOLD = '#B37A12';
const INK = '#050E14';

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F6F8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F8;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E2E8EE">
        <tr><td style="background:${INK};padding:20px 28px">
          <div style="color:#FFFFFF;font-size:17px;font-weight:800;letter-spacing:-0.2px">Highscore Tech</div>
          <div style="color:${GOLD};font-size:9px;letter-spacing:2px;font-weight:700;margin-top:3px">STUDIO</div>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3;color:${INK}">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #E2E8EE;color:#7C8893;font-size:11px">
          Highscore Tech · Lagos, Nigeria · CAC RC No. 7223102
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function briefRows(brief: Record<string, string>): string {
  return Object.entries(brief ?? {})
    .map(
      ([k, v]) =>
        `<tr><td style="padding:5px 12px 5px 0;color:#7C8893;font-size:12px;vertical-align:top;white-space:nowrap">${esc(k)}</td>
         <td style="padding:5px 0;color:${INK};font-size:12px">${esc(v)}</td></tr>`,
    )
    .join('');
}

/** Sends the customer receipt (invoice attached) and the internal job ticket. */
export async function sendStudioOrderEmails(orderId: string): Promise<void> {
  const admin = serviceClient();
  const { data } = await admin.from('studio_orders').select('*').eq('id', orderId).maybeSingle();
  const order = data as StudioOrder | null;
  if (!order) return;

  const projectLabel = PROJECT_TYPE_BY_KEY[order.project_type]?.label ?? order.project_type;
  const country = COUNTRY_NAME[order.country] ?? order.country;
  const amount = `$${Number(order.amount_usd).toFixed(2)}`;
  const statusUrl = `${SITE_URL}/studio/order/${order.reference}`;

  // Attach the invoice. If the render fails the email still goes out — the
  // download link on the status page is the fallback.
  let attachments: { filename: string; content: Buffer }[] | undefined;
  try {
    const pdf = await renderToBuffer(
      // @ts-expect-error react-pdf's internal element type
      createElement(StudioInvoicePdf, {
        invoice: {
          reference: order.reference,
          paidOn: fmtDate(order.paid_at),
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          country,
          packageName: order.package_name,
          projectType: projectLabel,
          amountUsd: Number(order.amount_usd),
          amountNgn: order.amount_ngn == null ? null : Number(order.amount_ngn),
          usdNgnRate: order.usd_ngn_rate == null ? null : Number(order.usd_ngn_rate),
          paymentMethod: order.payment_method,
          deliveryDue: fmtDate(order.delivery_due),
          deliveryChannel: order.delivery_channel,
          brief: order.brief ?? {},
        },
        siteUrl: SITE_URL,
      }),
    );
    attachments = [{ filename: `highscore-studio-invoice-${order.reference}.pdf`, content: pdf as Buffer }];
  } catch (err) {
    console.error('[studio] invoice pdf render failed:', err);
  }

  // ── Customer ──────────────────────────────────────────────────────────
  await sendEmail({
    to: order.customer_email,
    subject: `Payment received — your ${order.package_name} (${order.reference})`,
    attachments,
    html: shell(
      `Thank you, ${esc(order.customer_name.split(' ')[0])} — we’ve started work.`,
      `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3B4651">
         Your payment of <b>${amount}</b> for the <b>${esc(order.package_name)}</b> has been received.
         Your invoice is attached.
       </p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#FAF6EE;border-radius:8px;padding:14px;margin:0 0 16px">
         <tr><td style="font-size:12px;color:#7C8893;padding-bottom:4px">DELIVERY DATE</td></tr>
         <tr><td style="font-size:17px;font-weight:700;color:${INK}">${fmtDate(order.delivery_due)}</td></tr>
         <tr><td style="font-size:12px;color:#3B4651;padding-top:6px">
           We’ll send your finished work to your ${esc(order.delivery_channel)}: <b>${esc(order.delivery_handle)}</b>
         </td></tr>
       </table>
       <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#3B4651">
         Track this order any time at
         <a href="${statusUrl}" style="color:${GOLD};font-weight:600">${statusUrl}</a>
       </p>
       <p style="margin:0;font-size:12px;color:#7C8893">
         Reference ${esc(order.reference)} — quote it if you contact us.
       </p>`,
    ),
    text:
      `Thank you, ${order.customer_name}. Payment of ${amount} received for ${order.package_name}.\n` +
      `Delivery date: ${fmtDate(order.delivery_due)}\n` +
      `We'll send your work to your ${order.delivery_channel}: ${order.delivery_handle}\n` +
      `Track it: ${statusUrl}\nReference: ${order.reference}`,
  });

  // ── Internal job ticket ───────────────────────────────────────────────
  await sendEmail({
    to: emailConfig.admin,
    replyTo: order.customer_email,
    subject: `NEW STUDIO ORDER — ${order.package_name} ${amount} (${projectLabel})`,
    html: shell(
      `New paid order: ${esc(order.package_name)}`,
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:12px;margin:0 0 14px">
         <tr><td style="padding:5px 12px 5px 0;color:#7C8893;white-space:nowrap">Customer</td><td style="padding:5px 0">${esc(order.customer_name)} · ${esc(order.customer_email)}</td></tr>
         <tr><td style="padding:5px 12px 5px 0;color:#7C8893;white-space:nowrap">Country</td><td style="padding:5px 0">${esc(country)}</td></tr>
         <tr><td style="padding:5px 12px 5px 0;color:#7C8893;white-space:nowrap">Paid</td><td style="padding:5px 0"><b>${amount}</b>${order.amount_ngn ? ` (₦${Number(order.amount_ngn).toLocaleString('en-NG')})` : ''}</td></tr>
         <tr><td style="padding:5px 12px 5px 0;color:#7C8893;white-space:nowrap">Deliver by</td><td style="padding:5px 0"><b>${fmtDate(order.delivery_due)}</b></td></tr>
         <tr><td style="padding:5px 12px 5px 0;color:#7C8893;white-space:nowrap">Send to</td><td style="padding:5px 0">${esc(order.delivery_channel)} — ${esc(order.delivery_handle)}</td></tr>
         ${order.needed_by ? `<tr><td style="padding:5px 12px 5px 0;color:#7C8893;white-space:nowrap">Wanted by</td><td style="padding:5px 0">${fmtDate(order.needed_by)}</td></tr>` : ''}
       </table>
       <div style="border-top:1px solid #E2E8EE;padding-top:12px">
         <div style="font-size:10px;letter-spacing:1px;color:#7C8893;font-weight:700;margin-bottom:8px">THE BRIEF — ${esc(projectLabel.toUpperCase())}</div>
         <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${briefRows(order.brief ?? {})}</table>
       </div>`,
    ),
  });
}
