// pages/api/mintNFT.js

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import * as fs from "fs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "Content-Type": "application/json",
};

const QUICKNODE_RPC = "https://fluent-stylish-water.solana-devnet.quiknode.pro/cde053b2f5cd11bced384c7db1d4b72ea48571c0";
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC, "confirmed");

async function uploadMetadata(metaplex, nftData) {
  console.log("Uploading metadata");
  const buffer = fs.readFileSync("public/" + nftData.imageFile);
  const file = toMetaplexFile(buffer, nftData.imageFile);

  const imageUri = await metaplex.storage().upload(file);
  console.log("Image URI:", imageUri);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("Metadata URI:", uri);
  return uri;
}

async function createNft(metaplex, uri, nftData) {
  console.log("Creating NFT");
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
    },
    { commitment: "finalized" }
  );

  console.log(`Minted Token: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
  return nft;
}

export default async function handler(req, res) {
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
        account = body.account;
      } else {
        throw new Error('Account not provided in request body');
      }

      if (!account) {
        throw new Error('Account is undefined or null');
      }

      const WALLET = new PublicKey(account);

      const metaplex = Metaplex.make(SOLANA_CONNECTION)
        .use(keypairIdentity(Keypair.generate())) // Use a temporary keypair for the server
        .use(
          bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: QUICKNODE_RPC,
            timeout: 60000,
          })
        );

      // Individual NFT Data
      const nftData = {
        name: "My Blink NFT",
        symbol: "BNFT",
        description: "This is my Blink NFT",
        sellerFeeBasisPoints: 500,
        imageFile: "nft.png",
      };

      // Upload and create individual NFT
      const nftUri = await uploadMetadata(metaplex, nftData);
      const nft = await createNft(metaplex, nftUri, nftData);

      // Create a transaction for the client to sign
      const transaction = await metaplex.nfts().builders().mint({
        nftOrSft: nft,
        toOwner: WALLET,
      });

      const serializedTransaction = transaction.serialize({ requireAllSignatures: false });
      const base64Transaction = serializedTransaction.toString('base64');

      const response = {
        transaction: base64Transaction,
        message: "NFT ready to be minted",
      };

      res.writeHead(200, CORS_HEADERS);
      res.end(JSON.stringify(response));
    } catch (error) {
      console.error('Error preparing NFT minting:', error);
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: 'Failed to prepare NFT minting', details: error.message }));
    }
  } else {
    res.writeHead(405, CORS_HEADERS);
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
}