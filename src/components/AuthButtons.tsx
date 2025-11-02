'use client';

import type { Context } from '@farcaster/miniapp-core';
import { sdk } from '@farcaster/miniapp-sdk';
import clsx from 'clsx';
import Image from 'next/image';
import { JSX, useEffect, useState } from 'react';
import { AddMiniAppAction } from '~/components/actions/add-miniapp';
import type { User } from '~/types/game';
import type { Platform } from '~/utils/platformDetection';
import { detectPlatform } from '~/utils/platformDetection';

interface AuthButtonsProps {
  onUserAuthenticated: (user: User) => void;
}

export function AuthButtons({ onUserAuthenticated }: AuthButtonsProps): JSX.Element {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initPlatform = async (): Promise<void> => {
      const platformInfo = await detectPlatform();
      setPlatform(platformInfo.platform);
      // Don't auto-authenticate - let users see the menu first
    };
    initPlatform();
  }, []);

  const handleFarcasterAuth = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const isInMiniApp = await sdk.isInMiniApp();
      if (!isInMiniApp) {
        setError('Open in Warpcast/BaseApp');
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
      console.error(err);
      setError('Failed. Open in Warpcast/BaseApp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBaseAuth = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      // Check if wallet is available
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        setError('Please install a Web3 wallet to continue');
        setIsLoading(false);
        return;
      }

      // Request account access
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];

        // Create a user object from wallet address
        const user: User = {
          fid: parseInt(address.slice(2, 10), 16), // Generate numeric ID from address
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

  const handleAuth = async (): Promise<void> => {
    if (platform === 'base') {
      await handleBaseAuth();
    } else {
      await handleFarcasterAuth();
    }
  };

  // Get platform-specific configuration
  const logoUrl = '/1024x1024.png';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(138,99,210,0.16),rgba(6,5,11,0.96)_60%)] px-4 py-10">
      <div className="relative flex w-full max-w-[min(360px,90vw)] flex-col rounded-[36px] border border-white/8 bg-[#090812]/95 px-6 py-10 shadow-[0_35px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:px-8 sm:py-12 md:max-w-[min(420px,40vw)] md:min-h-[min(700px,85vh)]">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-linear-to-br from-(--gradient-brand-overlay-start) to-(--gradient-brand-overlay-end) animate-pulse pointer-events-none" />

        <div className="relative z-10">
          {/* Logo Section - Replaces heading and paragraph */}
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src={logoUrl}
                alt="FarPong Logo"
                width="120"
                height="120"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div className="h-1 w-32 mx-auto bg-linear-to-r from-(--gradient-brand-start) to-(--gradient-brand-end) rounded-full" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Farcaster Sign In Button */}
            <button
              onClick={handleFarcasterAuth}
              disabled={isLoading}
              className={clsx(
                'mx-auto flex w-[min(240px,40vw)] items-center justify-center gap-3 rounded-2xl border border-[rgba(138,99,210,0.45)] bg-[#11101c] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-(--gradient-brand-start) transition-all duration-200 hover:scale-105 hover:border-[rgba(138,99,210,0.95)] hover:text-(--gradient-brand-end) hover:shadow-[0_0_32px_rgba(138,99,210,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none active:scale-95 sm:text-[0.75rem]',
                platform === 'base' && 'hidden',
              )}
            >
              <Image
                className="h-5 w-5 shrink-0 object-contain"
                src="/far-square.png"
                alt="Farcaster logo"
                width={24}
                height={24}
              />
              <span>{isLoading ? 'Connecting...' : 'Sign In with Farcaster'}</span>
            </button>

            {/* Base Sign In Button */}
            <button
              onClick={handleBaseAuth}
              disabled={isLoading}
              className={clsx(
                'mx-auto flex w-[min(240px,40vw)] items-center justify-center gap-3 rounded-2xl border border-[rgba(40,120,255,0.45)] bg-[#101421] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-(--gradient-base-start) transition-all duration-200 hover:scale-105 hover:border-[rgba(40,120,255,0.95)] hover:text-(--gradient-base-hover-start) hover:shadow-[0_0_32px_rgba(40,120,255,0.6)] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none active:scale-95 sm:text-[0.75rem]',
                platform === 'farcaster' && 'hidden',
              )}
            >
              <Image
                className="h-5 w-5 shrink-0 object-contain"
                src="/base-square.png"
                alt="Base logo"
                width={24}
                height={24}
              />
              <span>{isLoading ? 'Connecting...' : 'Sign In with Base'}</span>
            </button>

            {/* Quick Play - Always available */}
            <button
              onClick={() =>
                onUserAuthenticated({ fid: 0, username: 'Guest', displayName: 'Guest Player' })
              }
              className="mx-auto flex w-[min(240px,40vw)] items-center justify-center gap-3 rounded-2xl border border-white/12 bg-[#121212] px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-gray-200 transition-all duration-200 hover:scale-105 hover:border-white/30 hover:text-white hover:shadow-[0_0_28px_rgba(148,163,184,0.35)] active:scale-95 sm:text-[0.75rem]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>Quick Play (Guest)</span>
            </button>

            {/* Add App Button - Works for both Farcaster and Base */}
            <AddMiniAppAction />
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6">
            <h3 className="mb-3 flex items-center justify-center gap-2 text-[0.6rem] font-semibold text-white sm:text-[0.7rem]">
              <span className="text-sm">🎮</span> How to Play
            </h3>
            <ul className="space-y-1 text-[0.55rem] text-gray-400 sm:text-[0.65rem]">
              <li className="flex items-start gap-2">
                <span className="text-(--gradient-brand-start) font-bold">•</span>
                <span>Sign in with Farcaster/BaseApp or as Guest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-(--gradient-brand-end) font-bold">•</span>
                <span>Choose Farcaster (left) or Base (right) side</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Survive and TRY to reach 100 points!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Don't let AI score 10 points!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">•</span>
                <span>Desktop: W/S or ↑/↓ keys</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 font-bold">•</span>
                <span>Mobile: Touch your side to move</span>
              </li>
            </ul>
          </div>
          <p className="mt-6 text-center text-[0.5rem] font-medium text-gray-600 sm:text-[0.6rem]">
            Built with ❤️ on Farcaster + Base
          </p>
        </div>
      </div>
    </div>
  );
}
