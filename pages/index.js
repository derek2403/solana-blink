import React from 'react';
import { MultiBlink } from '../components/BlinkComponent';

export default function Home() {
    const actionUrls = [
        'https://dial.to/?action=solana-action:https://bonkbets.dial.to/ravens-vs-chiefs',
        'https://dial.to/?action=solana-action:https://mint.solanaringers.art',
        'https://dial.to/?action=solana-action:https://blink.sunrisestake.com/api/actions/stake',
        'https://dial.to/?action=solana-action:https://api.mimirlab.xyz/v1/actions/',
        'https://dial.to/?action=solana-action:https://tug-of-war.magicblock.app/api/v1/tug/item/DN4PPQ6MxAEy9sfrPRcrrxyoW8S2m5kX3NGfzrN3YMdQ',
        'https://dial.to/?action=solana-action:https://www.dewicats.xyz/api/auction-blink',
        'https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Ftiplink.io%2Fapi%2Fblinks%2Fdonate%3Fdest%3D8QNrVY8L6bRRNCGMtBeACSDFh9bBd1R6mMp2tkdBCqYK'



    ];

    return (
        <div>
            <MultiBlink actionUrls={actionUrls} />
        </div>
    );
}