import { useParams, Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { byId } from '../agentsConfig';

// Generic embed page — renders any registry agent that has an embedUrl, at /a/:id.
// A new embedded agent needs ONLY a registry entry in agentsConfig.js (no new file,
// no new route) — it's reachable immediately at /a/<its-id>.
export default function AgentEmbedPage() {
  const { id } = useParams();
  const agent = byId(id);

  if (!agent || !agent.embedUrl) {
    return (
      <PlatformShell>
        <Link to="/" className="back-to-platform">← All agents</Link>
        <div className="shell-eyebrow">Agent</div>
        <h1 className="shell-h1">Agent not found</h1>
        <p className="shell-sub">No embedded agent is registered for “{id}”.</p>
      </PlatformShell>
    );
  }

  return (
    <PlatformShell>
      <Link to="/" className="back-to-platform">← All agents</Link>
      <div className="shell-eyebrow">{agent.title}</div>
      <h1 className="shell-h1">{agent.title}</h1>
      <p className="shell-sub">{agent.desc}</p>
      <div className="x-iframe-wrap">
        <iframe src={agent.embedUrl} title={agent.title} className="x-iframe" allow="clipboard-write" />
      </div>
    </PlatformShell>
  );
}
