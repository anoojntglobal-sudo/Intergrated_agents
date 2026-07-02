import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { byId } from '../agentsConfig';

const DASHBOARD_URL = byId('brand-linkedin').embedUrl;

export default function LinkedinAgentPage() {
  return (
    <PlatformShell>
      <Link to="/brand" className="back-to-platform">← Brand Visibility</Link>
      <div className="shell-eyebrow">LinkedIn Agent</div>
      <h1 className="shell-h1">Voice AI builder signals <span className="accent">on LinkedIn</span></h1>
      <p className="shell-sub">
        Real-time scraping, classification, and prioritization of LinkedIn posts mentioning voice AI infrastructure.
        103 posts classified across 4 tiers. Embedded dashboard below.
      </p>
      <div className="linkedin-iframe-wrap">
        <iframe
          src={DASHBOARD_URL}
          title="LinkedIn Brand Visibility Dashboard"
          className="linkedin-iframe"
          allow="clipboard-write"
        />
      </div>
    </PlatformShell>
  );
}
