import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FarPong MiniApp',
    short_name: 'FarPong',
    description: 'Experience Retro Pong Themed Gaming Farcaster Style',
    start_url: '/',
    display: 'standalone',
    background_color: '#0C0C0D',
    theme_color: '#6A3CFF',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
