import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { SECTIONS, sectionStatus } from '../agentsConfig';

// Renders one card per section from the registry (agentsConfig.js).
// A section shows "Active" as soon as any agent in it is live.
export default function LandingPage() {
  return (
    <PlatformShell>
      <div className="shell-eyebrow">KiteAI · Agent Platform</div>
      <h1 className="shell-h1">Grow your product with <span className="accent">intelligent agents</span></h1>
      <p className="shell-sub">
        Add a product and KiteAI deploys specialized agents that work for it around the clock —
        promoting it where the conversations are, finding the right people, and tracking the market.
        Choose an agent to begin.
      </p>
      <div className="agent-grid">
        {SECTIONS.map((s, i) => {
          const live = sectionStatus(s.id) === 'live';
          return (
            <Link key={s.id} to={s.to} className="agent-option-card" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="aoc-icon">{s.icon}</div>
              <div className="aoc-title">{s.title}</div>
              <div className="aoc-desc">{s.desc}</div>
              <span className={`aoc-status ${live ? 'live' : 'soon'}`}>{live ? 'Active' : 'Coming soon'}</span>
              <span className="aoc-cta">{live ? 'Open agent' : 'Preview'} →</span>
            </Link>
          );
        })}
      </div>
    </PlatformShell>
  );
}
