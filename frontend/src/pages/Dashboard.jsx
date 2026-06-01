import { useEffect, useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useAgent } from '../context/AgentContext';
import { Link }     from 'react-router-dom';

function scoreColor(s) {
  return s >= 65 ? '#00C896' : s >= 45 ? '#F9A825' : '#888';
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="stat-card" style={{ borderColor: color }}>
      <div className="stat-card-top">
        {icon && <span className="stat-icon">{icon}</span>}
        <div className="stat-value" style={{ color }}>{value ?? '—'}</div>
      </div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function RunRow({ run }) {
  const statusColor = run.status === 'completed' ? '#00C896'
    : run.status === 'running'  ? '#1D9BF0'
    : run.status === 'quota_exhausted' ? '#F9A825'
    : '#FF4444';
  const date = run.started_at ? new Date(run.started_at) : null;
  return (
    <div className="run-row">
      <div className="run-row-status">
        <span className="run-dot" style={{ background: statusColor }} />
        <span className="run-status-text" style={{ color: statusColor }}>
          {run.status === 'quota_exhausted' ? 'quota exhausted' : run.status}
        </span>
      </div>
      <span className="run-by">{run.triggered_by}</span>
      <div className="run-counts">
        <span className="run-added">+{run.accounts_added ?? 0} new</span>
        <span className="run-skip">{run.duplicates_skipped ?? 0} updated</span>
      </div>
      <span className="run-date">
        {date ? `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : '—'}
      </span>
    </div>
  );
}

function TopAccountCard({ account }) {
  const handle = (account.handle || '').replace(/^@/, '');
  return (
    <a
      href={`https://x.com/${handle}`}
      target="_blank"
      rel="noreferrer"
      className="top-account-card"
    >
      <img
        src={account.avatar}
        alt={account.name}
        className="tac-avatar"
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div className="tac-body">
        <div className="tac-name">
          {account.name}
          {account.verified ? <span className="verified-badge"> ✓</span> : null}
        </div>
        <div className="tac-handle">@{handle}</div>
        <div className="tac-meta">
          <span className={`track-badge track-${account.track}`}>Track {account.track}</span>
          <span className="tac-tier">{account.tier}</span>
          <span className="tac-type">{account.account_type}</span>
        </div>
        <div className="tac-followers">
          {(account.followers || 0).toLocaleString()} followers
        </div>
      </div>
      <div className="tac-score" style={{ color: scoreColor(account.overall) }}>
        <div className="tac-score-num">{account.overall}</div>
        <div className="tac-score-label">score</div>
      </div>
    </a>
  );
}

export default function Dashboard() {
  const { apiFetch }             = useAuth();
  const { running, onRunComplete } = useAgent();
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [lastFetch,  setLastFetch]  = useState(null);
  const [liveNew,    setLiveNew]    = useState(0);

  function loadStats(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    apiFetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(d => {
        setStats(d);
        setLastFetch(new Date());
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        setError(err.message === 'Failed to fetch'
          ? 'Cannot reach backend — make sure the server is running.'
          : err.message);
        setLoading(false);
        setRefreshing(false);
      });
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => {
    const unsub = onRunComplete(summary => {
      setLiveNew(summary.accountsAdded ?? 0);
      loadStats(true);
    });
    return unsub;
  }, [onRunComplete]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error)   return (
    <div className="page" style={{ padding: 32 }}>
      <div className="page-error">{error}</div>
      <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => loadStats()}>Retry</button>
    </div>
  );

  const t = stats?.totals || {};

  return (
    <div className="page dashboard-page">

      {/* Banners */}
      {running && (
        <div className="dash-live-banner">
          <span className="live-dot" />
          Agent is running — dashboard refreshes automatically when complete
        </div>
      )}
      {liveNew > 0 && !running && (
        <div className="dash-new-banner">
          ✅ Last run added <strong>{liveNew} new accounts</strong> — data updated
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          {lastFetch && <div className="last-fetch">Updated {lastFetch.toLocaleTimeString()}</div>}
          <h1>Dashboard</h1>
          <p className="page-sub">Monthly influencer & PR discovery overview</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={() => loadStats(true)} disabled={refreshing}>
            {refreshing ? '↻ Refreshing…' : '↻ Refresh'}
          </button>
          <Link to="/agent" className="btn-primary">⚡ Run Agent</Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="stat-grid">
        <StatCard label="Total Accounts" value={t.total}     color="#1D9BF0" icon="◉" />
        <StatCard label="Avg Score"      value={t.avg_score} color="#00C896" icon="★" sub="/ 100" />
        <StatCard label="DM Open"        value={t.dm_open}   color="#F9A825" icon="💬" />
        <StatCard label="Has Email"      value={t.has_email} color="#C084FC" icon="✉" />
      </div>

      {/* Charts row */}
      <div className="dash-grid">
        {/* Account Types */}
        <div className="dash-card">
          <h3>Account Types</h3>
          {(stats?.byType || []).map(r => (
            <div key={r.type} className="bar-row">
              <span className="bar-label">{r.type || 'Unknown'}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.min(100,(r.count/(t.total||1))*100)}%` }} />
              </div>
              <span className="bar-count">{r.count}</span>
            </div>
          ))}
        </div>

        {/* Reach Tiers */}
        <div className="dash-card">
          <h3>Reach Tiers</h3>
          {(stats?.byTier || []).map(r => (
            <div key={r.tier} className="bar-row">
              <span className="bar-label">{r.tier || 'Unknown'}</span>
              <div className="bar-track">
                <div className="bar-fill teal" style={{ width: `${Math.min(100,(r.count/(t.total||1))*100)}%` }} />
              </div>
              <span className="bar-count">{r.count}</span>
            </div>
          ))}
        </div>

        {/* Pipeline Tracks */}
        <div className="dash-card">
          <h3>Pipeline Tracks</h3>
          {(stats?.byTrack || []).map(r => (
            <div key={r.track} className="track-pill">
              <span className={`track-badge track-${r.track}`}>Track {r.track}</span>
              <span>{r.track === 'A' ? 'Pro Collab Pipeline' : 'Ads Audience Only'}</span>
              <span className="track-cnt">{r.count}</span>
            </div>
          ))}
          <div className="track-note">
            Track A = contact directly · Track B = use for ads targeting
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="dash-card">
          <h3>Score Distribution</h3>
          {[
            { label: 'Tier 1 (≥65)', color: '#00C896', count: (stats?.topAccounts || []).filter(a => a.overall >= 65).length },
            { label: 'Tier 2 (45–64)', color: '#F9A825', count: (stats?.topAccounts || []).filter(a => a.overall >= 45 && a.overall < 65).length },
            { label: 'Archive (<45)', color: '#888', count: (stats?.topAccounts || []).filter(a => a.overall < 45).length },
          ].map(s => (
            <div key={s.label} className="bar-row">
              <span className="bar-label" style={{ color: s.color }}>{s.label}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.min(100,(s.count/((stats?.topAccounts||[]).length||1))*100)}%`, background: s.color }} />
              </div>
              <span className="bar-count">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Accounts — clickable cards linking to X profiles */}
      <div className="dash-card top-accounts-card" style={{ marginBottom: 16 }}>
        <div className="dash-card-header">
          <h3>Top Accounts by Score</h3>
          <Link to="/accounts" className="dash-see-all">See all →</Link>
        </div>
        {(stats?.topAccounts || []).length === 0 ? (
          <div className="empty-state">No accounts yet — <Link to="/agent">run the agent</Link></div>
        ) : (
          <div className="top-accounts-grid">
            {(stats?.topAccounts || []).map(a => (
              <TopAccountCard key={a.handle} account={a} />
            ))}
          </div>
        )}
      </div>

      {/* Run history */}
      <div className="dash-card runs-card">
        <div className="dash-card-header">
          <h3>Recent Agent Runs</h3>
          <span className="dash-run-count">{stats?.recentRuns?.length ?? 0} runs</span>
        </div>
        {(stats?.recentRuns || []).length ? (
          stats.recentRuns.map(r => <RunRow key={r.id} run={r} />)
        ) : (
          <div className="empty-state">No runs yet — <Link to="/agent">run the agent</Link></div>
        )}
      </div>
    </div>
  );
}
