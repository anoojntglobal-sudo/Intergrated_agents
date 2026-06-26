import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Full-screen platform shell (topbar + content) used by the landing + agent-section pages.
export default function PlatformShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="platform-shell">
      <div className="shell-topbar">
        <Link to="/" className="shell-brand" style={{ textDecoration: 'none' }}>
          <span className="k">Kite</span><span className="ai">AI</span>
          <span className="tag">Multi-Agent Platform</span>
        </Link>
        <div className="shell-userbox">
          {user?.email && <span>{user.email}</span>}
          <button className="shell-logout" onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
        </div>
      </div>
      <div className="shell-main">{children}</div>
    </div>
  );
}
