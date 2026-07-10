// The canonical list of admin areas. This is the single source of truth for:
//   • the sidebar nav (AdminShell attaches an icon per key),
//   • the middleware route guard (which section a /admin path belongs to),
//   • the per-staff access editor on the staff detail page,
//   • the server-action permission checks.
//
// A staff member's `users.admin_sections` holds a subset of these keys. An
// `admin` role implicitly has all of them. Add a new admin page → add one row
// here and everything else (nav, guard, editor) picks it up.

export interface AdminSection {
  key: string;
  href: string;
  label: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { key: 'dashboard',   href: '/admin',             label: 'Dashboard' },
  { key: 'portfolio',   href: '/admin/portfolio',   label: 'Portfolio' },
  { key: 'courses',     href: '/admin/courses',     label: 'Courses' },
  { key: 'enrollments', href: '/admin/enrollments', label: 'Enrolments' },
  { key: 'staff',       href: '/admin/staff',       label: 'Staff' },
  { key: 'projects',    href: '/admin/projects',    label: 'Projects' },
  { key: 'finance',     href: '/admin/finance',     label: 'Finance' },
  { key: 'reports',     href: '/admin/reports',     label: 'EOD reports' },
  { key: 'performance', href: '/admin/performance', label: 'Performance' },
  { key: 'trading-bot', href: '/admin/trading-bot', label: 'Trading Bot' },
  { key: 'contact',     href: '/admin/contact',     label: 'Contact' },
  { key: 'ledger',      href: '/admin/ledger',      label: 'Ledger' },
  { key: 'nin-docs',    href: '/admin/nin-docs',    label: 'NIN docs' },
  { key: 'audit',       href: '/admin/audit',       label: 'Audit log' },
  { key: 'settings',    href: '/admin/settings',    label: 'Settings' },
];

export const ADMIN_SECTION_KEYS: string[] = ADMIN_SECTIONS.map((s) => s.key);

// Which section owns a given /admin path. The most specific (longest) href
// wins, so /admin/portfolio/new → 'portfolio'; bare /admin (or any unmapped
// /admin/* child) falls back to 'dashboard'.
export function sectionForPath(path: string): AdminSection | null {
  const matches = ADMIN_SECTIONS
    .filter((s) => s.key !== 'dashboard')
    .filter((s) => path === s.href || path.startsWith(`${s.href}/`));
  if (matches.length > 0) {
    return matches.reduce((a, b) => (b.href.length > a.href.length ? b : a));
  }
  if (path === '/admin' || path.startsWith('/admin/')) {
    return ADMIN_SECTIONS.find((s) => s.key === 'dashboard') ?? null;
  }
  return null;
}

// The set of nav hrefs a user may see, given their effective section keys.
export function allowedHrefs(sections: string[]): string[] {
  return ADMIN_SECTIONS.filter((s) => sections.includes(s.key)).map((s) => s.href);
}
