/**
 * Auth Middleware — JWT verification and role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';  // bring in User

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        // infer role type from Prisma's User model
        role: User['role'];
        walletAddress?: string | null;
    };
}

/**
 * Require valid JWT token. Attaches user to req.user.
 */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true, walletAddress: true },
        });

        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Require specific role. Must be used after requireAuth.
 */
export function requireRole(...roles: Array<User['role']>) {   // use User['role']
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access restricted to: ${roles.join(', ')}` });
        }
        next();
    };
}
