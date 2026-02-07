'use client';

import { useEffect } from 'react';

type AdSenseProps = {
    adSlot: string;
    adFormat?: 'auto' | 'fluid' | 'rectangle';
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
};

export default function AdSense({ adSlot, adFormat = 'auto', fullWidthResponsive = true, style }: AdSenseProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense Error:', err);
        }
    }, []);

    return (
        <div style={{ margin: '1rem 0', textAlign: 'center', overflow: 'hidden', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-6875423596783144"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            ></ins>
        </div>
    );
}
