import { Link, useNavigate } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';

const PLATFORM_AGENTS = [
  {
    icon: '𝕏', title: 'X Agent', status: 'live', statusLabel: 'Live', to: '/dashboard',
    desc: 'Discovers and scores X accounts for promotion — joins relevant pain-point conversations, finds influencers/PR contacts, and tracks the field. Opens the full X Agent dashboard.',
    cta: 'Open dashboard →',
  },
  {
    icon: 'in', title: 'LinkedIn Agent', status: 'soon', statusLabel: 'Coming soon', to: null,
    desc: 'The same brand-visibility engine for LinkedIn — relevant conversations, PR/influencer discovery, and market signal across LinkedIn.',
    cta: 'Coming soon',
  },
  {
    icon: '＋', title: 'More platforms', status: 'soon', statusLabel: 'Planned', to: null,
    desc: 'Reddit, YouTube, and more — each new platform plugs into the same brand-visibility agent. Add them and run everywhere relevant.',
    cta: 'Planned',
  },
];

export default function BrandVisibilityPage() {
  const navigate = useNavigate();
  return (
    <PlatformShell>
      <Link to="/" className="back-to-platform">← All agents</Link>
      <div className="shell-eyebrow">Brand Visibility Agent</div>
      <h1 className="shell-h1">Promote your product where the conversations are</h1>
      <p className="shell-sub">
        Pick a platform to run the brand-visibility agent on. The X Agent is live today; LinkedIn and
        other platforms plug into the same engine and arrive next.
      </p>
      <div className="agent-grid">
        {PLATFORM_AGENTS.map((a, i) => {
          const cls = `agent-option-card${a.to ? '' : ' disabled'}`;
          const inner = (
            <>
              <div className="aoc-icon">{a.icon}</div>
              <div className="aoc-title">{a.title}</div>
              <div className="aoc-desc">{a.desc}</div>
              <span className={`aoc-status ${a.status}`}>{a.statusLabel}</span>
              <span className="aoc-cta">{a.cta}</span>
            </>
          );
          return a.to
            ? <div key={a.title} className={cls} style={{ animationDelay: `${i * 80}ms` }} onClick={() => navigate(a.to)}>{inner}</div>
            : <div key={a.title} className={cls} style={{ animationDelay: `${i * 80}ms` }}>{inner}</div>;
        })}
      </div>
    </PlatformShell>
  );
}
