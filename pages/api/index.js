import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react'

export default function Home() {
   
    const { connected } = useWallet()

   

    return (
        <div>
          <p>{connected}</p>
        </div>
    );
}