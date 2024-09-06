
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
    const payload = {
  "icon": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVFDIzi21sJX465lUyZGzE-0JB42J0mgisxg&s",
  "label": "exclusive nft",
  "title": "ultimate chef's cooker",
  "description": "own this unique digital artwork that celebrates the art of cooking. perfect for culinary enthusiasts and nft collectors alike.",
  "links": {
    "actions": [
      {
        "label": "purchase now",
        "href": "/api/signTransaction"
      }
    ]
  }
};

    res.writeHead(200, ACTIONS_CORS_HEADERS);
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(405, ACTIONS_CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}
    