import { VercelRequest, VercelResponse } from '@vercel/node';
import { createReadStream } from 'fs';
import { join } from 'path';

export default function handler(req: VercelRequest, res: VercelResponse): void {
    const { file } = req.query;
    const directoryPath = join(__dirname, '..', 'quotes');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (typeof file !== 'string') {
        res.status(400).json({ error: 'Invalid file parameter' });
        return;
    }

    const filePath = join(directoryPath, file);

    res.setHeader('Content-Disposition', `attachment; filename="${file}"`);
    createReadStream(filePath).pipe(res).on('error', () => {
        res.status(500).json({ error: 'Error reading file' });
    });
}
