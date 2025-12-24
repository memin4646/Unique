import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Unique Drive-In Cinema',
        short_name: 'Unique',
        description: 'Lüks arabalı sinema deneyimi.',
        start_url: '/',
        display: 'standalone',
        background_color:= '#000000',
        theme_color: '#d4af37',
        orientation: 'portrait',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
    };
}
