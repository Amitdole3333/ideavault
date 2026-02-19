'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register, setToken } from '@/services/api';

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FOUNDER', company: '', location: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const { token, user } = await register(form);
            setToken(token);
            localStorage.setItem('user', JSON.stringify(user));
            router.push(user.role === 'FOUNDER' ? '/founder/dashboard' : '/investor/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
                    <p className="text-slate-400">Join the blockchain-powered startup ecosystem</p>
                </div>

                {/* Role Toggle */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-1 flex gap-1 mb-6">
                    {['FOUNDER', 'INVESTOR'].map(r => (
                        <button
                            key={r}
                            onClick={() => setForm({ ...form, role: r })}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${form.role === r
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {r === 'FOUNDER' ? '🚀 I am a Founder' : '💼 I am an Investor'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    <input
                        required
                        placeholder="Full Name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                        required type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                        required type="password"
                        placeholder="Password (min 8 chars)"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                        placeholder="Company / Organization (optional)"
                        value={form.company}
                        onChange={e => setForm({ ...form, company: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <input
                        placeholder="Location (optional)"
                        value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-lg transition-colors"
                    >
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>

                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
