import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const SCORE_TIERS = [
  { key: 'all',     label: 'All',     color: '#7DA4BE', min: 0,  max: 100 },
  { key: 'top',     label: 'Tier 1',  color: '#00C896', min: 65, max: 100 },
  { key: 'mid',     label: 'Tier 2',  color: '#F9A825', min: 45, max: 64  },
  { key: 'archive', label: 'Archive', color: '#888',    min: 0,  max: 44  },
];
const REACH_TIERS  = ['Macro', 'Mid-Tier', 'Micro', 'Nano', 'Below bar'];
const SORT_OPTIONS = [
  { value: 'score',     label: 'Score ↓'     },
  { value: 'followers', label: 'Followers ↓' },
  { value: 'name',      label: 'Name A–Z'    },
];

function scoreColor(s) {
  return s >= 65 ? '#00C896' : s >= 45 ? '#F9A825' : '#888';
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ accounts }) {
  const total    = accounts.length;
  const avgScore = total ? Math.round(accounts.reduce((s, a) => s + (a.overall || 0), 0) / total) : 0;
  const dmOpen   = accounts.filter(a => a.dm_open).length;
  const hasEmail = accounts.filter(a => a.has_email).length;
  const trackA   = accounts.filter(a => a.track === 'A').length;
  const trackB   = accounts.filter(a => a.track === 'B').length;
  return (
    <div className="stats-bar">
      <div className="stats-bar-cats">
        {SCORE_TIERS.filter(t => t.key !== 'all').map(t => ({
          ...t, count: accounts.filter(a => a.overall >= t.min && a.overall <= t.max).length,
        })).map(t => (
          <div key={t.key} className="stats-cat">
            <span className="stats-cat-count" style={{ color: t.color }}>{t.count}</span>
            <span className="stats-cat-label">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="stats-bar-divider" />
      <div className="stats-bar-meta">
        <span>Avg <strong style={{ color: scoreColor(avgScore) }}>{avgScore}</strong></span>
        <span>DM <strong className="green">{dmOpen}</strong></span>
        <span>Email <strong className="blue">{hasEmail}</strong></span>
        <span>Track A <strong style={{ color:'#00C896' }}>{trackA}</strong></span>
        <span>Track B <strong style={{ color:'#F9A825' }}>{trackB}</strong></span>
      </div>
    </div>
  );
}

// ── Contact details panel (shown when expanded) ───────────────────────────────
function ContactPanel({ account }) {
  const handle = (account.handle || '').replace(/^@/, '');
  return (
    <div className="contact-panel">
      <div className="contact-panel-title">Contact Details</div>
      <div className="contact-grid">
        {/* DM on X */}
        <div className="contact-item">
          <span className="contact-label">DM on X</span>
          {account.dm_open ? (
            <a href={`https://x.com/messages/compose?recipient_id=${handle}`}
              target="_blank" rel="noreferrer" className="contact-link green">
              Open DM → @{handle}
            </a>
          ) : (
            <span className="contact-na">DMs not indicated as open</span>
          )}
        </div>

        {/* Email */}
        <div className="contact-item">
          <span className="contact-label">Email</span>
          {account.contact_email ? (
            <a href={`mailto:${account.contact_email}`} className="contact-link blue">
              {account.contact_email}
            </a>
          ) : account.has_email ? (
            <span className="contact-hint">Email in bio — check profile</span>
          ) : (
            <span className="contact-na">No email found</span>
          )}
        </div>

        {/* Website */}
        <div className="contact-item">
          <span className="contact-label">Website</span>
          {account.website ? (
            <a href={account.website} target="_blank" rel="noreferrer" className="contact-link">
              {account.website}
            </a>
          ) : <span className="contact-na">None</span>}
        </div>

        {/* X Profile */}
        <div className="contact-item">
          <span className="contact-label">X Profile</span>
          <a href={`https://x.com/${handle}`} target="_blank" rel="noreferrer" className="contact-link">
            x.com/{handle}
          </a>
        </div>
      </div>

      {/* Bio */}
      {account.bio && (
        <div className="contact-bio">
          <span className="contact-label">Bio</span>
          <p>{account.bio}</p>
        </div>
      )}

      {/* AI reason */}
      {account.ai_reason && (
        <div className="contact-ai">
          <span className="contact-label">AI Assessment</span>
          <p>🤖 {account.ai_reason}</p>
        </div>
      )}

      {/* Score breakdown */}
      <div className="contact-scores">
        {[
          ['D2', 'Collab Intent', account.d2, true],
          ['D3', 'AI Relevance', account.d3, true],
          ['D4', 'Authority', account.d4, false],
          ['D5', 'Reach', account.d5, false],
        ].map(([k, l, v, ai]) => (
          <div key={k} className="contact-score-row">
            <span className="cs-label">{k} {l}{ai && <span className="dim-ai">AI</span>}</span>
            <div className="cs-bar"><div style={{ width:`${v}%`, background: scoreColor(v), height:'100%', borderRadius:2 }} /></div>
            <span className="cs-val" style={{ color: scoreColor(v) }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Account row ───────────────────────────────────────────────────────────────
function AccountRow({ account, rank }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`account-row-full${expanded ? ' expanded' : ''}`}>
      {/* Main row — click to expand */}
      <div className="arf-main-row" onClick={() => setExpanded(e => !e)}>
        <div className="arf-rank">#{rank}</div>
        <img src={account.avatar} alt="" className="arf-avatar"
          onError={e => { e.target.style.display = 'none'; }} />

        <div className="arf-identity">
          <div className="arf-name">
            {account.name}
            {account.verified && <span className="verified-badge"> ✓</span>}
          </div>
          <div className="arf-handle">@{account.handle}</div>
          <div className="arf-meta-row">
            <span className={`track-badge track-${account.track}`}>Track {account.track}</span>
            <span className={`type-badge type-${(account.account_type||'').replace(/\s+/g,'-').toLowerCase()}`}>
              {account.account_type}
            </span>
          </div>
        </div>

        <div className="arf-reach">
          <div className="arf-reach-tier">{account.tier}</div>
          <div className="arf-followers">{(account.followers||0).toLocaleString()}</div>
        </div>

        <div className="arf-dims">
          {[['D2',account.d2],['D3',account.d3],['D4',account.d4],['D5',account.d5]].map(([k,v])=>(
            <div key={k} className="arf-dim">
              <div className="arf-dim-label">{k}</div>
              <div className="arf-dim-bar">
                <div style={{ width:`${v}%`, background:scoreColor(v), height:'100%', borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>

        <div className="arf-score" style={{ color: scoreColor(account.overall) }}>
          {account.overall}
        </div>

        {/* Contact badges — always visible */}
        <div className="arf-tags">
          {account.dm_open    && <span className="badge green" title="DM Open">DM</span>}
          {account.has_email  && <span className="badge blue"  title="Has Email">✉</span>}
          {account.website    && (
            <a href={account.website} target="_blank" rel="noreferrer"
              className="badge link" onClick={e => e.stopPropagation()}>↗</a>
          )}
          {account.contact_email && <span className="badge blue" title={account.contact_email}>@</span>}
        </div>

        <div className="arf-expand-btn">{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Expanded contact panel */}
      {expanded && <ContactPanel account={account} />}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AccountsPage({ mode }) {
  const { apiFetch } = useAuth();
  const [accounts,   setAccounts]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [search,     setSearch]    = useState('');
  const [scoreTier,  setScoreTier] = useState('all');
  const [reachTier,  setReachTier] = useState('');
  const [typeFilter, setTypeFilter]= useState('');
  const [dmFilter,   setDmFilter]  = useState(false);
  const [emailFilter,setEmailFilter]=useState(false);
  const [sortBy,     setSortBy]    = useState('score');

  const endpoint = mode === 'all'
    ? '/api/accounts?limit=1000'
    : mode === 'influencers'
    ? '/api/accounts/influencers'
    : '/api/accounts/pr-pages';

  const title = mode === 'all'
    ? 'All Accounts'
    : mode === 'influencers'
    ? 'Track A — Collab Pipeline'
    : 'Track B — Ads Audience';

  useEffect(() => {
    setLoading(true);
    setSearch(''); setScoreTier('all'); setReachTier('');
    setTypeFilter(''); setDmFilter(false); setEmailFilter(false);
    apiFetch(endpoint)
      .then(r => r.json())
      .then(d => { setAccounts(d.accounts || []); setLoading(false); })
      .catch(err => {
        setError(err.message === 'Failed to fetch'
          ? 'Cannot reach backend — is the server running?'
          : err.message);
        setLoading(false);
      });
  }, [mode]);

  const tierCounts = useMemo(() => {
    const out = { all: accounts.length };
    SCORE_TIERS.filter(t => t.key !== 'all').forEach(t => {
      out[t.key] = accounts.filter(a => a.overall >= t.min && a.overall <= t.max).length;
    });
    return out;
  }, [accounts]);

  const types = useMemo(() => [...new Set(accounts.map(a => a.account_type).filter(Boolean))], [accounts]);

  const filtered = useMemo(() => {
    const st = SCORE_TIERS.find(t => t.key === scoreTier) || SCORE_TIERS[0];
    const q  = search.toLowerCase();
    let out = accounts.filter(a => {
      if (q && !(a.name?.toLowerCase().includes(q)||a.handle?.toLowerCase().includes(q)||a.bio?.toLowerCase().includes(q))) return false;
      if (st.key !== 'all' && (a.overall < st.min || a.overall > st.max)) return false;
      if (reachTier  && a.tier !== reachTier)         return false;
      if (typeFilter && a.account_type !== typeFilter) return false;
      if (dmFilter   && !a.dm_open)                   return false;
      if (emailFilter && !a.has_email)                 return false;
      return true;
    });
    if (sortBy === 'score')     out = [...out].sort((a,b)=>(b.overall||0)-(a.overall||0));
    if (sortBy === 'followers') out = [...out].sort((a,b)=>(b.followers||0)-(a.followers||0));
    if (sortBy === 'name')      out = [...out].sort((a,b)=>(a.name||'').localeCompare(b.name||''));
    return out;
  }, [accounts, search, scoreTier, reachTier, typeFilter, dmFilter, emailFilter, sortBy]);

  const dmCount    = accounts.filter(a => a.dm_open).length;
  const emailCount = accounts.filter(a => a.has_email).length;

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error)   return <div className="page" style={{padding:32}}><div className="page-error">{error}</div></div>;

  return (
    <div className="page accounts-page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="page-sub">{filtered.length} of {accounts.length} accounts</p>
        </div>
      </div>

      {accounts.length > 0 && <StatsBar accounts={accounts} />}

      {/* Score tier tabs */}
      <div className="score-tier-tabs">
        {SCORE_TIERS.map(t => (
          <button key={t.key}
            className={`score-tier-tab${scoreTier===t.key?' active':''}`}
            style={scoreTier===t.key?{borderColor:t.color,color:t.color}:{}}
            onClick={() => setScoreTier(t.key)}>
            {t.label}
            <span className="tier-tab-count" style={scoreTier===t.key?{background:t.color}:{}}>
              {tierCounts[t.key]??0}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-panel">
        {/* Contact quick filters */}
        <div className="filter-row">
          <span className="filter-group-label">Contact</span>
          <div className="filter-chips">
            <button
              className={`filter-chip contact-chip${dmFilter?' active-dm':''}`}
              onClick={() => setDmFilter(f => !f)}>
              💬 DM Open
              <span className="chip-count">{dmCount}</span>
            </button>
            <button
              className={`filter-chip contact-chip${emailFilter?' active-email':''}`}
              onClick={() => setEmailFilter(f => !f)}>
              ✉ Has Email
              <span className="chip-count">{emailCount}</span>
            </button>
          </div>
        </div>

        {/* Reach */}
        <div className="filter-row">
          <span className="filter-group-label">Reach</span>
          <div className="filter-chips">
            <button className={`filter-chip${!reachTier?' active':''}`} onClick={() => setReachTier('')}>All</button>
            {REACH_TIERS.map(rt => (
              <button key={rt} className={`filter-chip${reachTier===rt?' active':''}`}
                onClick={() => setReachTier(reachTier===rt?'':rt)}>
                {rt} <span className="chip-count">{accounts.filter(a=>a.tier===rt).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        {types.length > 1 && (
          <div className="filter-row">
            <span className="filter-group-label">Type</span>
            <div className="filter-chips">
              <button className={`filter-chip${!typeFilter?' active':''}`} onClick={() => setTypeFilter('')}>All</button>
              {types.map(t => (
                <button key={t} className={`filter-chip${typeFilter===t?' active':''}`}
                  onClick={() => setTypeFilter(typeFilter===t?'':t)}>
                  {t} <span className="chip-count">{accounts.filter(a=>a.account_type===t).length}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search + sort */}
        <div className="filter-row">
          <input className="filter-input" placeholder="Search name, handle, bio, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="sort-row">
            <span className="filter-group-label">Sort</span>
            {SORT_OPTIONS.map(s => (
              <button key={s.value} className={`sort-btn${sortBy===s.value?' active':''}`}
                onClick={() => setSortBy(s.value)}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          {accounts.length === 0
            ? 'No data yet — run the agent to discover accounts'
            : 'No accounts match your filters'}
        </div>
      ) : (
        <div className="accounts-list-full">
          <div className="arf-hint">Click any row to expand contact details</div>
          {filtered.map((a, i) => (
            <AccountRow key={a.id ?? a.handle} account={a} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
