import React, { useRef, useEffect, useState } from 'react';
import '@dialectlabs/blinks/index.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Blink, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";

const BlinkPane = ({ url }) => {
    const { adapter } = useActionSolanaWalletAdapter('https://api.devnet.solana.com');
    const { action, error } = useAction({ url, adapter });
    const ref = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (ref.current) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    setDimensions({ width, height });
                }
            });

            resizeObserver.observe(ref.current);

            return () => {
                resizeObserver.disconnect();
            };
        }
    }, []);

    if (error) return <p>Error: {error.message}</p>;
    if (!action) return <p>Loading Blink...</p>;

    const style = {
        width: '100%',
        height: '100%',
        maxWidth: dimensions.width > 300 ? '300px' : 'none',
        maxHeight: dimensions.height > 550 ? '550px' : 'none',
    };

    return (
        <div ref={ref} style={style}>
            <Blink
                action={action}
                websiteText={new URL(url).hostname}
                stylePreset="x-light"
            />
        </div>
    );
};

export const MultiBlink = ({ actionUrls }) => {
    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px'
            }}>
                {actionUrls.slice(0, 8).map((url, index) => (
                    <BlinkPane key={index} url={url} />
                ))}
            </div>
        </div>
    );
};