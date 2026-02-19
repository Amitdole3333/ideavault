/**
 * IdeaVault API Client — Frontend service for backend communication
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ─── Token management ────────────────────────────────────────────────────────
export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
export const setToken = (token: string) => localStorage.setItem('token', token);
export const clearToken = () => localStorage.removeItem('token');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function register(body: { name: string; email: string; password: string; role: string; company?: string; location?: string }) {
    return request<{ user: User; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
}
export async function login(email: string, password: string) {
    return request<{ user: User; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function getMe() {
    return request<{ user: User }>('/api/auth/me');
}
export async function connectWallet(walletAddress: string) {
    return request<{ success: boolean; walletAddress: string }>('/api/auth/wallet', {
        method: 'PATCH', body: JSON.stringify({ walletAddress }),
    });
}

// ─── Ideas ────────────────────────────────────────────────────────────────────
export async function registerIdea(formData: FormData) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/ideas`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData, // multipart/form-data for file upload
    });
    const data = await res.json();
    if (!res.ok) {
        const message = data.error || (res.status === 429
            ? 'Too many requests. Please wait a minute and try again.'
            : 'Failed to register idea');
        throw new Error(message);
    }
    return data as { success: boolean; idea: Idea; blockchainProof: BlockchainProof };
}
export async function getIdeas(params?: Record<string, string>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ ideas: Idea[]; total: number; page: number; pages: number }>(`/api/ideas${qs}`);
}
export async function getIdea(id: string) {
    return request<{ idea: Idea }>(`/api/ideas/${id}`);
}
export async function verifyIdea(id: string) {
    return request<VerificationResult>(`/api/ideas/${id}/verify`, { method: 'POST' });
}
export async function shortlistIdea(id: string, note?: string) {
    return request(`/api/ideas/${id}/shortlist`, { method: 'POST', body: JSON.stringify({ note }) });
}
export async function getPlatformStats() {
    return request<{ totalIdeas: number; verifiedIdeas: number; onChainTotal: number }>('/api/ideas/stats');
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export async function sendMessage(receiverId: string, ideaId: string, content: string) {
    return request<{ message: Message }>('/api/messages', {
        method: 'POST', body: JSON.stringify({ receiverId, ideaId, content }),
    });
}
export async function getMessages(ideaId: string) {
    return request<{ messages: Message[] }>(`/api/messages/${ideaId}`);
}
export async function getInbox() {
    return request<{ messages: Message[] }>('/api/messages');
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
    id: string; name: string; email: string; role: 'FOUNDER' | 'INVESTOR';
    walletAddress?: string | null; bio?: string; company?: string; location?: string;
    linkedinUrl?: string; isVerified?: boolean; createdAt?: string;
}

export interface Idea {
    id: string; title: string; description: string; category: string; stage: string;
    location?: string; fundingGoal?: number; teamSize?: number; visibility: string;
    ideaHash: string; txnId?: string; appId?: string; blockTimestamp?: number;
    ipfsCid?: string; pitchDeckUrl?: string; isVerified: boolean;
    founderId: string; createdAt: string;
    founder?: { name: string; company?: string; location?: string; bio?: string; isVerified?: boolean; walletAddress?: string; };
    _count?: { shortlists: number };
}

export interface BlockchainProof {
    ideaHash: string; txnId: string; appId: string; blockTimestamp: number;
    ipfsCid: string; explorerLink: string; appLink: string; ipfsLink: string;
}

export interface VerificationResult {
    verified: boolean; ideaHash: string; txnId?: string; appId?: string;
    explorerLink?: string; appLink?: string; verifiedAt: string;
    onChainData?: { founderAddress: string; timestamp: number; ipfsCid: string } | null;
}

export interface Message {
    id: string; content: string; senderId: string; receiverId: string; ideaId: string;
    isRead: boolean; createdAt: string; sender?: { name: string; role: string };
    idea?: { id: string; title: string };
}
