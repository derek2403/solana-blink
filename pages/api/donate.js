// pages/api/donate.js

import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "Content-Type": "application/json",
};

const LAMPORTS_PER_SOL = 1000000000;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    try {
      let account, amount;
      if (typeof req.body === 'string') {
        const body = JSON.parse(req.body);
        account = body.account;
        amount = body.amount || req.query.amount;
      } else if (req.body && req.body.account) {
        account = req.body.account;
        amount = req.body.amount || req.query.amount;
      } else {
        throw new Error('Account not provided in request body');
      }

      if (!account) {
        throw new Error('Account is undefined or null');
      }

      if (!amount) {
        throw new Error('Amount is undefined or null');
      }

      // Convert amount to lamports
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      // Create a connection to the Solana devnet
      const connection = new Connection('https://api.devnet.solana.com');

      // Create a new transaction
      const transaction = new Transaction();

      // Add a transfer instruction to the transaction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey('7BkxDHhDfMQ5MUhD6BLCnyMR4JUhvFScWWzupog2pZzP'), // Replace with the actual recipient's public key
          lamports: lamports
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
        message: `Donate ${amount} SOL`,
      };

      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: 'Failed to create transaction', details: error.message }));
    }
    return;
  }

  res.writeHead(405, CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Method Not Allowed' }));
}