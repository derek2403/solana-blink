import { useState } from 'react';
import ChatBox from '../components/ChatBox';
import ConnectWalletButton from '../components/ConnectWalletButton';

export default function NFTCreator() {
    const [walletAddress, setWalletAddress] = useState('');

    return (
        <div>
            <ConnectWalletButton setWalletAddress={setWalletAddress} />
            <ChatBox walletAddress={walletAddress} />
        </div>
    );
}
