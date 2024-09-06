// pages/api/actions/buy-nft.js

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
        icon: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgz9hadyYQ1Y4Q_EKLx0nmtFXzcPWEAPpdBKGvHhsZAzh9d6FxSGOkuiBOu5zjYSoi3QX0a4HiHyvj0AHt5SCBK-1Er2Rh5Hx-vRU_o1QS75VFZwrn6LxggT2M3Cy0RrDFgBwUKK0ghfeCJ-AOydta-hoAOL15iVKlJ70GurI1AO7dBEuOP7tfSVJo2WlZ8/s320/blink.png",
        label: "b",
        title: "c",
        description: "Cybersecurity Enthusiast | Support my research with a donation.",
      links: {
        actions: [
          {
            label: "e",
            href: "/api/donate",
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