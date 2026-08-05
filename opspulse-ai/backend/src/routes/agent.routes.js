import express from 'express';
import { db, memoryStore } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { runAgentWorkflow } from '../services/agentExecutor.js';

const router = express.Router();

// Trigger autonomous reorder agent workflow
router.post('/trigger', authenticateToken, async (req, res) => {
  try {
    const { trigger, sku } = req.body;
    const result = await runAgentWorkflow({ trigger, sku });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Error running agent workflow:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch agent logs (filtered by run_id or recent)
router.get('/logs', authenticateToken, (req, res) => {
  try {
    const { runId } = req.query;
    let logs = [];

    if (db) {
      if (runId) {
        logs = db.prepare('SELECT * FROM agent_logs WHERE run_id = ? ORDER BY id ASC').all(runId);
      } else {
        logs = db.prepare('SELECT * FROM agent_logs ORDER BY id DESC LIMIT 50').all();
      }
    } else {
      if (runId) {
        logs = memoryStore.agent_logs.filter(l => l.run_id === runId);
      } else {
        logs = memoryStore.agent_logs.slice(-50).reverse();
      }
    }

    // Parse JSON string output field for frontend consumption
    const formattedLogs = logs.map(l => ({
      ...l,
      output: typeof l.output === 'string' && (l.output.startsWith('{') || l.output.startsWith('[')) ? JSON.parse(l.output) : l.output
    }));

    res.json({ success: true, logs: formattedLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch latest run ID logs
router.get('/logs/latest', authenticateToken, (req, res) => {
  try {
    let latestRunId = null;
    if (db) {
      const row = db.prepare('SELECT run_id FROM agent_logs ORDER BY id DESC LIMIT 1').get();
      latestRunId = row ? row.run_id : null;
    } else {
      latestRunId = memoryStore.agent_logs.length > 0 ? memoryStore.agent_logs[memoryStore.agent_logs.length - 1].run_id : null;
    }

    if (!latestRunId) {
      return res.json({ success: true, runId: null, logs: [] });
    }

    let logs = [];
    if (db) {
      logs = db.prepare('SELECT * FROM agent_logs WHERE run_id = ? ORDER BY id ASC').all(latestRunId);
    } else {
      logs = memoryStore.agent_logs.filter(l => l.run_id === latestRunId);
    }

    const formattedLogs = logs.map(l => ({
      ...l,
      output: typeof l.output === 'string' && (l.output.startsWith('{') || l.output.startsWith('[')) ? JSON.parse(l.output) : l.output
    }));

    res.json({ success: true, runId: latestRunId, logs: formattedLogs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
