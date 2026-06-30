import { Link, useNavigate } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';

const PLATFORM_AGENTS = [
  {
    icon: '𝕏', title: 'X Agent', status: 'live', statusLabel: 'Active',
    to: '/brand/x',
    desc: 'Voice AI builder conversations on X — discovers builders in real time, classifies threads, and tracks signal across the firehose.',
    cta: 'Open dashboard',
  },
  {
    icon: 'in', title: 'LinkedIn Agent', status: 'live', statusLabel: 'Active',
    to: '/brand/linkedin',
    desc: 'Voice AI builder signals from LinkedIn — discovers technical talent, surfaces relevant conversations, and tracks the field across the professional graph.',
    cta: 'Open dashboard',
  },
  {
    icon: '⋯', title: 'More platforms', status: 'soon', statusLabel: 'Planned', to: null,
    desc: 'Reddit, YouTube and more — each new platform plugs into the same brand-visibility agent, so you can run everywhere your audience already is.',
    cta: 'Planned',
  },
];

export default function BrandVisibilityPage() {
  const navigate = useNavigate();
  return (
    <PlatformShell>
      <Link to="/" className="back-to-platform">← All agents</Link>
      <div className="shell-eyebrow">Brand Visibility Agent</div>
      <h1 className="shell-h1">Promote your product <span className="accent">where the conversations are</span></h1>
      <p className="shell-sub">
        Pick a platform to deploy the brand-visibility agent on. The X Agent is live today;
        LinkedIn and other platforms run on the same engine and arrive next.
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
              <span className="aoc-cta">{a.cta} {a.to ? '→' : ''}</span>
            </>
          );
          return a.to
            ? <div key={a.title} className={cls} style={{ animationDelay: `${i * 90}ms` }} onClick={() => navigate(a.to)}>{inner}</div>
            : <div key={a.title} className={cls} style={{ animationDelay: `${i * 90}ms` }}>{inner}</div>;
        })}
      </div>
    </PlatformShell>
  );
}
