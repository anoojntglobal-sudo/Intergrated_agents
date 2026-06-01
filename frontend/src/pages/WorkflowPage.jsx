import React from 'react';

/* ─── shared style tokens ─────────────────────────────────────────── */
const C = {
  blue:   '#1D9BF0',
  green:  '#00C896',
  gold:   '#F9A825',
  red:    '#FF4444',
  purple: '#9B59B6',
  bg:     '#0d1117',
  card:   '#161b22',
  border: '#21262d',
  text:   '#e6edf3',
  muted:  '#8b949e',
};

/* ─── base component helpers ──────────────────────────────────────── */
function Card({ color = C.blue, step, title, children, style = {} }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 8,
      padding: '20px 24px',
      marginBottom: 0,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        {step !== undefined && (
          <span style={{
            background: color,
            color: '#000',
            fontWeight: 700,
            fontSize: 11,
            borderRadius: 4,
            padding: '2px 8px',
            letterSpacing: 0.5,
          }}>
            STEP {step}
          </span>
        )}
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: 0.3 }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function Arrow({ color = C.blue }) {
  return (
    <div style={{
      textAlign: 'center',
      fontSize: 22,
      color,
      lineHeight: 1,
      margin: '2px 0',
      userSelect: 'none',
    }}>
      ↓
    </div>
  );
}

function Tag({ color = C.blue, children, style = {} }) {
  return (
    <span style={{
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'monospace',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  );
}

function Code({ children, style = {} }) {
  return (
    <code style={{
      background: '#0d1117',
      border: `1px solid ${C.border}`,
      borderRadius: 4,
      padding: '1px 6px',
      fontSize: 12,
      fontFamily: 'monospace',
      color: '#79c0ff',
      ...style,
    }}>
      {children}
    </code>
  );
}

function Row({ children, gap = 12, style = {} }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap, ...style }}>
      {children}
    </div>
  );
}

function KV({ k, v, vColor = '#79c0ff' }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.6 }}>
      <span style={{ color: C.muted }}>{k}: </span>
      <span style={{ color: vColor, fontFamily: 'monospace' }}>{v}</span>
    </div>
  );
}

function InfoBox({ color = C.blue, children, style = {} }) {
  return (
    <div style={{
      background: color + '11',
      border: `1px solid ${color}33`,
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 12,
      color: C.text,
      lineHeight: 1.7,
      ...style,
    }}>
      {children}
    </div>
  );
}

function FieldGrid({ fields }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '4px 12px',
      fontFamily: 'monospace',
      fontSize: 11,
    }}>
      {fields.map(([name, type, note], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
          <span style={{ color: '#79c0ff' }}>{name}</span>
          <span style={{ color: C.muted, fontSize: 10 }}>{type}</span>
          {note && <span style={{ color: C.gold, fontSize: 10 }}>({note})</span>}
        </div>
      ))}
    </div>
  );
}

function EventRow({ name, color, when }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: 12,
      padding: '6px 0',
      borderBottom: `1px solid ${C.border}`,
      fontSize: 12,
      alignItems: 'start',
    }}>
      <Tag color={color}>{name}</Tag>
      <span style={{ color: C.text, lineHeight: 1.5 }}>{when}</span>
    </div>
  );
}

function RouteRow({ method, path, auth, returns }) {
  const methodColor = method === 'GET' ? C.green : method === 'POST' ? C.blue : method === 'PATCH' ? C.gold : C.red;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '55px 240px 80px 1fr',
      gap: 10,
      padding: '6px 0',
      borderBottom: `1px solid ${C.border}`,
      fontSize: 12,
      alignItems: 'start',
    }}>
      <Tag color={methodColor}>{method}</Tag>
      <Code style={{ fontSize: 11 }}>{path}</Code>
      <Tag color={auth ? C.gold : C.green}>{auth ? 'JWT req.' : 'public'}</Tag>
      <span style={{ color: C.muted, lineHeight: 1.5 }}>{returns}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function WorkflowPage() {
  return (
    <div style={{
      background: C.bg,
      minHeight: '100vh',
      padding: '32px 32px 64px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: C.text,
      maxWidth: 900,
      margin: '0 auto',
    }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>
          <span style={{ color: C.blue }}>Kite</span><span style={{ color: C.green }}>AI</span>
          <span style={{ color: C.muted, fontWeight: 400, fontSize: 16, marginLeft: 10 }}>
            X Agent — System Workflow
          </span>
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: C.muted }}>
          Complete pipeline documentation — trigger to database write, including rate limiting, AI scoring, and SSE streaming.
        </p>
      </div>

      {/* ── Data Flow Summary ────────────────────────────────────── */}
      <div style={{
        background: '#0d1117',
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '20px 24px',
        marginBottom: 32,
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 12, letterSpacing: 1 }}>
          DATA FLOW SUMMARY
        </div>
        <pre style={{
          margin: 0,
          fontSize: 11,
          lineHeight: 2,
          color: C.text,
          fontFamily: 'monospace',
          whiteSpace: 'pre',
        }}>{`  TRIGGER (manual / cron)
       │
       ▼
  KEYWORD LOADING ─── own DB (61) + friend DB (1506 kws, 42 handles) ──► merged queries
       │
       ▼
  SEARCH PHASE ─── callAPI(search.php, {query, count:50}) ──► up to 50 tweets ──► extract handles
       │                                     │
       │          Rate Limiter: 6 RPM/key    │   Key1 ⟷ Key2 alternating
       │          MIN_GAP=10 000ms  ±600ms jitter
       ▼
  PROFILE FETCH ─── callAPI(screenname.php) ──► name, bio, followers, following, verified …
       │
       ▼
  KEYWORD SCORING (instant) ─── D4 (influence signals) + D5 (reach tier)
       │
       ▼
  AI BATCH SCORING (6/call) ─── Claude Opus 4.5 via OpenRouter ──► D2 (collab intent) + D3 (AI relevance)
       │                                                             + type + track (A/B)
       ▼
  SCORE MERGE  ──  Overall = D2×25% + D3×25% + D4×20% + D5×30%
       │
       ▼
  DB UPSERT ─── Turso (libSQL) ──► accounts table  (handle UNIQUE → INSERT or UPDATE)
       │                 └──────► runs row  (status, counts, completed_at)
       │
       ▼
  SSE STREAM ─── status · search_done · account · fetch_error · quota_exhausted · complete`}</pre>
      </div>

      {/* ── Steps ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* STEP 1 — TRIGGER */}
        <Card color={C.blue} step={1} title="TRIGGER — How the Agent Starts">
          <Row gap={16} style={{ marginBottom: 12 }}>
            <InfoBox color={C.blue} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: C.blue }}>Manual (UI)</div>
              User clicks <Code>Run Agent</Code> on the Agent Runner page.<br />
              POST <Code>/api/agent/run</Code> (JWT required).<br />
              <Code>triggeredBy: 'manual'</Code> stored in <Code>runs</Code> table.
            </InfoBox>
            <InfoBox color={C.gold} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: C.gold }}>Cron (Automatic)</div>
              <Code>cron.schedule('0 2 1 * *', ...)</Code><br />
              Runs 1st of every month at <strong>02:00 AM UTC</strong>.<br />
              Pre-condition: <Code>auto_run_enabled = '1'</Code> in agent_config.<br />
              Must have at least one keyword or direct handle.<br />
              <Code>triggeredBy: 'cron'</Code> — no SSE output.
            </InfoBox>
          </Row>
          <Row gap={8}>
            <Tag color={C.blue}>runAgent() called</Tag>
            <Tag color={C.green}>runs row inserted — status: 'running'</Tag>
            <Tag color={C.muted}>globalConsecutive429 reset to 0</Tag>
          </Row>
        </Card>

        <Arrow />

        {/* STEP 2 — KEYWORD LOADING */}
        <Card color={C.green} step={2} title="KEYWORD LOADING — Own DB + Friend DB → Merged Queries">
          <Row gap={16} style={{ marginBottom: 12 }}>
            <InfoBox color={C.green} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: C.green }}>Own Database (Turso)</div>
              <strong>55 keywords</strong> seeded at startup (8 classes):<br />
              Class C — Voice AI Stack (18): <Code>vapi</Code>, <Code>elevenlabs</Code>, <Code>deepgram</Code>…<br />
              Class A — AI Models (11): <Code>gpt-4</Code>, <Code>claude ai</Code>, <Code>openai</Code>…<br />
              Class B — Orchestration (9): <Code>langchain</Code>, <Code>n8n</Code>, <Code>ai agent</Code>…<br />
              Class E/F/H/K — Regional, vertical, influencer, product keywords.<br />
              Active keywords only (<Code>active = 1</Code>).
            </InfoBox>
            <InfoBox color={C.gold} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: C.gold }}>Friend DB (Read-Only Turso)</div>
              <strong>1506 keywords</strong> across 9 class_keys.<br />
              <strong>42 influencer handles</strong> (direct fetch, no search).<br />
              Loaded via <Code>FRIEND_TURSO_URL</Code> env var.<br />
              Max <strong>300</strong> enabled search queries per run (priority-ordered).<br />
              <strong>STRICT:</strong> SELECT only — no INSERT/UPDATE/DELETE ever.
            </InfoBox>
          </Row>
          <InfoBox color={C.blue}>
            <strong>Merge logic:</strong> own active keywords + friend's search queries (deduped, own take priority).
            Friend's 42 influencer handles go to the <em>direct handles</em> queue (fetched after all search queries, no search API call).
            Result: up to ~300 combined search queries + up to 42 direct handles per run.
          </InfoBox>
        </Card>

        <Arrow />

        {/* STEP 3 — SEARCH PHASE */}
        <Card color={C.blue} step={3} title="SEARCH PHASE — Query X for Handles">
          <InfoBox color={C.blue} style={{ marginBottom: 12 }}>
            For each query in the merged list:<br />
            1. Emit <Tag color={C.blue}>status</Tag> — "Searching X for: {'{query}'}"<br />
            2. Call <Code>callAPI('search.php', {'{ query, count: 50 }'} )</Code><br />
            3. Returns up to <strong>50 tweet objects</strong> from the timeline.<br />
            4. Extract <Code>user.screen_name</Code> from each tweet → unique handles.<br />
            5. Cross-query dedup via a <Code>seenThisRun</Code> Set (persists for the whole run).<br />
            6. Emit <Tag color={C.green}>search_done</Tag> with <Code>{'{ query, found, fetching, handles, tweets_returned, duration_ms }'}</Code>
          </InfoBox>
          <Row gap={8} style={{ marginBottom: 10 }}>
            <Tag color={C.green}>Example: query "ai voice assistant" → 50 tweets → 15 new handles</Tag>
          </Row>
          <Row gap={8}>
            <InfoBox color={C.red} style={{ flex: 1 }}>
              <strong style={{ color: C.red }}>On failure:</strong> emit <Tag color={C.red}>error</Tag> event with
              <Code>{'{ step, message, status }'}</Code>,
              set <Code>health.flags.limited</Code> or <Code>health.flags.blocked</Code>,
              then <Code>continue</Code> to next query.
            </InfoBox>
          </Row>
        </Card>

        <Arrow />

        {/* STEP 4 — RATE LIMITER */}
        <Card color={C.gold} step={4} title="RATE LIMITER — Key Rotation, Jitter, Cooldowns">
          <Row gap={16} style={{ marginBottom: 12 }}>
            <InfoBox color={C.gold} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.gold }}>Proactive Pacing</div>
              <KV k="SAFE_RPM" v="6 per key" />
              <KV k="MIN_GAP_MS" v="10,000 ms between requests per key" />
              <KV k="JITTER_MS" v="±600 ms (uniform random)" />
              <KV k="Keys" v="Key1 + Key2 (alternating via acquireKey())" />
              <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>
                Computes <Code>readyAt[i] = max(lastFiredAt + 10000, cooldownUntil)</Code> for each key.
                Picks key with <em>earliest</em> ready time; sleeps if wait &gt; 500ms.
              </div>
            </InfoBox>
            <InfoBox color={C.red} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.red }}>Error Penalties</div>
              <KV k="429 Too Many Requests" v="cooldown +75,000 ms; globalConsecutive429++" vColor={C.red} />
              <KV k="403 Forbidden" v="cooldown +3,600,000 ms (1 hr); notSubscribed=true" vColor={C.red} />
              <KV k="Other errors" v="exponential backoff min(120s, 8s × 2^(errors−1))" vColor={C.gold} />
              <div style={{ marginTop: 8, fontSize: 11, color: C.red, fontWeight: 600 }}>
                Quota Exhausted: globalConsecutive429 &ge; 3 across ALL keys
                → throw QuotaExhaustedError → emit quota_exhausted → stop run.
              </div>
            </InfoBox>
          </Row>
          <InfoBox color={C.blue}>
            <strong>Immediate failover:</strong> On 429 or 403, immediately check if the <em>other</em> key is free.
            If free, wait 800ms + jitter and retry once with that key. Success clears both
            <Code>globalConsecutive429</Code> and <Code>k.consecutiveErrors</Code> via <Code>clearErrors(k)</Code>.<br />
            <strong>SSE keepalive:</strong> During rate-limit sleeps, <Code>sleepWithPing()</Code> fires every 8s,
            writing raw <Code>{': ping\\n\\n'}</Code> SSE comment lines to keep the TCP connection alive.
          </InfoBox>
        </Card>

        <Arrow />

        {/* STEP 5 — PROFILE FETCH */}
        <Card color={C.blue} step={5} title="PROFILE FETCH — Fetch Each Handle via screenname.php">
          <InfoBox color={C.blue} style={{ marginBottom: 12 }}>
            Phase 1 of the pipeline. For each unique handle (0–80% progress):<br />
            1. Emit <Tag color={C.blue}>status</Tag> — "Fetching @handle (N/total)"<br />
            2. Call <Code>callAPI('screenname.php', {'{ screenname: handle }'} )</Code><br />
            3. On failure: emit <Tag color={C.red}>fetch_error</Tag> with
            <Code>{'{ handle, index, total, status, error, health }'}</Code>, skip handle.<br />
            4. On success: pass raw user object to <Code>scoreAndClassify(u)</Code> → push to <Code>fetchedAccounts[]</Code>.
          </InfoBox>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
            Fields extracted from screenname.php response:
          </div>
          <FieldGrid fields={[
            ['handle', 'TEXT', 'screen_name'],
            ['name', 'TEXT', 'display name'],
            ['bio', 'TEXT', 'description'],
            ['followers', 'INTEGER', 'followers_count'],
            ['following', 'INTEGER', 'friends_count'],
            ['tweets', 'INTEGER', 'statuses_count'],
            ['verified', 'BOOL', 'blue_verified'],
            ['avatar', 'TEXT', 'profile_image_url'],
            ['website', 'TEXT', 'url'],
            ['location', 'TEXT', ''],
            ['joined_date', 'TEXT', 'created_at'],
          ]} />
        </Card>

        <Arrow />

        {/* STEP 6 — KEYWORD SCORING */}
        <Card color={C.green} step={6} title="KEYWORD SCORING — Algorithmic D4 & D5 (Instant, No API Call)">
          <Row gap={16} style={{ marginBottom: 12 }}>
            <InfoBox color={C.green} style={{ flex: '0 0 380px' }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.green }}>D4 — Influence Signals (weight 20%)</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.9 }}>
                <div><span style={{ color: C.gold }}>+30</span> if <Code>blue_verified</Code></div>
                <div><span style={{ color: C.gold }}>+35</span> if followers/following &ge; 30</div>
                <div><span style={{ color: C.gold }}>+22</span> if ratio &ge; 10</div>
                <div><span style={{ color: C.gold }}>+12</span> if ratio &ge; 3</div>
                <div><span style={{ color: C.gold }}>+30</span> if followers &ge; 100K</div>
                <div><span style={{ color: C.gold }}>+20</span> if followers &ge; 10K</div>
                <div><span style={{ color: C.gold }}>+10</span> if followers &ge; 1K</div>
                <div style={{ color: C.muted }}>Cap: min(95, sum)</div>
              </div>
            </InfoBox>
            <InfoBox color={C.green} style={{ flex: '0 0 380px' }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.green }}>D5 — Reach Tier (weight 30%)</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.9 }}>
                <div><span style={{ color: C.blue }}>95</span> — Macro &ge; 500K followers</div>
                <div><span style={{ color: C.blue }}>80</span> — Mid-Tier &ge; 100K followers</div>
                <div><span style={{ color: C.blue }}>60</span> — Micro &ge; 10K followers</div>
                <div><span style={{ color: C.blue }}>40</span> — Nano &ge; 1K followers</div>
                <div><span style={{ color: C.blue }}>25</span> — &ge; 500 followers</div>
                <div><span style={{ color: C.blue }}>10</span> — &lt; 500 followers</div>
              </div>
            </InfoBox>
          </Row>
          <InfoBox color={C.muted}>
            <strong>D2 &amp; D3 keyword fallback</strong> (used when AI is unavailable):<br />
            D2 (Collab Openness): 82 if bio has collab keywords (dm open, partnership, contact…) | 50 if has website | 18 otherwise.<br />
            D3 (AI Relevance): <Code>aiHits × 12 + (bio.length &gt; 30 ? 8 : 0)</Code>, capped at 95.
            aiHits = count of AI keywords matching bio/name (ai, llm, gpt, voice, nlp, developer, founder, saas, vapi, elevenlabs…).
          </InfoBox>
        </Card>

        <Arrow />

        {/* STEP 7 — AI BATCH SCORING */}
        <Card color={C.gold} step={7} title="AI BATCH SCORING — Claude Opus 4.5 via OpenRouter (6 accounts / call)">
          <Row gap={16} style={{ marginBottom: 12 }}>
            <InfoBox color={C.gold} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.gold }}>Batch Setup</div>
              <KV k="Model" v="anthropic/claude-opus-4-5 (SCORING_MODEL)" vColor={C.gold} />
              <KV k="Batch size" v="BATCH_SIZE = 6 accounts per call" />
              <KV k="Progress" v="80% → 95% of run progress bar" />
              <KV k="Pre-check" v="Handles already in DB are skipped (no re-scoring)" />
              <KV k="Provider" v="OpenRouter (OPENROUTER_API_KEY env var)" />
            </InfoBox>
            <InfoBox color={C.gold} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.gold }}>Prompt Contract</div>
              Input per account: handle, name, follower count, verified, website presence, bio (max 160 chars).<br />
              Returns <strong>JSON array only</strong> — no markdown, same order as input.<br />
              <div style={{ marginTop: 6 }}>
                Each object:<br />
                <Code>d2</Code> — Collab Intent 0-100<br />
                <Code>d3</Code> — AI Relevance 0-100<br />
                <Code>type</Code> — Influencer | PR Page | AI Media | Brand Page | Account<br />
                <Code>track</Code> — A (collab pipeline) | B (ads audience)<br />
                <Code>model</Code> — added by JS layer
              </div>
            </InfoBox>
          </Row>
          <InfoBox color={C.red}>
            <strong>Fallback:</strong> If AI call fails or OpenRouter is unavailable, the keyword heuristic D2/D3 scores
            computed in Step 6 are used as-is. The run continues — AI scoring is non-blocking.
          </InfoBox>
        </Card>

        <Arrow />

        {/* STEP 8 — FINAL SCORE */}
        <Card color={C.blue} step={8} title="FINAL SCORE — Merge AI + Keyword Scores → Overall">
          <div style={{
            background: '#0d1117',
            borderRadius: 8,
            padding: '18px 22px',
            marginBottom: 14,
            border: `1px solid ${C.border}`,
            fontFamily: 'monospace',
          }}>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 12 }}>
              <span style={{ color: C.gold, fontWeight: 700 }}>Overall</span>
              {' = '}
              <span style={{ color: '#79c0ff' }}>D2</span>
              <span style={{ color: C.muted }}> × </span>
              <span style={{ color: C.green }}>0.25</span>
              <span style={{ color: C.muted }}> + </span>
              <span style={{ color: '#79c0ff' }}>D3</span>
              <span style={{ color: C.muted }}> × </span>
              <span style={{ color: C.green }}>0.25</span>
              <span style={{ color: C.muted }}> + </span>
              <span style={{ color: '#79c0ff' }}>D4</span>
              <span style={{ color: C.muted }}> × </span>
              <span style={{ color: C.green }}>0.20</span>
              <span style={{ color: C.muted }}> + </span>
              <span style={{ color: '#79c0ff' }}>D5</span>
              <span style={{ color: C.muted }}> × </span>
              <span style={{ color: C.green }}>0.30</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                ['D2', 'Collab Intent', '25%', 'AI (or keyword fallback)'],
                ['D3', 'AI Relevance', '25%', 'AI (or keyword fallback)'],
                ['D4', 'Influence Signals', '20%', 'keyword scorer always'],
                ['D5', 'Reach Tier', '30%', 'keyword scorer always'],
              ].map(([dim, label, weight, source]) => (
                <div key={dim} style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: '10px 12px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#79c0ff' }}>{dim}</div>
                  <div style={{ fontSize: 11, color: C.text, margin: '4px 0 2px' }}>{label}</div>
                  <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>{weight}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{source}</div>
                </div>
              ))}
            </div>
          </div>
          <Row gap={8}>
            <InfoBox color={C.blue} style={{ flex: 1 }}>
              <strong style={{ color: C.blue }}>Track A</strong> — Collab pipeline.<br />
              AI assigned <Code>track: "A"</Code>. High D2 (collab intent).<br />
              Visible in <em>Track A</em> page (<Code>/influencers</Code>).
            </InfoBox>
            <InfoBox color={C.purple} style={{ flex: 1 }}>
              <strong style={{ color: C.purple }}>Track B</strong> — Ads audience.<br />
              AI assigned <Code>track: "B"</Code>. Broad reach, lower collab signal.<br />
              Visible in <em>Track B</em> page (<Code>/pr-pages</Code>).
            </InfoBox>
          </Row>
        </Card>

        <Arrow />

        {/* STEP 9 — DEDUPLICATION */}
        <Card color={C.green} step={9} title="DEDUPLICATION — seenThisRun + DB UNIQUE Constraint">
          <Row gap={16}>
            <InfoBox color={C.green} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.green }}>Within-Run Dedup</div>
              <Code>seenThisRun</Code> is a <Code>Set&lt;string&gt;</Code> (lowercased handles).<br />
              Created fresh at the start of each <Code>runAgent()</Code> call.<br />
              Prevents the same handle being fetched twice even across multiple search queries.<br />
              Direct handles (friend DB) are also checked against this Set.
            </InfoBox>
            <InfoBox color={C.blue} style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: C.blue }}>Database Dedup</div>
              <Code>accounts.handle</Code> has a <Code>UNIQUE</Code> constraint.<br />
              <Code>upsertAccount()</Code> runs INSERT OR REPLACE (or equivalent).<br />
              Same account seen on a later run → scores updated, not re-inserted.<br />
              <Code>isDuplicate: true</Code> is set in the emitted <Code>account</Code> SSE event.<br />
              <Code>duplicatesSkipped</Code> counter incremented in the <Code>complete</Code> summary.
            </InfoBox>
          </Row>
        </Card>

        <Arrow />

        {/* STEP 10 — DATABASE WRITE */}
        <Card color={C.green} step={10} title="DATABASE WRITE — Turso (libSQL) Schema">
          <Row gap={16} style={{ marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8, letterSpacing: 0.5 }}>
                ACCOUNTS TABLE (per account upserted)
              </div>
              <FieldGrid fields={[
                ['id', 'INTEGER PK', 'auto'],
                ['handle', 'TEXT UNIQUE', ''],
                ['name', 'TEXT', ''],
                ['bio', 'TEXT', ''],
                ['followers', 'INTEGER', ''],
                ['following', 'INTEGER', ''],
                ['tweets', 'INTEGER', ''],
                ['verified', 'INTEGER', '0/1'],
                ['avatar', 'TEXT', ''],
                ['website', 'TEXT', ''],
                ['location', 'TEXT', ''],
                ['joined_date', 'TEXT', ''],
                ['tier', 'TEXT', 'Macro/Mid/Micro/Nano'],
                ['account_type', 'TEXT', 'Influencer/PR Page…'],
                ['track', 'TEXT', 'A or B'],
                ['d1', 'REAL', 'reserved'],
                ['d2', 'REAL', 'collab intent'],
                ['d3', 'REAL', 'AI relevance'],
                ['d4', 'REAL', 'influence signals'],
                ['d5', 'REAL', 'reach'],
                ['overall', 'REAL', 'final score'],
                ['dm_open', 'INTEGER', '0/1'],
                ['has_email', 'INTEGER', '0/1'],
                ['contact_email', 'TEXT', ''],
                ['linktree', 'TEXT', ''],
                ['ai_model', 'TEXT', 'migration col'],
                ['ai_reason', 'TEXT', 'migration col'],
                ['run_id', 'INTEGER FK', '→ runs.id'],
                ['first_seen', 'TEXT', ''],
                ['last_updated', 'TEXT', ''],
              ]} />
            </div>
            <div style={{ width: 220, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 8, letterSpacing: 0.5 }}>
                OTHER TABLES
              </div>
              {[
                ['runs', 'One row per agent run. Stores started_at, completed_at, accounts_added, duplicates_skipped, status, triggered_by, keywords_used.'],
                ['keywords', 'Own keywords — id, keyword, category, class, active, source.'],
                ['agent_config', 'Key/value config — last_run, next_run, auto_run_enabled.'],
                ['users', 'Auth — id, email, password_hash, role.'],
              ].map(([name, desc]) => (
                <div key={name} style={{
                  marginBottom: 10,
                  padding: '8px 12px',
                  background: '#0d1117',
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#79c0ff', marginBottom: 3 }}>{name}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Row>
          <InfoBox color={C.gold}>
            <strong>Migration safety:</strong> Two ALTER TABLE migrations run on every startup
            (<Code>ADD COLUMN ai_model TEXT</Code>, <Code>ADD COLUMN ai_reason TEXT</Code>).
            "duplicate column" errors are silently swallowed — safe to re-deploy.
          </InfoBox>
        </Card>

        <Arrow />

        {/* STEP 11 — SSE EVENTS */}
        <Card color={C.blue} step={11} title="SSE EVENTS — Real-Time Browser Streaming">
          <InfoBox color={C.blue} style={{ marginBottom: 14 }}>
            The browser opens an <Code>EventSource</Code> on <Code>/api/agent/run</Code> (with JWT in query params).
            The server writes <Code>text/event-stream</Code>. <Code>retry:0</Code> is set to prevent
            auto-reconnect after completion. Raw <Code>{': ping\\n\\n'}</Code> comments are written every
            8s during rate-limit waits.
          </InfoBox>
          <div>
            <EventRow
              name="status"
              color={C.blue}
              when="Throughout the run: search start, per-profile fetch (progress 0–80%), AI batch scoring (80–95%), direct handle phase (95%), rate-pacing waits. Payload: { message, progress?, phase? }"
            />
            <EventRow
              name="search_done"
              color={C.green}
              when="After each query's search API call succeeds. Payload: { query, found, fetching, handles[], tweets_returned, duration_ms }"
            />
            <EventRow
              name="health"
              color={C.blue}
              when="After every search result and after each profile fetch. Payload: { status, strength, color, avgMs, successRate, calls, successes, errors, durations, key_stats }"
            />
            <EventRow
              name="account"
              color={C.green}
              when="After each account is upserted. Payload: { account { ...all DB fields, isDuplicate, index, total }, health, durations }. Direct handle accounts add source: 'friend_list'."
            />
            <EventRow
              name="fetch_error"
              color={C.red}
              when="When a screenname.php call fails for a handle. Payload: { handle, index, total, status, error, health }"
            />
            <EventRow
              name="error"
              color={C.red}
              when="When a search API call fails for a query. Payload: { step, message, status }"
            />
            <EventRow
              name="quota_exhausted"
              color={C.red}
              when="When globalConsecutive429 >= 3 across all keys (QuotaExhaustedError caught). Payload: { message }. Run stops immediately."
            />
            <EventRow
              name="complete"
              color={C.green}
              when="At end of run (success or quota). Payload: { runId, accountsAdded, duplicatesSkipped, errors, quotaExhausted, health }. runs row updated with final status."
            />
          </div>
        </Card>

        <Arrow />

        {/* STEP 12 — API ENDPOINTS */}
        <Card color={C.purple} step={12} title="API ENDPOINTS — All Backend Routes">
          {/* Auth */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, margin: '0 0 8px', letterSpacing: 0.5 }}>AUTH</div>
          <RouteRow method="POST" path="/api/auth/login" auth={false} returns="{ token, user: { id, email, role } } — JWT, 7d expiry" />
          <RouteRow method="GET"  path="/api/auth/me"    auth={true}  returns="{ id, email, role } from JWT payload" />
          <RouteRow method="POST" path="/api/auth/register" auth={false} returns="Always 403 — registration disabled" />

          {/* Accounts */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, margin: '16px 0 8px', letterSpacing: 0.5 }}>ACCOUNTS</div>
          <RouteRow method="GET" path="/api/accounts" auth={true}
            returns="{ accounts[], total } — filters: track, type, tier, min_score, limit(1000), offset(0). Note: total is unfiltered count." />
          <RouteRow method="GET" path="/api/accounts/influencers" auth={true}
            returns="{ accounts[] } — track='A', overall DESC, LIMIT 1000" />
          <RouteRow method="GET" path="/api/accounts/pr-pages" auth={true}
            returns="{ accounts[] } — track='B', overall DESC, LIMIT 1000" />
          <RouteRow method="GET" path="/api/accounts/:handle" auth={true}
            returns="{ account } or 404 — handle lowercased before lookup" />

          {/* Keywords */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, margin: '16px 0 8px', letterSpacing: 0.5 }}>KEYWORDS</div>
          <RouteRow method="GET"    path="/api/keywords"           auth={true}  returns="All keywords ordered by class, category, keyword" />
          <RouteRow method="POST"   path="/api/keywords"           auth={true}  returns="Add keyword { keyword, category?, class? } → 409 if duplicate" />
          <RouteRow method="PATCH"  path="/api/keywords/:id"       auth={true}  returns="Toggle active flag { active: bool }" />
          <RouteRow method="DELETE" path="/api/keywords/:id"       auth={true}  returns="Permanently delete keyword by ID" />
          <RouteRow method="GET"    path="/api/keywords/friend"    auth={true}  returns="{ classes, keywords, influencers, totals } from read-only friend DB" />

          {/* Settings */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, margin: '16px 0 8px', letterSpacing: 0.5 }}>SETTINGS</div>
          <RouteRow method="GET"   path="/api/settings"                  auth={true}  returns="Non-sensitive agent_config rows + runtime flags (openrouter_env_set, model_chain, db_url, safe_rpm, friend_db_set)" />
          <RouteRow method="GET"   path="/api/settings/keys"             auth={true}  returns="Live RapidAPI key status (no key values exposed)" />
          <RouteRow method="POST"  path="/api/settings/keys/test"        auth={true}  returns="Per-key live test result: ok | quota_exhausted | not_subscribed | invalid_key | error" />
          <RouteRow method="POST"  path="/api/settings/test-openrouter"  auth={true}  returns="{ ok, model, response } or 502 — fires live test prompt via OpenRouter" />
          <RouteRow method="GET"   path="/api/settings/test-friend-db"   auth={true}  returns="{ ok, keywordCount, influencerCount } — tests read-only friend Turso connection" />
          <RouteRow method="PATCH" path="/api/settings/:configKey"       auth={true}  returns="Upserts agent_config value — blocks openrouter/jwt/turso/rapidapi keys" />

          {/* Agent */}
          <div style={{ fontSize: 12, fontWeight: 700, color: C.red, margin: '16px 0 8px', letterSpacing: 0.5 }}>AGENT</div>
          <RouteRow method="GET" path="/api/agent/run" auth={true}
            returns="text/event-stream — starts runAgent(), streams SSE events. retry:0 prevents auto-reconnect." />
          <RouteRow method="GET" path="/api/agent/status" auth={true}
            returns="{ running, runId?, startedAt? } — whether an agent run is currently active" />
          <RouteRow method="POST" path="/api/agent/stop" auth={true}
            returns="Signals abort to running agent via isAborted flag — graceful stop" />

          <div style={{ marginTop: 14 }}>
            <Row gap={10}>
              <Tag color={C.gold}>JWT req.</Tag>
              <span style={{ fontSize: 11, color: C.muted }}>= Bearer token in Authorization header (all protected routes)</span>
            </Row>
            <Row gap={10} style={{ marginTop: 6 }}>
              <Tag color={C.green}>public</Tag>
              <span style={{ fontSize: 11, color: C.muted }}>= No auth needed (only /api/auth/login)</span>
            </Row>
          </div>
        </Card>

      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div style={{
        marginTop: 40,
        paddingTop: 20,
        borderTop: `1px solid ${C.border}`,
        fontSize: 11,
        color: C.muted,
        textAlign: 'center',
      }}>
        KiteAI X Agent — Backend Workflow Reference — Generated from source
      </div>
    </div>
  );
}
