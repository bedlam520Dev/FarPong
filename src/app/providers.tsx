'use client';

import dynamic from 'next/dynamic';

import { ThemeProvider } from '~/components/providers/theme-provider';

import FrameProvider from '~/components/providers/FrameProvider';

const WagmiProvider = dynamic(() => import('~/components/providers/WagmiProvider'), {
  ssr: false,
});

const ErudaProvider = dynamic(() => import('~/components/providers/ErudaProvider'), {
  ssr: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="New York" enableSystem disableTransitionOnChange>
      <WagmiProvider>
        <FrameProvider>
          <ErudaProvider />
          {children}
        </FrameProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
