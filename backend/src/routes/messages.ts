/**
 * Messages Routes — Secure founder ↔ investor messaging
 */

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/messages — Send a message
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { receiverId, ideaId, content } = req.body;
        if (!receiverId || !ideaId || !content) {
            return res.status(400).json({ error: 'receiverId, ideaId, and content are required' });
        }
        const message = await prisma.message.create({
            data: { senderId: req.user!.id, receiverId, ideaId, content },
            include: { sender: { select: { name: true, role: true } } },
        });
        res.status(201).json({ message });
    } catch {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// GET /api/messages/:ideaId — Get conversation for an idea
router.get('/:ideaId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const messages = await prisma.message.findMany({
            where: {
                ideaId: req.params.ideaId,
                OR: [{ senderId: req.user!.id }, { receiverId: req.user!.id }],
            },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { name: true, role: true } } },
        });
        res.json({ messages });
    } catch {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// GET /api/messages — Get all conversations (inbox)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const messages = await prisma.message.findMany({
            where: { OR: [{ senderId: req.user!.id }, { receiverId: req.user!.id }] },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { name: true, role: true } },
                receiver: { select: { name: true, role: true } },
                idea: { select: { id: true, title: true } },
            },
            distinct: ['ideaId'],
        });
        res.json({ messages });
    } catch {
        res.status(500).json({ error: 'Failed to fetch inbox' });
    }
});

export default router;
