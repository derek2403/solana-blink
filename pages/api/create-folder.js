import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ message: 'Wallet address is required' });
        }

        // Define the directory where the wallet folder should be created
        const folderPath = path.join(process.cwd(), 'pages/api/actions', walletAddress);

        // Check if the folder already exists
        if (!fs.existsSync(folderPath)) {
            // Create the folder if it doesn't exist
            fs.mkdirSync(folderPath, { recursive: true });
            return res.status(200).json({ message: `Folder created for wallet ${walletAddress}` });
        } else {
            return res.status(200).json({ message: `Folder already exists for wallet ${walletAddress}` });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
