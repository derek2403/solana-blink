import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: "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",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prompt, walletAddress } = req.body;

  if (!prompt || !walletAddress) {
    console.error('Prompt or Wallet Address is missing:', { prompt, walletAddress }); // Log the issue
    return res.status(400).json({ message: 'Prompt and wallet address are required' });
  }

  try {
    // Call the OpenAI API to extract payload information
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Extract the following from the user's request to create an NFT: label, title, description, and button label. If incomplete info given, just generate relevant information to the payload." 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });

    const result = completion.choices[0].message.content.trim();
    console.log('OpenAI Response:', result);

    // Parse the result
    let extractedPayload;
    try {
      extractedPayload = JSON.parse(result);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return res.status(500).json({ message: 'Error parsing AI response' });
    }

    const payload = {
      icon: "a", // User will upload an image URL later
      label: extractedPayload.label || 'Default Label',
      title: extractedPayload.title || 'Default Title',
      description: extractedPayload.description || 'Default Description',
      links: {
        actions: [
          {
            label: extractedPayload.buttonLabel || 'Default Button Label',
            href: "/api/signTransaction",
          }
        ]
      }
    };

    // Create the user's directory if it doesn't exist
    const folderPath = path.join(process.cwd(), 'pages/api/actions', walletAddress);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Write the payload to a new `buyNFT.js` file
    const filePath = path.join(folderPath, 'buyNFT.js');
    const fileContent = `
import { ActionGetResponse } from "@solana/actions";

const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": 
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "Content-Type": "application/json",
};

export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, ACTIONS_CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const payload = ${JSON.stringify(payload, null, 2)};

    res.writeHead(200, ACTIONS_CORS_HEADERS);
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(405, ACTIONS_CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
    `;

    fs.writeFileSync(filePath, fileContent);

    res.status(200).json({ message: 'NFT creation payload has been saved successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while extracting the payload', error: error.message });
  }
}
