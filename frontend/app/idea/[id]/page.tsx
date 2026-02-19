'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getIdea, sendMessage, Idea } from '@/services/api';
import BlockchainCertificate from '@/components/BlockchainCertificate';

export default function IdeaDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [idea, setIdea] = useState<Idea | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
        getIdea(id).then(res => {
            setIdea(res.idea);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [id]);

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!idea || !message.trim()) return;
        setSending(true);
        try {
            await sendMessage(idea.founderId, idea.id, message);
            setMessageSent(true);
            setMessage('');
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }
    if (!idea) {
        return (
            <div className="text-center py-32 text-slate-400">
                <p className="text-2xl font-bold text-white mb-2">Idea not found</p>
                <Link href="/browse" className="text-blue-400 hover:text-blue-300">← Back to browse</Link>
            </div>
        );
    }

    const formattedDate = idea.blockTimestamp
        ? new Date(idea.blockTimestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date(idea.createdAt).toLocaleDateString();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/browse" className="text-slate-400 hover:text-white text-sm transition-colors">← Back to Browse</Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {idea.isVerified && (
                                <span className="bg-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full border border-green-500/30 font-semibold">
                                    ✓ Blockchain Verified
                                </span>
                            )}
                            <span className="bg-blue-500/10 text-blue-400 text-xs px-2.5 py-1 rounded-full">{idea.category?.replace('_', ' ')}</span>
                            <span className="bg-purple-500/10 text-purple-400 text-xs px-2.5 py-1 rounded-full">{idea.stage?.replace('_', ' ')}</span>
                            <span className="bg-slate-700 text-slate-400 text-xs px-2.5 py-1 rounded-full">{idea.visibility}</span>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-4">{idea.title}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                            {idea.location && <span>📍 {idea.location}</span>}
                            <span>📅 Registered {formattedDate}</span>
                            {idea.fundingGoal && <span>💰 ${idea.fundingGoal.toLocaleString()} funding goal</span>}
                            {idea.teamSize && <span>👥 Team of {idea.teamSize}</span>}
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                        </div>
                    </div>

                    {/* Blockchain Certificate */}
                    <BlockchainCertificate
                        ideaId={idea.id}
                        ideaHash={idea.ideaHash}
                        txnId={idea.txnId}
                        appId={idea.appId}
                        blockTimestamp={idea.blockTimestamp}
                        isVerified={idea.isVerified}
                    />

                    {/* Contact Founder (Investor only) */}
                    {user?.role === 'INVESTOR' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-white font-bold text-lg mb-4">Connect with Founder</h3>
                            {messageSent ? (
                                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm">
                                    ✅ Message sent! The founder will receive your message and can respond.
                                </div>
                            ) : (
                                <form onSubmit={handleSendMessage} className="space-y-3">
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Introduce yourself and explain your interest in this idea..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                    <button type="submit" disabled={sending || !message.trim()}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-bold transition-colors">
                                        {sending ? 'Sending...' : '📨 Send Message to Founder'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar — Founder Profile */}
                <div className="space-y-6">
                    {idea.founder && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Founder</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl font-black text-white">
                                    {idea.founder.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{idea.founder.name}</p>
                                    {idea.founder.company && <p className="text-slate-400 text-sm">{idea.founder.company}</p>}
                                </div>
                            </div>
                            {idea.founder.location && <p className="text-slate-400 text-sm">📍 {idea.founder.location}</p>}
                            {idea.founder.bio && <p className="text-slate-400 text-sm mt-3 line-clamp-3">{idea.founder.bio}</p>}
                            {idea.founder.linkedinUrl && (
                                <a href={idea.founder.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                    className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                                    LinkedIn Profile ↗
                                </a>
                            )}
                            {idea.founder.walletAddress && (
                                <div className="mt-4 bg-slate-950/50 rounded-xl p-3">
                                    <p className="text-slate-500 text-xs mb-1">Algorand Wallet</p>
                                    <p className="font-mono text-xs text-slate-400 break-all">{idea.founder.walletAddress}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
