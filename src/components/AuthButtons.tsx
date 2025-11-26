'use client';

import type { Context } from '@farcaster/miniapp-core';
import { sdk } from '@farcaster/miniapp-sdk';
import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';

import { AddMiniAppAction } from '~/components/actions/add-miniapp';
import {
  BaseSignInButton,
  FarcasterSignInButton,
  GradientSmallButton,
} from '~/components/ui/brand-guideline-buttons';
import { Kbd, KbdGroup } from '~/components/ui/kbd';
import type { User } from '~/types/game';
import type { Platform } from '~/utils/platformDetection';
import { detectPlatform } from '~/utils/platformDetection';
import { LeaderboardModal } from './LeaderboardModal';

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isBaseWallet?: boolean;
  isCoinbaseWallet?: boolean;
};

const resolveEthereumProvider = (): EthereumProvider | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const maybeEthereum = (window as unknown as { [key: string]: unknown }).ethereum;
  if (
    maybeEthereum &&
    typeof maybeEthereum === 'object' &&
    'request' in maybeEthereum &&
    typeof (maybeEthereum as Record<string, unknown>).request === 'function'
  ) {
    return maybeEthereum as EthereumProvider;
  }

  return undefined;
};

interface AuthButtonsProps {
  onUserAuthenticated: (user: User) => void;
}

export function AuthButtons({ onUserAuthenticated }: AuthButtonsProps): JSX.Element {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const initPlatform = async (): Promise<void> => {
      const platformInfo = await detectPlatform();
      setPlatform(platformInfo.platform);
    };

    void initPlatform();
  }, []);

  const handleFarcasterAuth = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const isInMiniApp = await sdk.isInMiniApp();
      if (!isInMiniApp) {
        setError('Open in Farcaster/BaseApp');
        return;
      }

      let context: Context.MiniAppContext | undefined;
      try {
        context = await sdk.context;
      } catch (contextError) {
        console.error('Failed to fetch context:', contextError);
        setError('Auth failed');
        return;
      }

      const contextUser: Context.UserContext | undefined = context?.user;
      if (!contextUser) {
        setError('Auth failed');
        return;
      }

      const user: User = {
        fid: contextUser.fid,
        username: contextUser.username || `user${contextUser.fid}`,
        displayName: contextUser.displayName || contextUser.username || `User ${contextUser.fid}`,
        pfpUrl: contextUser.pfpUrl,
      };

      onUserAuthenticated(user);
    } catch (err) {
      console.error('Farcaster auth error:', err);
      setError('Failed. Open in Farcaster/BaseApp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBaseAuth = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const ethereum = resolveEthereumProvider();
      if (!ethereum) {
        setError('Please install a Web3 wallet to continue');
        return;
      }

      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[] | undefined;

      if (Array.isArray(accounts) && accounts.length > 0) {
        const address = accounts[0];
        const user: User = {
          fid: Number.parseInt(address.slice(2, 10), 16),
          username: `${address.slice(0, 6)}...${address.slice(-4)}`,
          displayName: `Base User ${address.slice(0, 6)}`,
          walletAddress: address,
        };

        onUserAuthenticated(user);
      }
    } catch (err) {
      console.error('Base auth error:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh min-w-dvw h-full w-full items-center bg-[oklch(0.1287_0.0078_268.54_/1)] px-4 py-4 text-white">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.59_0.17_297.31_/0.18),transparent_55%)]" />

      {/* main content */}
      <main className="relative z-10 flex w-full flex-col items-center justify-center">
        <div className="relative flex w-full flex-col items-center gap-2 text-center">
          <header className="flex flex-col items-center mb-1">
            <Image
              src={'https://farpong.vercel.app/1024x1024-tg.png'}
              alt="FarPong Logo"
              width={120}
              height={120}
              className="logo-shadow-blur logo-shadow-spread logo-shadow-opacity logo-shadow-color"
              priority
            />
            <p className="relative flex text-center font-arcade text-sm text-white/70">
              Retro Pong Style Gaming
            </p>
          </header>

          {error && (
            <div className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[0.7rem] text-red-200">
              {error}
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-1">
            {platform !== 'base' && (
              <FarcasterSignInButton
                onClick={() => {
                  void handleFarcasterAuth();
                }}
                disabled={isLoading}
              />
            )}
            {platform !== 'farcaster' && (
              <BaseSignInButton
                onClick={() => {
                  void handleBaseAuth();
                }}
                disabled={isLoading}
              />
            )}

            <div className="flex flex-col flex-wrap items-center justify-center my-2 gap-2">
              <GradientSmallButton
                label="Play as Guest"
                icon="play"
                onClick={() =>
                  onUserAuthenticated({ fid: 0, username: 'Guest', displayName: 'Guest Player' })
                }
              />
              <AddMiniAppAction />
              <GradientSmallButton
                label="Leaderboard"
                icon="menu"
                onClick={() => setShowLeaderboard(true)}
              />
            </div>
          </div>

          <section
            className="relative flex w-full flex-col items-center rounded-xl border border-white/5 bg-white/5 px-1 py-2 text-[clamp(0.6rem,1.2vw,0.8rem)] text-white/70"
            style={{ maxHeight: 'fit-content' }}
          >
            <h3 className="mb-1 flex items-center justify-center gap-2 text-[clamp(0.7rem,1.5vw,1rem)] font-semibold uppercase tracking-[0.2em] text-white/80">
              <span>🎮</span> How To Play
            </h3>
            <ul className="space-y-1 text-[clamp(0.55rem,1vw,0.8rem)] overflow-y-auto">
              <li>Sign in with Farcaster/Base or jump in as guest.</li>
              <li>Pick your side (Farcaster left / Base right).</li>
              <li>Survive to 100 points — AI wins after 10.</li>
              <li className="flex flex-wrap items-center justify-center gap-1">
                <span>Desktop:</span>
                <KbdGroup>
                  <Kbd>W</Kbd>
                  <Kbd>S</Kbd>
                </KbdGroup>
                <span className="text-white/40">or</span>
                <KbdGroup>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                </KbdGroup>
              </li>
              <li>Mobile: tap or drag on your side of the screen.</li>
            </ul>
          </section>
        </div>
      </main>
      <div className="relative z-10 mt-2 flex flex-row">
        <footer className="flex w-full flex-col items-center justify-center px-1 text-center">
          <p className="relative flex flex-inline align-items-middle justify-center justify-self-auto gap-2 font-arcade text-[clamp(0.5rem,1.2vw,0.8rem)] text-white/50 text-center">
            Built with{' '}
            <span className="relative flex flex-inline w-3 h-[12h-3] overflow-hidden contain-content">
              <Image src="/heart.svg" alt="Farcaster" width={12} height={12} />
            </span>
            on{' '}
            <span className="relative flex flex-inline w-3 h-[12h-3] overflow-hidden contain-content">
              <Image src="/far-square.svg" alt="Farcaster" width={12} height={12} />
            </span>
            &{' '}
            <span className="relative flex flex-inline mb-1 w-3 h-[12h-3] overflow-hidden contain-content">
              <Image src="/base-square.svg" alt="BaseApp" width={12} height={12} />
            </span>
          </p>
        </footer>
      </div>
      <LeaderboardModal open={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </div>
  );
}
