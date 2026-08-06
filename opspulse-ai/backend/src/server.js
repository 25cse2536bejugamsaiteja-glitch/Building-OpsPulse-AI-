import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { seedInitialData } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import agentRoutes from './routes/agent.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Seed data initialization
seedInitialData();

// Routes - supporting route aliases for high availability & compatibility
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Aliases for /api/login, /api/register, /api/me
app.use('/auth', authRoutes); // Aliases for /auth/login, /auth/register
app.use('/login', authRoutes);
app.use('/register', authRoutes);

app.use('/api', inventoryRoutes);
app.use('/inventory', inventoryRoutes);

app.use('/api/agent', agentRoutes);
app.use('/agent', agentRoutes);

// Health check endpoint
app.get(['/', '/health', '/api/health'], (req, res) => {
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
