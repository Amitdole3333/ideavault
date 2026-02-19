'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIdeas, getIdea, shortlistIdea, Idea } from '@/services/api';

const CATEGORIES = ['All', 'FINTECH', 'HEALTHTECH', 'EDTECH', 'AGRITECH', 'ECOMMERCE', 'SAAS', 'AI_ML', 'BLOCKCHAIN', 'SUSTAINABILITY', 'GAMING', 'SOCIAL', 'OTHER'];
const STAGES = ['All', 'IDEA', 'MVP', 'EARLY_TRACTION', 'GROWTH', 'SCALING'];

export default function BrowsePage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [stage, setStage] = useState('All');
    const [search, setSearch] = useState('');

    async function fetchIdeas() {
        setLoading(true);
        const params: Record<string, string> = {};
        if (category !== 'All') params.category = category;
        if (stage !== 'All') params.stage = stage;
        if (search) params.search = search;
        const res = await getIdeas(params);
        setIdeas(res.ideas); setTotal(res.total);
        setLoading(false);
    }

    useEffect(() => { fetchIdeas(); }, [category, stage]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Browse Verified Ideas</h1>
                <p className="text-slate-400">{total} blockchain-verified startup ideas</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    placeholder="Search ideas..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchIdeas()}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <select value={category} onChange={e => setCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
                <select value={stage} onChange={e => setStage(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                    {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>

            {/* Ideas Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
            ) : ideas.length === 0 ? (
                <div className="text-center py-20 text-slate-400">No ideas found for selected filters.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map(idea => (
                        <div key={idea.id} className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 flex flex-col gap-4 transition-colors">
                            {/* Title + badges */}
                            <div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {idea.isVerified && (
                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30 font-semibold">
                                            ✓ Blockchain Verified
                                        </span>
                                    )}
                                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full">{idea.category?.replace('_', ' ')}</span>
                                    <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-full">{idea.stage?.replace('_', ' ')}</span>
                                </div>
                                <h3 className="text-white font-bold text-lg leading-snug">{idea.title}</h3>
                            </div>

                            {/* Description */}
                            <p className="text-slate-400 text-sm line-clamp-3 flex-1">{idea.description}</p>

                            {/* Founder info */}
                            {idea.founder && (
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                        {idea.founder.name?.[0]?.toUpperCase()}
                                    </div>
                                    <span>{idea.founder.name}</span>
                                    {idea.founder.location && <span className="text-slate-600">· {idea.founder.location}</span>}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-slate-800">
                                <Link href={`/idea/${idea.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold text-center transition-colors">
                                    View Details
                                </Link>
                                <button
                                    onClick={() => shortlistIdea(idea.id).catch(console.error)}
                                    className="border border-slate-700 hover:border-yellow-500/40 text-slate-400 hover:text-yellow-400 px-4 py-2 rounded-lg text-sm transition-colors"
                                    title="Shortlist"
                                >
                                    ⭐
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
