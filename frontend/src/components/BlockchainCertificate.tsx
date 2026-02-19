'use client';

import { useState } from 'react';
import { verifyIdea, VerificationResult } from '@/services/api';
import { CheckCircle, XCircle, Loader2, ExternalLink, Shield } from 'lucide-react';

interface BlockchainCertificateProps {
    ideaId: string;
    ideaHash?: string;
    txnId?: string;
    appId?: string;
    blockTimestamp?: number;
    isVerified?: boolean;
}

export default function BlockchainCertificate({
    ideaId, ideaHash, txnId, appId, blockTimestamp, isVerified,
}: BlockchainCertificateProps) {
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    const explorerBase = 'https://testnet.algoexplorer.io';

    async function handleVerify() {
        setVerifying(true);
        try {
            const res = await verifyIdea(ideaId);
            setResult(res);
        } catch {
            setResult(null);
        } finally {
            setVerifying(false);
        }
    }

    const ts = result?.onChainData?.timestamp || blockTimestamp;
    const formattedDate = ts ? new Date(ts * 1000).toLocaleString() : 'Unknown';

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Blockchain Certificate</h3>
                    <p className="text-slate-400 text-sm">Immutable proof of idea registration on Algorand Testnet</p>
                </div>
                {isVerified && (
                    <div className="ml-auto flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs font-semibold">VERIFIED</span>
                    </div>
                )}
            </div>

            {/* Hash */}
            {ideaHash && (
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">SHA-256 Idea Hash</p>
                    <p className="font-mono text-xs text-blue-300 bg-slate-950 rounded-lg px-3 py-2 break-all select-all border border-slate-700">
                        {ideaHash}
                    </p>
                </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {txnId && (
                    <div className="bg-slate-950/50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs mb-1">Transaction ID</p>
                        <a
                            href={`${explorerBase}/tx/${txnId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
                        >
                            {txnId.substring(0, 12)}...
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
                {appId && (
                    <div className="bg-slate-950/50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs mb-1">App ID (Smart Contract)</p>
                        <a
                            href={`${explorerBase}/application/${appId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-mono transition-colors"
                        >
                            #{appId}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
                {ts && (
                    <div className="bg-slate-950/50 rounded-xl p-3">
                        <p className="text-slate-400 text-xs mb-1">Registered At (On-Chain Timestamp)</p>
                        <p className="text-white text-xs font-medium">{formattedDate}</p>
                    </div>
                )}
                <div className="bg-slate-950/50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">Network</p>
                    <p className="text-orange-400 text-xs font-semibold">Algorand Testnet</p>
                </div>
            </div>

            {/* Live On-Chain Verification */}
            <div className="border-t border-slate-700 pt-4">
                <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                    {verifying ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Verifying on Algorand Testnet...</>
                    ) : (
                        <><Shield className="w-4 h-4" /> Verify Live on Blockchain</>
                    )}
                </button>

                {result && (
                    <div className={`mt-3 flex items-start gap-3 p-3 rounded-xl border ${result.verified
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        {result.verified ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <XCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                        <div>
                            <p className="font-semibold text-sm">
                                {result.verified ? 'Hash verified on Algorand Testnet' : 'Hash NOT found on blockchain'}
                            </p>
                            <p className="text-xs opacity-75 mt-0.5">
                                Checked live at: {new Date(result.verifiedAt).toLocaleTimeString()}
                            </p>
                            {result.onChainData && (
                                <p className="text-xs opacity-75 mt-0.5">
                                    Registered by: {result.onChainData.founderAddress.substring(0, 16)}...
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
