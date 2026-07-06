import { Link } from 'react-router-dom';
import PlatformShell from '../components/PlatformShell';
import { byId } from '../agentsConfig';

const DASHBOARD_URL = byId('brand-x').embedUrl;

export default function XAgentPage() {
  return (
    <PlatformShell fullBleed>
      <div className="iframe-page-header">
        <Link to="/brand" className="back-to-platform">← Brand Visibility</Link>
        <div className="iframe-page-title">
          <span className="iframe-page-eyebrow">X Agent</span>
          <span className="iframe-page-name">Voice AI builder conversations on X</span>
        </div>
        <a href={DASHBOARD_URL.replace('?embedded=true', '')} target="_blank" rel="noreferrer" className="iframe-open-external">
          Open in new tab ↗
        </a>
      </div>
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
