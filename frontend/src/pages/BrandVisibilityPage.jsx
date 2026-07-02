import { Link, useNavigate } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { bySection } from '../agentsConfig';

// Renders the Brand Visibility platform agents from the registry (agentsConfig.js).
export default function BrandVisibilityPage() {
  const navigate = useNavigate();
  const agents = bySection('brand');
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
        {agents.map((a, i) => {
          const cls = `agent-option-card${a.route ? '' : ' disabled'}`;
          const inner = (
            <>
              <div className="aoc-icon">{a.icon}</div>
              <div className="aoc-title">{a.title}</div>
              <div className="aoc-desc">{a.desc}</div>
              <span className={`aoc-status ${a.status}`}>{a.status === 'live' ? 'Active' : 'Planned'}</span>
              <span className="aoc-cta">{a.cta} {a.route ? '→' : ''}</span>
            </>
          );
          return a.route
            ? <div key={a.id} className={cls} style={{ animationDelay: `${i * 90}ms` }} onClick={() => navigate(a.route)}>{inner}</div>
            : <div key={a.id} className={cls} style={{ animationDelay: `${i * 90}ms` }}>{inner}</div>;
        })}
      </div>
    </PlatformShell>
  );
}
