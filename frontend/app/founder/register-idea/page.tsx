'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerIdea } from '@/services/api';

const CATEGORIES = ['FINTECH', 'HEALTHTECH', 'EDTECH', 'AGRITECH', 'ECOMMERCE', 'SAAS', 'AI_ML', 'BLOCKCHAIN', 'SUSTAINABILITY', 'GAMING', 'SOCIAL', 'OTHER'];
const STAGES = ['IDEA', 'MVP', 'EARLY_TRACTION', 'GROWTH', 'SCALING'];
const VISIBILITY = [
    { value: 'PUBLIC', label: '🌍 Public — visible to all investors' },
    { value: 'PRIVATE', label: '🔒 Private — only you can see it' },
    { value: 'NDA_REQUIRED', label: '📑 NDA Required — investors request access' },
];

export default function RegisterIdeaPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '', description: '', category: '', stage: '', location: '',
        fundingGoal: '', teamSize: '', visibility: 'PUBLIC',
    });
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<any>(null);

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    async function handleSubmit() {
        setSubmitting(true); setError('');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
            if (file) fd.append('pitchDeck', file);
            const res = await registerIdea(fd);
            setResult(res);
            setStep(4); // success step
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // Step 4 — Success
    if (step === 4 && result) {
        const { blockchainProof } = result;
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-gradient-to-br from-green-900/30 to-slate-900 border border-green-500/30 rounded-3xl p-8 text-center">
                    <div className="text-6xl mb-4">🛡️</div>
                    <h1 className="text-3xl font-black text-white mb-2">Idea Registered on Blockchain!</h1>
                    <p className="text-slate-400 mb-8">Your startup idea is now permanently protected on Algorand Testnet.</p>
                    <div className="space-y-3 text-left bg-slate-950/50 rounded-2xl p-6 mb-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-400 text-xs">SHA-256 Hash</p>
                            <p className="font-mono text-blue-300 text-xs break-all">{blockchainProof.ideaHash}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-400 text-xs">Transaction ID</p>
                            <a href={blockchainProof.explorerLink} target="_blank" rel="noopener noreferrer"
                                className="font-mono text-blue-400 text-xs hover:text-blue-300 break-all">
                                {blockchainProof.txnId} ↗
                            </a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-400 text-xs">App ID (Smart Contract)</p>
                            <a href={blockchainProof.appLink} target="_blank" rel="noopener noreferrer"
                                className="font-mono text-blue-400 text-xs hover:text-blue-300">
                                #{blockchainProof.appId} ↗
                            </a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-400 text-xs">IPFS CID (Documents)</p>
                            <p className="font-mono text-slate-300 text-xs">{blockchainProof.ipfsCid}</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <a href={blockchainProof.explorerLink} target="_blank" rel="noopener noreferrer"
                            className="flex-1 border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 px-6 py-3 rounded-xl font-semibold text-sm transition-colors text-center">
                            View on Testnet Explorer ↗
                        </a>
                        <button onClick={() => router.push('/founder/dashboard')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-8">
                {['Idea Details', 'Documents', 'Preview & Submit'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                            }`}>
                            {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${step === i + 1 ? 'text-white' : 'text-slate-500'}`}>{s}</span>
                        {i < 2 && <div className="flex-1 h-px bg-slate-800" />}
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h1 className="text-2xl font-black text-white mb-6">Register Your Startup Idea</h1>

                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}

                {/* Step 1 — Idea Details */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">Idea Title *</label>
                            <input value={form.title} onChange={e => set('title', e.target.value)}
                                placeholder="e.g. AI-powered supply chain optimizer for SMEs"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">Description *</label>
                            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5}
                                placeholder="Describe your startup idea in detail. Include the problem you're solving, your solution, and target market."
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1.5">Category *</label>
                                <select value={form.category} onChange={e => set('category', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1.5">Stage *</label>
                                <select value={form.stage} onChange={e => set('stage', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                                    <option value="">Select stage</option>
                                    {STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1.5">Location</label>
                                <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1.5">Funding Goal (USD)</label>
                                <input value={form.fundingGoal} onChange={e => set('fundingGoal', e.target.value)} placeholder="e.g. 500000" type="number"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium block mb-1.5">Team Size</label>
                                <input value={form.teamSize} onChange={e => set('teamSize', e.target.value)} placeholder="e.g. 3" type="number"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} disabled={!form.title || !form.description || !form.category || !form.stage}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-3 rounded-xl font-bold transition-colors">
                            Next: Upload Documents →
                        </button>
                    </div>
                )}

                {/* Step 2 — Documents */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">Visibility</label>
                            <div className="space-y-2">
                                {VISIBILITY.map(v => (
                                    <label key={v.value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.visibility === v.value ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'
                                        }`}>
                                        <input type="radio" name="visibility" value={v.value} checked={form.visibility === v.value}
                                            onChange={() => set('visibility', v.value)} className="text-blue-600" />
                                        <span className="text-slate-300 text-sm">{v.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">Pitch Deck / Supporting Document (optional)</label>
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-green-500/40 bg-green-500/5' : 'border-slate-700 hover:border-slate-600'}`}>
                                {file ? (
                                    <div>
                                        <p className="text-green-400 font-semibold">{file.name}</p>
                                        <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button onClick={() => setFile(null)} className="text-red-400 text-sm mt-2 hover:text-red-300">Remove</button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <p className="text-slate-400">📎 Click to upload PDF, PPTX, or DOCX</p>
                                        <p className="text-slate-600 text-xs mt-1">Max 10MB — stored on IPFS, CID anchored on blockchain</p>
                                        <input type="file" accept=".pdf,.pptx,.docx,.doc" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="flex-1 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-colors hover:border-slate-500">← Back</button>
                            <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">Preview & Submit →</button>
                        </div>
                    </div>
                )}

                {/* Step 3 — Preview */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-slate-950/60 rounded-2xl p-6 space-y-3">
                            <h3 className="text-white font-bold text-xl">{form.title}</h3>
                            <p className="text-slate-400 text-sm">{form.description}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full">{form.category}</span>
                                <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full">{form.stage}</span>
                                {form.location && <span className="bg-slate-700 text-slate-400 text-xs px-3 py-1 rounded-full">📍 {form.location}</span>}
                                {form.fundingGoal && <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">💰 ${parseInt(form.fundingGoal).toLocaleString()}</span>}
                            </div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                            <p className="text-blue-400 text-sm font-semibold mb-1">🔐 Blockchain Registration Process</p>
                            <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                                <li>SHA-256 hash generated from your idea content</li>
                                <li>Documents uploaded to IPFS (Pinata) → CID created</li>
                                <li>Hash + CID registered on Algorand smart contract</li>
                                <li>Blockchain certificate returned with Testnet TX ID</li>
                            </ol>
                        </div>
                        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}
                        <div className="flex gap-3">
                            <button onClick={() => setStep(2)} disabled={submitting} className="flex-1 border border-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-colors hover:border-slate-500 disabled:opacity-40">← Back</button>
                            <button onClick={handleSubmit} disabled={submitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors">
                                {submitting ? 'Registering on Blockchain...' : '🛡️ Register on Blockchain'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
