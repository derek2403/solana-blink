// pages/api/actions/donate.js

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
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVFDIzi21sJX465lUyZGzE-0JB42J0mgisxg&s",
      label: "Donate to Alice",
      title: "Donate to Alice",
      description: "Cybersecurity Enthusiast | Support my research with a donation.",
      links: {
        actions: [
          {
            label: "1 SOL",
            href: "../../donate?amount=1",
          },
          {
            label: "5 SOL",
            href: "../../donate?amount=5",
          },
          {
            label: "10 SOL",
            href: "../../donate?amount=10",
          },
          {
            "label": "Buy WIF", // button text
            "href": "../../donate?amount={amount}",
            "parameters": [
              {
                "name": "amount", // field name
                "label": "Enter a custom USD amount" // text input placeholder
              }
            ]
          }
        ]
      },
    };

    res.writeHead(200, ACTIONS_CORS_HEADERS);
    res.end(JSON.stringify(payload));
    return;
  }

  res.writeHead(405, ACTIONS_CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}