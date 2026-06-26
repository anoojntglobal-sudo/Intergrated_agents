import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';

const OPTIONS = [
  {
    to: '/brand', icon: '📣', title: 'Brand Visibility Agent', status: 'live', statusLabel: 'Live',
    desc: 'Get your product discovered — agents join the right conversations about your field and surface your product where it fits. Starts with X; more platforms coming.',
    cta: 'Open →',
  },
  {
    to: '/pr', icon: '🤝', title: 'PR Agent', status: 'partner', statusLabel: 'Partner agent',
    desc: 'Find the accounts that matter for PR: creators available for paid promotion and accounts that publish genuine, credible reviews of your product.',
    cta: 'View →',
  },
  {
    to: '/leaderboard', icon: '🏆', title: 'Leaderboard Agent', status: 'partner', statusLabel: 'Partner agent',
    desc: 'A real-time leaderboard of the top products and applications in your field, so you always know the landscape and where you stand.',
    cta: 'View →',
  },
];

export default function LandingPage() {
  return (
    <PlatformShell>
      <div className="shell-eyebrow">Your AI growth team</div>
      <h1 className="shell-h1">Pick an agent to grow your product</h1>
      <p className="shell-sub">
        Add a product and KiteAI deploys specialized AI agents across X, LinkedIn and beyond —
        to promote it, find the right people, and track the market. Start with one of the agents below.
      </p>
      <div className="agent-grid">
        {OPTIONS.map((o, i) => (
          <Link key={o.to} to={o.to} className="agent-option-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="aoc-icon">{o.icon}</div>
            <div className="aoc-title">{o.title}</div>
            <div className="aoc-desc">{o.desc}</div>
            <span className={`aoc-status ${o.status}`}>{o.statusLabel}</span>
            <span className="aoc-cta">{o.cta}</span>
          </Link>
        ))}
      </div>
    </PlatformShell>
  );
}
