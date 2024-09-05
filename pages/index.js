import '@dialectlabs/blinks/index.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Action, Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";

export default function Home() {
    const { publicKey, connected } = useWallet();
    const walletAddress = connected && publicKey ? publicKey.toBase58() : 'Not connected';

    const actionApiUrl = 'http://localhost:3000/api/actions/buyNFT';

    const { adapter } = useActionSolanaWalletAdapter('https://api.devnet.solana.com');
    const { action, error } = useAction({ url: actionApiUrl, adapter });

    useEffect(() => {
        console.log('Action:', action);
        console.log('Action error:', error);

        if (action) {
            console.log('Action title:', action.title);
            console.log('Action description:', action.description);
            console.log('Action links:', action.links);
        }

        // Manually fetch the action to see what's being returned
        fetch(actionApiUrl)
            .then(response => response.json())
            .then(data => console.log('API response:', data))
            .catch(error => console.error('API fetch error:', error));
    }, [action, error, actionApiUrl]);

    return (
        <div>
            <WalletMultiButton />
            <p>Connected: {connected.toString()}</p>
            <p>Wallet Address: {walletAddress}</p>
            {error && <p>Error: {error.message}</p>}
            {action ? (
                <div style={{ width: '500px', height: '200px' }}>
                    <Blink
                        action={action}
                        websiteText={new URL(actionApiUrl).hostname}
                        stylePreset="x-light"
                    />
                </div>
            ) : (
                <p>Loading Blink...</p>
            )}
        </div>
    );
}