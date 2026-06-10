// GET /api/payments/[id]/receipt.pdf
//
// Streams a branded PDF receipt for the specified payment row. Access
// scoped by RLS — the cookie-aware server client only returns the row if
// the caller is the owner or an admin.

import { renderToStream } from '@react-pdf/renderer';
import { createElement } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ReceiptPdf, type ReceiptData } from '@/lib/payments/ReceiptPdf';

export const runtime = 'nodejs';

interface Ctx {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://highzcore.tech';

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(d);
}

interface PaymentJoin {
  id: string;
  enrollment_id: string;
  installment_id: string | null;
  amount_ngn: number;
  status: string;
  alatpay_reference: string | null;
  created_at: string;
  enrollments: {
    total_ngn: number;
    paid_ngn: number;
    courses: { title: string } | null;
    users: { full_name: string | null; email: string } | null;
  } | null;
  installments: { sort_order: number; enrollment_id: string } | null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from('payments')
    .select(`
      id, enrollment_id, installment_id, amount_ngn, status, alatpay_reference, created_at,
      enrollments(total_ngn, paid_ngn, courses(title), users(full_name, email)),
      installments(sort_order, enrollment_id)
    `)
    .eq('id', id)
    .maybeSingle<PaymentJoin>();

  if (error || !payment) {
    return new Response('Receipt not found.', { status: 404 });
  }
  if (payment.status !== 'succeeded') {
    return new Response('Receipt is only available for completed payments.', { status: 400 });
  }

  // Count total installments for the enrolment so we can render "X of Y"
  let installmentTotal: number | null = null;
  if (payment.installment_id) {
    const { count } = await supabase
      .from('installments')
      .select('id', { count: 'exact', head: true })
      .eq('enrollment_id', payment.enrollment_id);
    installmentTotal = count ?? null;
  }

  const data: ReceiptData = {
    receiptNumber: payment.id.slice(0, 8).toUpperCase(),
    paidOn: formatDate(new Date(payment.created_at)),
    customerName:
      payment.enrollments?.users?.full_name ??
      payment.enrollments?.users?.email ??
      'Student',
    customerEmail: payment.enrollments?.users?.email ?? '',
    courseTitle: payment.enrollments?.courses?.title ?? 'Course',
    installmentIndex: payment.installments?.sort_order ?? null,
    installmentTotal,
    amountNgn: payment.amount_ngn,
    reference: payment.alatpay_reference ?? '—',
    enrollmentTotalNgn: payment.enrollments?.total_ngn ?? 0,
    enrollmentPaidNgn: payment.enrollments?.paid_ngn ?? 0,
  };

  const element = createElement(ReceiptPdf, { receipt: data, siteUrl: SITE_URL });
  // @ts-expect-error react-pdf's internal element type
  const pdfStream = await renderToStream(element);

  const webStream = new ReadableStream({
    start(controller) {
      pdfStream.on('data',  (chunk) => controller.enqueue(chunk));
      pdfStream.on('end',   () => controller.close());
      pdfStream.on('error', (err) => controller.error(err));
    },
  });

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="highscore-tech-receipt-${data.receiptNumber}.pdf"`,
      'Cache-Control': 'private, max-age=300',
    },
  });
}
