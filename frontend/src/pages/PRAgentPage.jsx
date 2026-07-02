import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { byId } from '../agentsConfig';

// PR Agent — embeds your deployed "X Influencer & PR" agent (URL from the registry).
export default function PRAgentPage() {
  const agent = byId('pr-x');
  return (
    <PlatformShell>
      <Link to="/" className="back-to-platform">← All agents</Link>
      <div className="shell-eyebrow">PR Agent</div>
      <h1 className="shell-h1">Reach the voices that <span className="accent">shape your reputation</span></h1>
      <p className="shell-sub">
        Finds the accounts that move your reputation on X — creators open to paid promotion and the
        voices that publish genuine, credible reviews of your product. Embedded dashboard below.
      </p>
      <div className="x-iframe-wrap">
        <iframe
          src={agent.embedUrl}
          title="PR Agent Dashboard"
          className="x-iframe"
          allow="clipboard-write"
        />
      </div>
    </PlatformShell>
  );
}
