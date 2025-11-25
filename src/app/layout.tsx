import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { MartianMono, PressStart2P, Roboto } from '~/lib/fonts';
import { METADATA } from '~/lib/utils';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: METADATA.name,
  openGraph: {
    title: METADATA.name,
    description: METADATA.description,
    images: [METADATA.bannerImageUrl],
    url: METADATA.homeUrl,
    siteName: METADATA.name,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'contain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const noFouc = `
    (function() {
      try {
        var pref = localStorage.getItem('theme') || 'system';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var useLight = (pref === 'light') || (pref === 'system' && !prefersDark);
        var root = document.documentElement;
        if (useLight) {
          root.classList.add('theme-light');
          root.style.colorScheme = 'light';
        } else {
          root.classList.remove('theme-light');
          root.style.colorScheme = 'dark';
        }
      } catch(_) {}
    })();
  `;

  return (
    <html
      lang="en"
      className={`h-full ${PressStart2P.variable} ${MartianMono.variable} ${Roboto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFouc }} />
      </head>
      <body className="flex h-full w-full overflow-hidden antialiased">
        <Providers>
          <div className="flex h-full w-full flex-1 items-stretch justify-center overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
