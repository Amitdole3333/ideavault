/**
 * IPFS Service — Upload files to IPFS via Pinata
 */

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_API_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry on 429 (Too Many Requests). Pinata and other APIs rate-limit; retry with backoff.
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES,
): Promise<Response> {
    const response = await fetch(url, options);
    if (response.status === 429 && retries > 0) {
        const delay = RETRY_DELAY_MS * Math.pow(2, MAX_RETRIES - retries);
        await sleep(delay);
        return fetchWithRetry(url, options, retries - 1);
    }
    return response;
}

export interface IPFSUploadResult {
    cid: string;
    url: string;
}

/**
 * Upload a JSON metadata object to IPFS via Pinata.
 */
export async function uploadJSONToIPFS(data: object, name: string): Promise<IPFSUploadResult> {
    // Pinata requires pinataContent to be a valid JSON object
    // Ensure data is a plain object, not a string or other type
    const pinataContent = typeof data === 'object' && data !== null ? data : { content: data };
    
    const body = JSON.stringify({
        pinataContent,
        pinataMetadata: {
            name: name || 'idea-metadata.json',
        },
        pinataOptions: {
            cidVersion: 0,
        },
    });

    // Use JWT if available, otherwise fall back to API key/secret
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
        headers['pinata_api_key'] = PINATA_API_KEY;
        headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await fetchWithRetry('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers,
        body,
    });

    if (!response.ok) {
        let errorText: string;
        if (response.status === 429) {
            errorText = 'Too many requests (rate limited). Please wait a minute and try again.';
        } else {
            try {
                const errorJson = await response.json();
                errorText = JSON.stringify(errorJson);
            } catch {
                errorText = await response.text();
            }
            errorText = `Pinata upload failed: ${errorText}`;
        }
        throw new Error(errorText);
    }

    const result = (await response.json()) as { IpfsHash: string };
    return {
        cid: result.IpfsHash,
        url: `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`,
    };
}

/**
 * Upload a file buffer to IPFS via Pinata.
 * Uses form.getBuffer() so Node fetch sends a valid multipart body (form-data stream is not handled correctly by fetch).
 */
export async function uploadFileToIPFS(
    buffer: Buffer,
    filename: string,
): Promise<IPFSUploadResult> {
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    // Pinata expects the file field first; use a Blob-like object for Node fetch compatibility
    form.append('file', buffer, { filename: filename || 'uploaded-file' });
    form.append('pinataMetadata', JSON.stringify({
        name: filename || 'uploaded-file',
    }));
    form.append('pinataOptions', JSON.stringify({
        cidVersion: 0,
    }));

    // Send as buffer so fetch gets correct multipart body (stream from form-data can break with Node fetch)
    const bodyBuffer = form.getBuffer();

    const headers: Record<string, string> = {
        ...form.getHeaders(),
    };

    if (PINATA_JWT) {
        headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
        headers['pinata_api_key'] = PINATA_API_KEY;
        headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
    }

    const response = await fetchWithRetry('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: bodyBuffer,
    });

    if (!response.ok) {
        let errorText: string;
        if (response.status === 429) {
            errorText = 'Too many requests (rate limited). Please wait a minute and try again.';
        } else {
            try {
                const errorJson = await response.json();
                errorText = JSON.stringify(errorJson);
            } catch {
                errorText = await response.text();
            }
            errorText = `Pinata upload failed: ${errorText}`;
        }
        throw new Error(errorText);
    }

    const result = (await response.json()) as { IpfsHash: string };
    return {
        cid: result.IpfsHash,
        url: `${PINATA_GATEWAY}/ipfs/${result.IpfsHash}`,
    };
}

export function getIPFSUrl(cid: string): string {
    return `${PINATA_GATEWAY}/ipfs/${cid}`;
}
