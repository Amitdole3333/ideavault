/**
 * Auth Routes — Register, Login, Get Profile
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, company, location } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'name, email, password, and role are required' });
        }
        if (!['FOUNDER', 'INVESTOR'].includes(role)) {
            return res.status(400).json({ error: 'role must be FOUNDER or INVESTOR' });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, password: hashed, role, company, location },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true, name: true, email: true, role: true,
                walletAddress: true, bio: true, company: true,
                location: true, linkedinUrl: true, isVerified: true, createdAt: true,
            },
        });
        res.json({ user });
    } catch {
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// PATCH /api/auth/wallet — Connect wallet address to account
router.patch('/wallet', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });

        const updated = await prisma.user.update({
            where: { id: req.user!.id },
            data: { walletAddress },
            select: { id: true, walletAddress: true },
        });
        res.json({ success: true, walletAddress: updated.walletAddress });
    } catch {
        res.status(500).json({ error: 'Failed to update wallet' });
    }
});

export default router;
