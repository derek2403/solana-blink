import { useWallet } from '@solana/wallet-adapter-react';
import ConnectWalletButton from '../components/ConnectWalletButton';
import ChatBox from '../components/ChatBox';

export default function Test() {
    const { publicKey, connected } = useWallet();
    const walletAddress = connected && publicKey ? publicKey.toBase58() : '';

    return (
        <div>
            <ConnectWalletButton />
            {connected && <ChatBox walletAddress={walletAddress} />}
        </div>
    );
}