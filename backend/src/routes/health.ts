/**
 * Health Check Route — Test external service connectivity
 */

import { Router, Request, Response } from 'express';
import algosdk, { Address } from 'algosdk';
import pinataSDK from '@pinata/sdk';

const router = Router();

const ALGOD_URL = process.env.ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud';
const APP_ID = parseInt(process.env.ALGORAND_APP_ID || '0');
const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';

/**
 * Test Pinata connectivity
 */
async function testPinata(): Promise<{ status: string; error?: string; details?: any }> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (PINATA_JWT) {
            headers['Authorization'] = `Bearer ${PINATA_JWT}`;
        } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
            headers['pinata_api_key'] = PINATA_API_KEY;
            headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
        } else {
            return { status: 'error', error: 'No Pinata credentials configured' };
        }

        // Test with a minimal JSON object
        const testBody = JSON.stringify({
            pinataContent: { test: 'health-check', timestamp: Date.now() },
            pinataMetadata: { name: 'health-check.json' },
            pinataOptions: { cidVersion: 0 },
        });

        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers,
            body: testBody,
        });

        if (response.status === 403) {
            return {
                status: 'error',
                error: 'Pinata returned 403 Forbidden',
                details: {
                    statusCode: 403,
                    message: 'Check your API key permissions or JWT token validity',
                    hasJWT: !!PINATA_JWT,
                    hasAPIKey: !!PINATA_API_KEY,
                },
            };
        }

        if (response.status === 429) {
            return {
                status: 'warning',
                error: 'Pinata rate limited (429)',
                details: {
                    statusCode: 429,
                    message: 'Too many requests - wait a minute and try again',
                },
            };
        }

        if (!response.ok) {
            const errorText = await response.text();
            return {
                status: 'error',
                error: `Pinata returned ${response.status}`,
                details: {
                    statusCode: response.status,
                    message: errorText,
                },
            };
        }

        const result = await response.json() as { IpfsHash: string };
        return {
            status: 'ok',
            details: {
                cid: result.IpfsHash,
                message: 'Pinata connection successful',
            },
        };
    } catch (err: any) {
        return {
            status: 'error',
            error: err.message || 'Pinata connection failed',
        };
    }
}

/**
 * Test Algorand connectivity
 */
async function testAlgorand(): Promise<{ status: string; error?: string; details?: any }> {
    try {
        const algodClient = new algosdk.Algodv2('', ALGOD_URL, '');

        // Test 1: Get transaction params (basic connectivity)
        let suggestedParams;
        try {
            suggestedParams = await algodClient.getTransactionParams().do();
        } catch (err: any) {
            if (err.status === 403) {
                return {
                    status: 'error',
                    error: 'Algorand node returned 403 Forbidden',
                    details: {
                        statusCode: 403,
                        message: 'Check your Algorand node URL and API key (if required)',
                        nodeUrl: ALGOD_URL,
                    },
                };
            }
            throw err;
        }

        // Test 2: Get app info and app address (if app ID is set)
        let appInfo = null;
        let appAddress: string | Address | null = null;
        let appBalanceWarning: string | null = null;

        if (APP_ID) {
            appAddress = algosdk.getApplicationAddress(APP_ID) as Address;
            try {
                appInfo = await algodClient.getApplicationByID(APP_ID).do();
                const accountInfo = await algodClient.accountInformation(appAddress).do();
                const balance = accountInfo.amount || 0;
                const minBalance = accountInfo.minBalance || 100000; // 0.1 ALGO default
                if (balance < minBalance) {
                    appBalanceWarning = `App account needs funding: balance ${balance} below min ${minBalance}. Fund ${appAddress} at https://bank.testnet.algorand.network/`;
                }
            } catch (err: any) {
                appInfo = { error: err.message };
            }
        }

        // Test 3: Check deployer account (if mnemonic is set)
        let deployerAccount: { address: string; balance?: number; minBalance?: number; needsFunding?: boolean; error?: string } | null = null;
        const mnemonic = process.env.ALGORAND_DEPLOYER_MNEMONIC;
        if (mnemonic) {
            try {
                const account = algosdk.mnemonicToSecretKey(mnemonic);
                const deployerInfo = await algodClient.accountInformation(account.addr).do();
                const balance = Number(deployerInfo.amount || 0);
                const minBalance = Number(deployerInfo.minBalance || 100000);
                deployerAccount = {
                    address: account.addr.toString(),
                    balance,
                    minBalance,
                    needsFunding: balance < minBalance,
                };
            } catch (err: any) {
                deployerAccount = { address: '', needsFunding: false, error: err.message };
            }
        }

        const hasDeployer = deployerAccount && !('error' in deployerAccount && deployerAccount.error);
        const details: any = {
            nodeUrl: ALGOD_URL,
            network: process.env.ALGORAND_NETWORK || 'testnet',
            appId: APP_ID,
            appAddress,
            appExists: appInfo && !('error' in appInfo),
            deployerConfigured: !!hasDeployer,
            message: 'Algorand connection successful',
        };
        if (appBalanceWarning) details.appBalanceWarning = appBalanceWarning;
        if (deployerAccount?.needsFunding) {
            details.deployerNeedsFunding = true;
            details.deployerAddress = deployerAccount.address;
            details.fundingUrl = 'https://bank.testnet.algorand.network/';
        }

        return { status: 'ok', details };
    } catch (err: any) {
        return {
            status: 'error',
            error: err.message || 'Algorand connection failed',
            details: {
                nodeUrl: ALGOD_URL,
            },
        };
    }
}

/**
 * GET /api/health/check — Comprehensive health check
 */
router.get('/check', async (_req: Request, res: Response) => {
    const startTime = Date.now();

    const [pinataResult, algorandResult] = await Promise.all([
        testPinata(),
        testAlgorand(),
    ]);

    const duration = Date.now() - startTime;

    const overallStatus =
        pinataResult.status === 'ok' && algorandResult.status === 'ok'
            ? 'healthy'
            : pinataResult.status === 'warning' || algorandResult.status === 'warning'
            ? 'degraded'
            : 'unhealthy';

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        services: {
            pinata: pinataResult,
            algorand: algorandResult,
        },
        environment: {
            network: process.env.ALGORAND_NETWORK || 'testnet',
            appId: APP_ID,
            nodeUrl: ALGOD_URL,
        },
    });
});

/**
 * GET /api/health/pinata — Test Pinata only
 */
router.get('/pinata', async (_req: Request, res: Response) => {
    const result = await testPinata();
    res.status(result.status === 'ok' ? 200 : 503).json(result);
});

/**
 * GET /api/health/algorand — Test Algorand only
 */
router.get('/algorand', async (_req: Request, res: Response) => {
    const result = await testAlgorand();
    res.status(result.status === 'ok' ? 200 : 503).json(result);
});

/**
 * GET /api/health/funding — Addresses to fund for blockchain registration
 * Use when you see "balance 0 below min" (400 Bad Request).
 */
router.get('/funding', (_req: Request, res: Response) => {
    const appAddress = APP_ID > 0 ? algosdk.getApplicationAddress(APP_ID) : null;
    res.json({
        message: 'Fund these addresses with testnet ALGO at https://bank.testnet.algorand.network/',
        dispenserUrl: 'https://bank.testnet.algorand.network/',
        accounts: {
            appAccount: appAddress
                ? {
                      address: appAddress,
                      role: 'Smart contract (IdeaRegistry). Must hold min balance for box storage.',
                      minAlgo: '~0.2 ALGO recommended',
                  }
                : null,
            deployerAccount: 'From your ALGORAND_DEPLOYER_MNEMONIC (fund via wallet address in Algorand explorer or use /api/health/check for deployer address)',
        },
    });
});

/**
 * POST /api/health/upload — Upload a file to IPFS
 */
router.post('/upload', async (req, res) => {
    const pinata = new pinataSDK(process.env.PINATA_API_KEY!, process.env.PINATA_SECRET_API_KEY!);

    const result = await pinata.pinJSONToIPFS(req.body) as { IpfsHash: string };
    const cid = result.IpfsHash;

    res.json({ cid });
});

export default router;
