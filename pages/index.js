import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export default function Home() {
    const { publicKey, connected } = useWallet();

    const walletAddress = connected && publicKey ? publicKey.toBase58() : 'Not connected';

    return (
        <div>
            <WalletMultiButton />
            <p>Connected: {connected.toString()}</p>
            <p>Wallet Address: {walletAddress}</p>
        </div>
    );
}
