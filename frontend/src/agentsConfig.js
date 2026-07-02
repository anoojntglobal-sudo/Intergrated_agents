// ─────────────────────────────────────────────────────────────────────────────
// AGENT REGISTRY — the single source of truth for every agent on the platform.
//
// To ADD an agent: add one entry to AGENTS below.
//   • Embedded dashboard?  give it an `embedUrl` — it's reachable at /a/<id>
//     via the generic embed page, so no new file/route is needed.
//   • Its own section page? give it a `route` and add that route in App.jsx.
// The landing page and every section render from this file, so a new agent shows
// up automatically once it's listed here.
// ─────────────────────────────────────────────────────────────────────────────

export const AGENTS = [
  // ── Brand Visibility — teammate (Anooj): Python dashboards on Render ──
  {
    id: 'brand-x', section: 'brand', title: 'X Agent', icon: '𝕏',
    status: 'live', route: '/brand/x',
    embedUrl: 'https://kiteai-brand-visibility-py.onrender.com/dashboard/x?embedded=true',
    desc: 'Voice AI builder conversations on X — discovers builders in real time, classifies threads, and tracks signal across the firehose.',
    cta: 'Open dashboard',
  },
  {
    id: 'brand-linkedin', section: 'brand', title: 'LinkedIn Agent', icon: 'in',
    status: 'live', route: '/brand/linkedin',
    embedUrl: 'https://kiteai-brand-visibility-py.onrender.com/dashboard/linkedin?embedded=true',
    desc: 'Voice AI builder signals from LinkedIn — discovers technical talent, surfaces relevant conversations, and tracks the field across the professional graph.',
    cta: 'Open dashboard',
  },
  {
    id: 'brand-more', section: 'brand', title: 'More platforms', icon: '⋯',
    status: 'soon', route: null,
    desc: 'Reddit, YouTube and more — each new platform plugs into the same brand-visibility agent, so you can run everywhere your audience already is.',
    cta: 'Planned',
  },

  // ── PR — your deployed "X Influencer & PR" agent (Vercel) ──
  {
    id: 'pr-x', section: 'pr', title: 'PR Agent', icon: '◇',
    status: 'live', route: '/pr',
    embedUrl: 'https://pr-x-agent.vercel.app/',
    desc: 'Finds the accounts that move your reputation — creators open to paid promotion and the voices that publish genuine, credible reviews of your product.',
    cta: 'Open agent',
  },

  // ── Leaderboard — planned ──
  {
    id: 'leaderboard', section: 'leaderboard', title: 'Leaderboard Agent', icon: '△',
    status: 'soon', route: '/leaderboard',
    desc: 'A live leaderboard of the top products and applications in your field — so you always know the landscape and exactly where you stand.',
    cta: 'Preview',
  },
];

// Top-level cards on the landing page (one per section).
export const SECTIONS = [
  {
    id: 'brand', title: 'Brand Visibility Agent', icon: '◎', to: '/brand',
    desc: 'Gets your product discovered — joins the right conversations in your field, finds where it fits, and surfaces it to the people who need it. X + LinkedIn live today.',
  },
  {
    id: 'pr', title: 'PR Agent', icon: '◇', to: '/pr',
    desc: 'Finds the accounts that move your reputation — creators open to paid promotion and the voices that publish genuine, credible reviews of your product.',
  },
  {
    id: 'leaderboard', title: 'Leaderboard Agent', icon: '△', to: '/leaderboard',
    desc: 'A live leaderboard of the top products and applications in your field — so you always know exactly where you stand.',
  },
];

export const bySection = (id) => AGENTS.filter(a => a.section === id);
export const byId       = (id) => AGENTS.find(a => a.id === id) || null;
// A section is "live" if any agent in it is live.
export const sectionStatus = (id) =>
  bySection(id).some(a => a.status === 'live') ? 'live' : 'soon';
