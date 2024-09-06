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
          content: "Extract the following from the user's request to create an NFT: label, title, description, and button label. If incomplete info is given, generate relevant information to the payload. No need to have any text decorations in your response. The button label is always Sign to show your support for this petition." 
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
  const [key, ...valueParts] = line.split(':');
  const value = valueParts.join(':').trim(); // Rejoin in case the value itself contains colons
  const cleanedKey = key.replace(/\*\*/g, '').trim().toLowerCase();
  
  if (cleanedKey === 'label') {
    extractedPayload.label = value;
  } else if (cleanedKey === 'title') {
    extractedPayload.title = value;
  } else if (cleanedKey === 'description') {
    extractedPayload.description = value;
  } else if (cleanedKey === 'button label') {
    extractedPayload.buttonLabel = value;
  }
});
    
    // Validate that the extracted data is not empty
    if (!extractedPayload.label || !extractedPayload.title || !extractedPayload.description || !extractedPayload.buttonLabel) {
      throw new Error('AI response did not generate the expected payload fields.');
    }

    const payload = {
      icon: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgz9hadyYQ1Y4Q_EKLx0nmtFXzcPWEAPpdBKGvHhsZAzh9d6FxSGOkuiBOu5zjYSoi3QX0a4HiHyvj0AHt5SCBK-1Er2Rh5Hx-vRU_o1QS75VFZwrn6LxggT2M3Cy0RrDFgBwUKK0ghfeCJ-AOydta-hoAOL15iVKlJ70GurI1AO7dBEuOP7tfSVJo2WlZ8/s320/blink.png", // Placeholder for an image URL
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

    // Amend the /public/action.js file
    const actionFilePath = path.join(process.cwd(), 'public', 'actions.json');
    let actionFileContent = {};

    if (fs.existsSync(actionFilePath)) {
      const existingContent = fs.readFileSync(actionFilePath, 'utf8');
      try {
        actionFileContent = JSON.parse(existingContent);
      } catch (error) {
        console.error('Error parsing existing action.js:', error);
      }
    }

    if (!actionFileContent.rules) {
      actionFileContent.rules = [];
    }

    // Add the new rule
    actionFileContent.rules.push({
      "pathPattern": `/api/actions/${walletAddress}/buyNFT`,
      "apiPath": `/api/actions/${walletAddress}/buyNFT`
    });

    // Write the updated content back to action.js
    fs.writeFileSync(actionFilePath, JSON.stringify(actionFileContent, null, 2));

    res.status(200).json({ message: 'NFT creation payload has been saved successfully and action.js has been updated!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while processing the request', error: error.message });
  }
}