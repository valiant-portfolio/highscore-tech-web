// Role-specific content used by the staff PDF generators. Single source of
// truth so a tweak to Olivia's job description doesn't require touching
// four files. Reframed to Highscore Tech (AI services + Academy) — no
// "Love meet" references.

export interface RoleContent {
  responsibilities: string[];
  workflowNotes: string[];     // The rules from scope-of-work — what this role specifically must do
  ipScope: string;             // For the contract — what kind of work product they create
}

const SHARED_WORKFLOW = [
  'Single approval point — the CEO approves all outbound work before it ships.',
  'Single merger — only the CEO merges Pull Requests; developers PR into `dev` and the CEO promotes to `main`.',
  'Single source of truth — Olivia owns the project tracking document; if it is not in the doc, it is not on the team radar.',
  'Daily SOD + EOD posts in the team Google Workspace group; blockers at the top.',
];

export const ROLE_CONTENT: Record<string, RoleContent> = {
  olivia: {
    responsibilities: [
      'Single channel between the team and the CEO. Batch and present every idea, bug, graphic, and post; nothing reaches the CEO half-formed.',
      'Own and maintain the project tracking document — task, owner, status, deadline, outcome, every working day.',
      'Route CEO-approved work to Godswill (creative / admin), Promise or Samuel (engineering), or back to the originator with notes.',
      'Run the daily SOD + EOD cadence. Surface blockers to the CEO when a decision is needed; write a short rollup the CEO can scan in 30 seconds.',
      'People ops — onboarding, email + dashboard access provisioning, payroll calendar, performance flags.',
      'Marketing strategy — propose, execute, and report against a written marketing plan for both Highscore Tech and the Academy.',
      'Monitor Academy + studio growth metrics and respond promptly to enquiries through email, social, and in-app channels.',
      'Quality assurance — use the platform daily, surface bugs with clear repro steps, route them to the right developer.',
    ],
    workflowNotes: SHARED_WORKFLOW,
    ipScope: 'documentation, marketing copy, project plans, internal processes, and any commercial communication produced in the course of duties',
  },

  godswill: {
    responsibilities: [
      'Creative output across the brand — in-app sections, feed cards, profile assets, social media creatives, push-notification visuals. All graphics pass through Olivia for CEO approval before publishing.',
      'Platform operations — database housekeeping, admin-dashboard tasks, live support across in-app, email, and Telegram.',
      'Maintain a moderation playbook — the precedent log that keeps decisions consistent over time.',
      'Identify gaps in the admin dashboard; write up missing features and pass them to Olivia for escalation.',
      'Partner with Olivia on marketing campaigns, hooks, and ideas surfaced from daily time inside the product.',
    ],
    workflowNotes: SHARED_WORKFLOW,
    ipScope: 'graphics, brand assets, social media creatives, copywriting, moderation guidelines, and any creative deliverables produced in the course of duties',
  },

  promise: {
    responsibilities: [
      'Architecture and big features — multi-system work across the AI studio products, the Academy platform, and client builds.',
      'Database + backend — Supabase schema, RLS, RPCs, migrations, Edge Functions, triggers, cron.',
      'Code review on every PR Samuel opens — read carefully, teach in feedback. Strong sign-off signals "ready for the CEO" but ONLY the CEO merges.',
      'Production reliability — first responder when something breaks. Reproduce, hotfix if urgent, post-mortem after.',
      'Branch discipline — branch off `dev` → PR back into `dev`. Never PR to `main`. Never push directly.',
    ],
    workflowNotes: SHARED_WORKFLOW,
    ipScope: 'source code, technical designs, database schemas, infrastructure configurations, code reviews, and any technical deliverables produced in the course of duties',
  },

  samuel: {
    responsibilities: [
      'Junior-sized feature work (1–2 days each) on the Academy platform, the AI studio products, or client projects — assigned through Olivia and scoped with Promise.',
      'Bug fixing — same discipline whether the task is internal or for a paying client.',
      'Branch discipline — branch off `dev` → PR back into `dev`. Tag Promise for review. Wait for the CEO to merge — never self-merge.',
      'Honest signalling — ask early when stuck. Read every PR on the team to learn the codebase faster.',
    ],
    workflowNotes: SHARED_WORKFLOW,
    ipScope: 'source code, technical designs, and any technical deliverables produced in the course of duties',
  },

  vany: {
    responsibilities: [
      'Technical leadership across the studio — drive architecture, technology choices, and standards for AI products, the Academy platform, and major client builds.',
      'Code review on every Promise + Samuel PR. Senior sign-off signals ready-to-merge; the CEO is still the only person who merges.',
      'Design and own the most complex subsystems — payments, AI pipelines, data platforms — and pair with Promise on hand-off.',
      'Production reliability — on-call partner for Promise; co-own post-mortems for serious incidents.',
      'Mentor — explicit responsibility for accelerating Samuel and Promise. Pair regularly, leave precise review comments.',
      'Recruiting + technical interviewing for future engineering hires.',
      'Branch discipline — branch off `dev` → PR back into `dev`. Senior status does not bypass the CEO-merges-only rule.',
    ],
    workflowNotes: SHARED_WORKFLOW,
    ipScope: 'source code, technical designs, architectural decisions, code reviews, and any technical deliverables produced in the course of duties',
  },
};

// Olivia's salary is documented as 50k base + 20k data allowance. The other
// roles take their full salary as base.
export interface SalaryBreakdown {
  base: number;
  allowance?: { amount: number; label: string };
  total: number;
}

export function breakdownSalary(slug: string, totalNgn: number): SalaryBreakdown {
  if (slug === 'olivia') {
    return { base: 50000, allowance: { amount: 20000, label: 'Data allowance' }, total: totalNgn };
  }
  return { base: totalNgn, total: totalNgn };
}
