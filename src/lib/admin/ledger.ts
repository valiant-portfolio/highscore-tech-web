// Ledger data — revenue from Academy enrollments by month, against active
// staff payroll. Single source of truth read by /admin/ledger.

import 'server-only';
import { serviceClient } from '@/lib/supabase/service';

export interface LedgerMonth {
  month: string;           // 'YYYY-MM'
  monthLabel: string;      // 'June 2026'
  revenueNgn: number;
  payrollNgn: number;
  netNgn: number;
}

export interface LedgerData {
  months: LedgerMonth[];
  totalRevenueNgn: number;
  totalPayrollNgn: number;
  totalNetNgn: number;
  monthlyPayrollRunRate: number;
  paymentCount: number;
}

function monthKey(dateIso: string): string {
  return dateIso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d);
}

export async function getLedger(): Promise<LedgerData> {
  const admin = serviceClient();
  const [paymentsRes, staffRes] = await Promise.all([
    admin.from('payments').select('amount_ngn, created_at, status').eq('status', 'succeeded'),
    admin.from('staff').select('salary_ngn, start_date').eq('status', 'active'),
  ]);

  const payments = paymentsRes.data ?? [];
  const staff    = staffRes.data ?? [];

  const monthlyPayroll = staff.reduce((s, r) => s + (r.salary_ngn ?? 0), 0);

  // Group revenue by created_at month
  const revByMonth = new Map<string, number>();
  payments.forEach((p) => {
    const key = monthKey(p.created_at);
    revByMonth.set(key, (revByMonth.get(key) ?? 0) + (p.amount_ngn ?? 0));
  });

  // Build a 6-month rolling window ending this month
  const now = new Date();
  const months: LedgerMonth[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const revenueNgn = revByMonth.get(key) ?? 0;

    // Payroll counts only for months on/after each staff's start date.
    const payrollNgn = staff.reduce((sum, r) => {
      if (!r.start_date) return sum + (r.salary_ngn ?? 0);
      const sd = new Date(r.start_date);
      const sdKey = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}`;
      if (key >= sdKey) return sum + (r.salary_ngn ?? 0);
      return sum;
    }, 0);

    months.push({
      month: key,
      monthLabel: monthLabel(key),
      revenueNgn,
      payrollNgn,
      netNgn: revenueNgn - payrollNgn,
    });
  }

  const totalRevenueNgn = months.reduce((s, m) => s + m.revenueNgn, 0);
  const totalPayrollNgn = months.reduce((s, m) => s + m.payrollNgn, 0);

  return {
    months,
    totalRevenueNgn,
    totalPayrollNgn,
    totalNetNgn: totalRevenueNgn - totalPayrollNgn,
    monthlyPayrollRunRate: monthlyPayroll,
    paymentCount: payments.length,
  };
}
