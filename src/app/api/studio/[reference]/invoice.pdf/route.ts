// GET /api/studio/[reference]/invoice.pdf
//
// Authorization is the reference itself: Studio orders are placed by guests, so
// there is no session to check. The reference is a random 16-hex-char token
// that only reaches the customer's browser and their confirmation email — the
// same capability-URL model the order status page uses.
//
// Only issued for orders that are actually paid.

import { createElement } from 'react';
import { getStudioOrder } from '@/lib/studio/queries';
import { StudioInvoicePdf } from '@/lib/studio/InvoicePdf';
import { pdfResponse } from '@/lib/staff/pdf-stream';
import { PROJECT_TYPE_BY_KEY } from '@/lib/studio/catalog';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const order = await getStudioOrder(reference);

  if (!order) {
    return Response.json({ error: 'Invoice not found.' }, { status: 404 });
  }
  if (order.payment_status !== 'succeeded') {
    return Response.json(
      { error: 'The invoice is available once payment is complete.' },
      { status: 400 },
    );
  }

  const element = createElement(StudioInvoicePdf, {
    invoice: {
      reference: order.reference,
      paidOn: fmtDate(order.paid_at),
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      packageName: order.package_name,
      projectType: PROJECT_TYPE_BY_KEY[order.project_type]?.label ?? order.project_type,
      amountNgn: Number(order.amount_ngn),
      addons: order.addons ?? [],
      paymentMethod: order.payment_method,
      deliveryDue: fmtDate(order.delivery_due),
      deliveryChannel: order.delivery_channel,
      brief: order.brief ?? {},
    },
    siteUrl: SITE_URL,
  });

  return pdfResponse(element, `highscore-studio-invoice-${order.reference}.pdf`, 60);
}
