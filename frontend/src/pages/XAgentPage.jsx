import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';

const DASHBOARD_URL = 'https://kiteai-brand-visibility-py.onrender.com/dashboard/x?embedded=true';

export default function XAgentPage() {
  return (
    <PlatformShell>
      <Link to="/brand" className="back-to-platform">← Brand Visibility</Link>
      <div className="shell-eyebrow">X Agent</div>
      <h1 className="shell-h1">Voice AI builder conversations <span className="accent">on X</span></h1>
      <p className="shell-sub">
        Real-time scraping, classification, and prioritization of X (Twitter) posts mentioning voice AI infrastructure.
        5,078 tweets classified across the A–K taxonomy. Embedded dashboard below.
      </p>
      <div className="x-iframe-wrap">
        <iframe
          src={DASHBOARD_URL}
          title="X Brand Visibility Dashboard"
          className="x-iframe"
          allow="clipboard-write"
        />
      </div>
    </PlatformShell>
  );
}
