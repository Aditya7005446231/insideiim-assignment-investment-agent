import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { listRuns, saveRun, getRun, generateId } from './lib/db.js';
import { runResearchAgent } from './lib/agent/index.js';
import { agentEvents } from './lib/agent/events.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// API Endpoints

// 1. GET /api/research - List all runs
app.get('/api/research', (req, res) => {
  try {
    const runs = listRuns();
    res.json({ success: true, data: runs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/research/:id - Get details of a single run
app.get('/api/research/:id', (req, res) => {
  try {
    const run = getRun(req.params.id);
    if (!run) {
      return res.status(404).json({ success: false, error: 'Run not found' });
    }
    res.json({ success: true, data: run });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST /api/research - Start research agent workflow
app.post('/api/research', async (req, res) => {
  try {
    const { companyName, depth = 'quick' } = req.body;
    if (!companyName || typeof companyName !== 'string' || companyName.trim() === '') {
      return res.status(400).json({ success: false, error: 'Company name is required.' });
    }

    const runId = generateId();
    const newRun = {
      id: runId,
      companyName: companyName.trim(),
      depth: depth === 'deep' ? 'deep' : 'quick',
      status: 'running',
      createdAt: new Date().toISOString(),
      logs: [`[System] Research run created with ID: ${runId}`],
    };

    // Save initial record to disk
    saveRun(newRun);

    // Run the agent workflow in the background
    runResearchAgent(runId, (event, payload) => {
      // Broadcast state progress to SSE stream listeners
      agentEvents.emit(runId, { event, payload });
    }).catch((err) => {
      console.error(`Error in background agent workflow ${runId}:`, err);
    });

    res.json({ success: true, data: { id: runId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /api/research/:id/stream - SSE Stream
app.get('/api/research/:id/stream', (req, res) => {
  const { id } = req.params;
  const run = getRun(id);

  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }

  // Setup SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  // Write initial state immediately
  res.write(`event: init\ndata: ${JSON.stringify(run)}\n\n`);

  const listener = (data) => {
    try {
      res.write(`event: ${data.event}\ndata: ${JSON.stringify(data.payload)}\n\n`);

      // Close stream if completed or failed
      if (
        data.event === 'result' ||
        data.event === 'error' ||
        (data.payload?.run && (data.payload.run.status === 'completed' || data.payload.run.status === 'failed'))
      ) {
        agentEvents.off(id, listener);
        res.end();
      }
    } catch (err) {
      console.error('SSE connection write failed:', err);
      agentEvents.off(id, listener);
      res.end();
    }
  };

  // Register listener for this run ID
  agentEvents.on(id, listener);

  // Keep-alive heartbeat interval to keep request alive
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (err) {
      clearInterval(keepAliveInterval);
    }
  }, 15000);

  // Clean up if connection closes
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    agentEvents.off(id, listener);
  });
});

// Serve compiled static frontend build path
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Wildcard SPA fallback route to serve React app for custom page routes
app.get('*', (req, res) => {
  // If the path starts with /api, return 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
