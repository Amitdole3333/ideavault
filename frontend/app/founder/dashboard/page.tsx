'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIdeas, getPlatformStats, Idea, User } from '@/services/api';

export default function FounderDashboard() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [stats, setStats] = useState<{ totalIdeas: number; verifiedIdeas: number; onChainTotal: number } | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
        Promise.all([getIdeas(), getPlatformStats()]).then(([ideasRes, statsRes]) => {
            setIdeas(ideasRes.ideas);
            setStats(statsRes);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white">Founder Dashboard</h1>
                    <p className="text-slate-400 mt-1">Welcome back, {user?.name || 'Founder'}</p>
                </div>
                <Link href="/founder/register-idea" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap">
                    + Register New Idea
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <p className="text-slate-400 text-sm">Your Ideas</p>
                        <p className="text-4xl font-black text-white mt-1">{ideas.length}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <p className="text-slate-400 text-sm">On-Chain (Total Platform)</p>
                        <p className="text-4xl font-black text-blue-400 mt-1">{stats.onChainTotal}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <p className="text-slate-400 text-sm">Blockchain Verified</p>
                        <p className="text-4xl font-black text-green-400 mt-1">{stats.verifiedIdeas}</p>
                    </div>
                </div>
            )}

            {/* Ideas List */}
            <h2 className="text-xl font-bold text-white mb-4">Your Registered Ideas</h2>
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
            ) : ideas.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                    <p className="text-slate-400 text-lg">No ideas registered yet.</p>
                    <Link href="/founder/register-idea" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                        Register Your First Idea
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {ideas.map(idea => (
                        <div key={idea.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h3 className="text-white font-bold text-lg">{idea.title}</h3>
                                        {idea.isVerified && (
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30 font-semibold flex items-center gap-1">
                                                ✓ Blockchain Verified
                                            </span>
                                        )}
                                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{idea.category}</span>
                                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{idea.stage}</span>
                                    </div>
                                    <p className="text-slate-400 text-sm line-clamp-2">{idea.description}</p>
                                    {idea.ideaHash && (
                                        <p className="text-slate-600 text-xs font-mono mt-2 truncate">
                                            Hash: {idea.ideaHash.substring(0, 32)}...
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/idea/${idea.id}`} className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
