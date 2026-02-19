/**
 * IdeaVault Backend — Express Server Entry Point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import ideasRouter from './routes/ideas';
import messagesRouter from './routes/messages';
import healthRouter from './routes/health';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/health', healthRouter);

// Root — for Render / platform health checks (must return 200)
app.get('/', (_req, res) => {
    res.status(200).json({
        service: 'IdeaVault API',
        status: 'ok',
        health: '/health',
        api: '/api',
    });
});

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'IdeaVault API',
        algorandNetwork: process.env.ALGORAND_NETWORK || 'testnet',
        appId: process.env.ALGORAND_APP_ID || '0',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Listen on 0.0.0.0 so Render / PaaS can reach the server
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`\n🚀 IdeaVault API running on ${HOST}:${PORT}`);
    console.log(`   Network: ${process.env.ALGORAND_NETWORK || 'testnet'}`);
    console.log(`   App ID:  ${process.env.ALGORAND_APP_ID || 'not set'}`);
    console.log(`   Health:  /health\n`);
});

export default app;
