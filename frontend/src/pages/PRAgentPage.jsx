import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';

// Placeholder — partner agent. The PR Agent is built and maintained by a partner team;
// this section is reserved for them to plug their agent in. Do not implement here.
export default function PRAgentPage() {
  return (
    <PlatformShell>
      <Link to="/" className="back-to-platform">← All agents</Link>
      <div className="shell-eyebrow">PR Agent</div>
      <h1 className="shell-h1">PR Agent</h1>
      <p className="shell-sub">
        Finds the accounts that matter for PR — creators open to paid promotion and accounts that
        publish genuine, credible reviews of your product.
      </p>
      <div className="placeholder-wrap">
        <div className="aoc-icon">🤝</div>
        <h2>Partner agent — coming soon</h2>
        <p>
          This agent is delivered by a partner team and will appear here once connected.
          It plugs into the same KiteAI platform you’re using now.
        </p>
        <span className="aoc-status partner">Partner agent</span>
      </div>
    </PlatformShell>
  );
}
