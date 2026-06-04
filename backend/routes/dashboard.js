const express         = require('express');
const { db }          = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [totals, byType, byTier, byTrack, topAccounts, recentRuns, config] = await Promise.all([
      db.execute(`SELECT COUNT(*) as total,
                         SUM(CASE WHEN dm_open = 1 THEN 1 ELSE 0 END)   as dm_open,
                         SUM(CASE WHEN has_email = 1 THEN 1 ELSE 0 END) as has_email,
                         ROUND(AVG(overall), 1)                          as avg_score
                  FROM accounts`),
      db.execute(`SELECT account_type as type, COUNT(*) as count FROM accounts GROUP BY account_type ORDER BY count DESC`),
      db.execute(`SELECT tier, COUNT(*) as count FROM accounts GROUP BY tier ORDER BY count DESC`),
      db.execute(`SELECT track, COUNT(*) as count FROM accounts WHERE track IS NOT NULL GROUP BY track`),
      db.execute(`SELECT handle, name, avatar, tier, account_type, overall, followers FROM accounts ORDER BY overall DESC LIMIT 10`),
      db.execute(`SELECT id, started_at, completed_at, accounts_added, duplicates_skipped, status, triggered_by
                  FROM runs ORDER BY started_at DESC LIMIT 10`),
      db.execute(`SELECT key, value FROM agent_config`),
    ]);

    const configMap = {};
    const SENSITIVE = ['key', 'token', 'secret', 'password'];
    for (const row of config.rows) {
      if (SENSITIVE.some(s => row.key.toLowerCase().includes(s))) continue;
      configMap[row.key] = row.value;
    }

    res.json({
      totals:       totals.rows[0],
      byType:       byType.rows,
      byTier:       byTier.rows,
      byTrack:      byTrack.rows,
      topAccounts:  topAccounts.rows,
      recentRuns:   recentRuns.rows,
      config:       configMap,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

// GET /api/dashboard/last-run — per-run breakdown of the most recent run.
// Computed from accounts.run_id (set on every fetch/save) so it's accurate even
// if the run record never finalized (e.g. dev server restart mid-run).
router.get('/last-run', async (req, res) => {
  try {
    const runRes = await db.execute(
      `SELECT id, started_at, completed_at, status, triggered_by
       FROM runs ORDER BY id DESC LIMIT 1`
    );
    if (!runRes.rows.length) return res.json({ lastRun: null });
    const run   = runRes.rows[0];
    const runId = run.id;

    const [totalRow, breakdown, newRow] = await Promise.all([
      db.execute({ sql: `SELECT COUNT(*) n FROM accounts WHERE run_id = ?`, args: [runId] }),
      db.execute({
        sql: `SELECT
                SUM(CASE WHEN track='A' AND promotion_type='explicit' THEN 1 ELSE 0 END) a1,
                SUM(CASE WHEN track='A' AND promotion_type='inferred' THEN 1 ELSE 0 END) a2,
                SUM(CASE WHEN track='B'                                THEN 1 ELSE 0 END) trackB,
                SUM(CASE WHEN track='A' AND promotion_type IN ('none','unknown') THEN 1 ELSE 0 END) other
              FROM accounts WHERE run_id = ?`,
        args: [runId],
      }),
      db.execute({ sql: `SELECT COUNT(*) n FROM accounts WHERE run_id = ? AND first_seen >= ?`,
                   args: [runId, run.started_at] }),
    ]);

    const b            = breakdown.rows[0] || {};
    const totalFetched = Number(totalRow.rows[0].n);
    const newAccounts  = Number(newRow.rows[0].n);

    res.json({
      lastRun: {
        runId,
        triggeredBy:     run.triggered_by,
        status:          run.status,
        startedAt:       run.started_at,
        completedAt:     run.completed_at,
        totalFetched,                              // new + refreshed this run
        newAccounts,
        updatedAccounts: Math.max(0, totalFetched - newAccounts),
        a1:     Number(b.a1)     || 0,             // Track A — explicit (confirmed paid)
        a2:     Number(b.a2)     || 0,             // Track A — inferred (likely paid)
        trackB: Number(b.trackB) || 0,             // Track B — ads audience
        other:  Number(b.other)  || 0,             // Track A — none/unknown (unbadged)
      },
    });
  } catch (err) {
    console.error('last-run error:', err);
    res.status(500).json({ error: 'Failed to load last run' });
  }
});

// GET /api/dashboard/runs
router.get('/runs', async (req, res) => {
  try {
    const { rows } = await db.execute(
      'SELECT * FROM runs ORDER BY started_at DESC LIMIT 50'
    );
    res.json({ runs: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

module.exports = router;
