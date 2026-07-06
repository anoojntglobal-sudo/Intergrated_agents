import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { byId } from '../agentsConfig';

const DASHBOARD_URL = byId('brand-linkedin').embedUrl;

export default function LinkedinAgentPage() {
  return (
    <PlatformShell fullBleed>
      <div className="iframe-page-header">
        <Link to="/brand" className="back-to-platform">← Brand Visibility</Link>
        <div className="iframe-page-title">
          <span className="iframe-page-eyebrow">LinkedIn Agent</span>
          <span className="iframe-page-name">Voice AI builder signals on LinkedIn</span>
        </div>
        <a href={DASHBOARD_URL.replace('?embedded=true', '')} target="_blank" rel="noreferrer" className="iframe-open-external">
          Open in new tab ↗
        </a>
      </div>
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
