'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import { sdk } from '@farcaster/miniapp-sdk';

import { METADATA } from '~/lib/utils';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface MiniAppClient {
  platformType?: 'web' | 'mobile';
  clientFid: number;
  added: boolean;
  safeAreaInsets?: SafeAreaInsets;
  notificationDetails?: {
    url: string;
    token: string;
  };
}

interface MiniAppContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  location?: Record<string, unknown>;
  client: MiniAppClient;
}

type FrameContextType = {
  context: MiniAppContext | Record<string, unknown> | null;
  isInMiniApp: boolean;
} | null;

const FrameContext = createContext<FrameContextType>(null);

export const useFrameContext = () => useContext(FrameContext);

export default function FrameProvider({ children }: { children: ReactNode }) {
  const [frameContext, setFrameContext] = useState<FrameContextType>(null);
  const [isSplashHidden, setIsSplashHidden] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const context = await sdk.context;
        const isInMiniApp = await sdk.isInMiniApp();
        setFrameContext({ context, isInMiniApp });
        await sdk.actions.ready();
        setIsSplashHidden(true);
      } catch (error) {
        console.error('Failed to initialize miniapp context', error);
        setFrameContext({
          context: { error: 'Failed to initialize' },
          isInMiniApp: false,
        });
        setIsSplashHidden(true);
      }
    };

    void init();
  }, []);

  return (
    <FrameContext.Provider value={frameContext}>
      {!isSplashHidden && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: METADATA.splashBackgroundColor || '' }}
        >
          <Image
            src={METADATA.splashImageUrl}
            alt="FarPong Splash"
            width={200}
            height={200}
            priority
          />
        </div>
      )}
      {children}
    </FrameContext.Provider>
  );
}
