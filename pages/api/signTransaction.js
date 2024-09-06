// pages/api/signTransaction.js

import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "Content-Type": "application/json",
};

export default async function handler(req, res) {
  console.log('Received request method:', req.method);
  console.log('Received headers:', req.headers);
  console.log('Received body:', req.body);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    try {
      let account;
      if (typeof req.body === 'string') {
        const body = JSON.parse(req.body);
        account = body.account;
      } else if (req.body && req.body.account) {
        account = req.body.account;
      } else {
        throw new Error('Account not provided in request body');
      }

      console.log('Parsed account:', account);

      if (!account) {
        throw new Error('Account is undefined or null');
      }

      // Create a connection to the Solana devnet
      const connection = new Connection('https://api.devnet.solana.com');

      // Create a new transaction
      const transaction = new Transaction();

      // Add a simple instruction to the transaction (e.g., sending 0.01 SOL to a random address)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey('7BkxDHhDfMQ5MUhD6BLCnyMR4JUhvFScWWzupog2pZzP'),
          lamports: 10000000 // 0.01 SOL
        })
      );

      // Get a recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(account);

      // Serialize the transaction
      const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
      const base64Transaction = serializedTransaction.toString('base64');

      const response = {
        transaction: base64Transaction,
        message: blockhash,
      };

      console.log('Response:', response);

      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: 'Failed to create transaction', details: error.message, stack: error.stack }));
    }
    return;
  }

  res.writeHead(405, CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}