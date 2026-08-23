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

// The creative side has no branches or pull requests, so it gets its own short
// set of governance rules. How the work actually flows week to week lives in
// the Company Operating Guide, not in a job description.
const CREATIVE_WORKFLOW = [
  'Paired role — Rofiat and Olivia work together at every step. Content, captions, timing and promotion are decided jointly; neither of them ships a decision alone.',
  'Single approval point — the CEO approves all outbound work before it publishes.',
  'Single source of truth — Olivia owns the project tracking document; if it is not in the doc, it is not on the team radar.',
  'Daily SOD + EOD posts in the team channel; blockers at the top.',
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

  rofiat: {
    responsibilities: [
      'Video editing and production — every finished video that leaves Highscore Studio, both paid client work and our own brand content. This is the core of the role.',
      'Work as a pair with Olivia. The two of you plan together and decide together; nothing here is done alone or handed back and forth.',
      'Turn each song the CEO delivers into content. With Olivia, work out what it should become — which cuts, which formats, which platforms, and what the piece is meant to achieve.',
      'Plan the caption, the posting time and the promotion angle for every piece, agreed jointly with Olivia before anything goes out.',
      'Media strategy and planning with Olivia — what we post, why we are posting it, and what we expect it to bring back.',
      'Produce the creatives for paid advertising, built from the songs and videos already made, so campaigns are not starting from a blank page.',
      'Hold the visual standard. Every output carries the Highscore Studio look — consistent typography, colour, pacing and finish — so the work is recognisable before the logo appears.',
      'Deliver client orders to the brief and on the promised date, including filming on location where the package calls for it.',
      'Keep the asset library in order so footage, stills and finished pieces can be reused rather than remade.',
    ],
    workflowNotes: CREATIVE_WORKFLOW,
    ipScope: 'video edits, filmed and generated footage, motion graphics, thumbnails, social creatives, advertising assets, captions, content plans, and any creative deliverables produced in the course of duties',
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

/**
 * Resolve a staff member's role content from their slug.
 *
 * Slugs used to be bare first names ("olivia"), but newer records are full
 * names ("onifade-rofiat-omowunmi"). A plain ROLE_CONTENT[slug] lookup misses
 * those, and the PDF generators silently fall back to "Job description not
 * available for this role" — a blank document handed to a new hire.
 *
 * So: exact match first, then match a role key as a whole word inside the slug.
 */
export function roleContentFor(slug: string): RoleContent | undefined {
  const exact = ROLE_CONTENT[slug];
  if (exact) return exact;
  const parts = slug.toLowerCase().split('-');
  for (const key of Object.keys(ROLE_CONTENT)) {
    if (parts.includes(key)) return ROLE_CONTENT[key];
  }
  return undefined;
}

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
