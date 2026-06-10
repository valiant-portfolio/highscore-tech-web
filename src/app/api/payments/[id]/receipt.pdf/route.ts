// GET /api/payments/[id]/receipt.pdf
// Branded PDF receipt — RLS-scoped so only the owner or admin can fetch.

import { createElement } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ReceiptPdf, type ReceiptData } from '@/lib/payments/ReceiptPdf';
import { pdfResponse } from '@/lib/staff/pdf-stream';

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

  if (error || !payment) return new Response('Receipt not found.', { status: 404 });
  if (payment.status !== 'succeeded')
    return new Response('Receipt is only available for completed payments.', { status: 400 });

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
  return pdfResponse(element, `highscore-tech-receipt-${data.receiptNumber}.pdf`, 300);
}
