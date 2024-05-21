import { VercelRequest, VercelResponse } from '@vercel/node';
import { readdir } from 'fs/promises';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    const directoryPath = join(__dirname, '..', 'quotes');
    const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}/api/download`;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    try {
        const files = await readdir(directoryPath);
        const fileUrls = files.map(file => ({
            name: file,
            url: `${baseUrl}?file=${encodeURIComponent(file)}`
        }));
        res.status(200).json({ files: fileUrls });
    } catch (error) {
        res.status(500).json({ error: 'Unable to read directory' });
    }
}
