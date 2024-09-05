import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';

export default function ConnectWalletButton({ setWalletAddress }) {
    const { publicKey, connected } = useWallet();
    const walletAddress = connected && publicKey ? publicKey.toBase58() : 'Not connected';

    useEffect(() => {
        if (connected && walletAddress !== 'Not connected') {
            setWalletAddress(walletAddress); // Update the parent component's state with wallet address

            // Optional: Make a request to the API to create the folder (as you had previously)
            fetch(`/api/create-folder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletAddress }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data.message);
                })
                .catch((error) => {
                    console.error('Error creating folder:', error);
                });
        }
    }, [connected, walletAddress]);

    return (
        <div>
            <WalletMultiButton />
            <p>Connected: {connected.toString()}</p>
            <p>Wallet Address: {walletAddress}</p>
        </div>
    );
}
