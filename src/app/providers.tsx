'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import FrameProvider from '~/components/providers/FrameProvider';
import { ThemeProvider } from '~/components/providers/theme-provider';

const WagmiProvider = dynamic(() => import('~/components/providers/WagmiProvider'), {
  ssr: false,
});

const ErudaProvider = dynamic(() => import('~/components/providers/ErudaProvider'), {
  ssr: false,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="new-york" enableSystem disableTransitionOnChange>
      <WagmiProvider>
        <FrameProvider>
          <ErudaProvider />
          {children}
        </FrameProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
