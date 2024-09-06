import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_API_URL // Ensure this is the correct environment variable name
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { prompt, walletAddress } = req.body;

  console.log('Request Body:', { prompt, walletAddress }); // Debugging

  if (!prompt || !walletAddress) {
    console.error('Prompt or Wallet Address is missing:', { prompt, walletAddress });
    return res.status(400).json({ message: 'Prompt and wallet address are required' });
  }

  try {
    // Call the OpenAI API to extract payload information
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Extract the following from the user's request to create an NFT: label, title, description, and button label. If incomplete info is given, generate relevant information to the payload. No need to have any text decorations in your response." 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No choices returned from OpenAI');
    }

    const result = completion.choices[0].message.content.trim();
    console.log('OpenAI Response:', result);

    // Directly extract the result without default values
    const extractedPayload = {
      label: '',
      title: '',
      description: '',
      buttonLabel: ''
    };

    // Parse the result, handling cases where fields might have bold formatting (**)
    const lines = result.split('\n');
    lines.forEach(line => {
      const cleanedLine = line.replace(/\*\*/g, '').trim().toLowerCase(); // Convert to lowercase for comparison
      
      if (cleanedLine.startsWith('label:')) {
        extractedPayload.label = cleanedLine.replace('label:', '').trim();
      } else if (cleanedLine.startsWith('title:')) {
        extractedPayload.title = cleanedLine.replace('title:', '').trim();
      } else if (cleanedLine.startsWith('description:')) {
        extractedPayload.description = cleanedLine.replace('description:', '').trim();
      } else if (cleanedLine.startsWith('button label:')) {
        extractedPayload.buttonLabel = cleanedLine.replace('button label:', '').trim();
      }
    });
    

    // Validate that the extracted data is not empty
    if (!extractedPayload.label || !extractedPayload.title || !extractedPayload.description || !extractedPayload.buttonLabel) {
      throw new Error('AI response did not generate the expected payload fields.');
    }

    const payload = {
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVFDIzi21sJX465lUyZGzE-0JB42J0mgisxg&s", // Placeholder for an image URL
      label: extractedPayload.label,
      title: extractedPayload.title,
      description: extractedPayload.description,
      links: {
        actions: [
          {
            label: extractedPayload.buttonLabel,
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
