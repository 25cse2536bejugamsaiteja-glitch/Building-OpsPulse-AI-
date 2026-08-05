import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { seedInitialData } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import agentRoutes from './routes/agent.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Seed data initialization
seedInitialData();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', inventoryRoutes);
app.use('/api/agent', agentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'OpsPulse AI Engine',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(config.geminiApiKey)
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 OpsPulse AI Backend active on http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Integration: ${config.geminiApiKey ? 'Configured' : 'Fallback Mode Active'}`);
});
