'use client';

import { useState } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import { connectWallet } from '@/services/api';

const peraWallet = typeof window !== 'undefined' ? new PeraWalletConnect() : null;

interface WalletConnectButtonProps {
    onConnected?: (address: string) => void;
    className?: string;
}

export default function WalletConnectButton({ onConnected, className = '' }: WalletConnectButtonProps) {
    const [address, setAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleConnect() {
        if (!peraWallet) return;
        setLoading(true);
        try {
            const accounts = await peraWallet.connect();
            const addr = accounts[0];
            setAddress(addr);
            await connectWallet(addr);
            onConnected?.(addr);
        } catch (err) {
            console.error('Wallet connect failed:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDisconnect() {
        if (!peraWallet) return;
        await peraWallet.disconnect();
        setAddress(null);
    }

    if (address) {
        return (
            <button
                onClick={handleDisconnect}
                className={`flex items-center gap-2 bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-2 rounded-lg text-sm font-mono hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all ${className}`}
            >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {address.substring(0, 6)}...{address.substring(-4)}
            </button>
        );
    }

    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            )}
            Connect Pera Wallet
        </button>
    );
}
