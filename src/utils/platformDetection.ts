/**
 * Platform Detection Utility
 * Detects whether the app is running in Farcaster or Base context
 */

export type Platform = 'farcaster' | 'base' | 'unknown';

export interface PlatformInfo {
  platform: Platform;
  isFarcaster: boolean;
  isBase: boolean;
}

/**
 * Detects the current platform based on various signals
 * - Checks URL parameters
 * - Checks referrer
 * - Checks user agent
 * - Checks for Base-specific context
 */
export async function detectPlatform(): Promise<PlatformInfo> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      platform: 'unknown',
      isFarcaster: false,
      isBase: false,
    };
  }

  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const platformParam = urlParams.get('platform');

  if (platformParam === 'farcaster' || platformParam === 'fc') {
    return {
      platform: 'farcaster',
      isFarcaster: true,
      isBase: false,
    };
  }

  if (platformParam === 'base') {
    return {
      platform: 'base',
      isFarcaster: false,
      isBase: true,
    };
  }

  // Check referrer
  const referrer = document.referrer.toLowerCase();
  if (referrer.includes('Farcaster.com') || referrer.includes('farcaster')) {
    return {
      platform: 'farcaster',
      isFarcaster: true,
      isBase: false,
    };
  }

  if (referrer.includes('base.org') || referrer.includes('coinbase')) {
    return {
      platform: 'base',
      isFarcaster: false,
      isBase: true,
    };
  }

  // Check user agent for Farcaster-specific signals
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('farcaster') || userAgent.includes('Farcaster')) {
    return {
      platform: 'farcaster',
      isFarcaster: true,
      isBase: false,
    };
  }

  // Check for Farcaster SDK context
  try {
    const { sdk } = await import('@farcaster/miniapp-sdk');
    const isInMiniApp = await sdk.isInMiniApp();
    if (isInMiniApp) {
      return {
        platform: 'farcaster',
        isFarcaster: true,
        isBase: false,
      };
    }
  } catch (error) {
    console.debug('Farcaster miniapp SDK context unavailable', error);
  }

  // Check for Base-specific window properties
  if (typeof window !== 'undefined') {
    type BaseAwareProvider = {
      isBaseWallet?: boolean;
      isCoinbaseWallet?: boolean;
    };
    const baseAwareWindow = window as { ethereum?: unknown };
    const maybeProvider = baseAwareWindow.ethereum;
    if (
      typeof maybeProvider === 'object' &&
      maybeProvider !== null &&
      ('isBaseWallet' in maybeProvider || 'isCoinbaseWallet' in maybeProvider)
    ) {
      const provider = maybeProvider as BaseAwareProvider;
      if (provider.isBaseWallet || provider.isCoinbaseWallet) {
        return {
          platform: 'base',
          isFarcaster: false,
          isBase: true,
        };
      }
    }
  }

  // Default to unknown - will show both options
  return {
    platform: 'unknown',
    isFarcaster: false,
    isBase: false,
  };
}

/**
 * Get platform-specific configuration
 */
export function getPlatformConfig(platform: Platform): {
  name: string;
  color: string;
  gradient: string;
  hoverGradient: string;
  addToAppUrl: string;
  addToAppText: string;
} {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://live-hope-955.app.ohara.ai';
  if (platform === 'base') {
    return {
      name: 'Base',
      color: 'oklch(0.45 0.31 264.05 / 1)',
      gradient: 'from-[oklch(0.45 0.31 264.05 / 1)] to-[oklch(0.38 0.26 264.05 / 1)]',
      hoverGradient:
        'hover:from-[oklch(0.47 0.30 266.25 / 1)] hover:to-[oklch(0.45 0.31 264.05 / 1)]',
      addToAppUrl: 'https://base.org',
      addToAppText: 'Add MiniApp to BaseApp',
    };
  }
  return {
    name: 'Farcaster',
    color: 'oklch(0.59 0.17 297.31 / 1)',
    gradient: 'from-[oklch(0.59 0.17 297.31 / 1)] to-[oklch(0.54 0.17 296.76 / 1)]',
    hoverGradient:
      'hover:from-[oklch(0.65 0.16 297.89 / 1)] hover:to-[oklch(0.59 0.17 297.31 / 1)]',
    addToAppUrl: `https://farcaster.xyz/~/compose?embeds[]=${encodeURIComponent(origin)}`,
    addToAppText: 'Add MiniApp to Farcaster',
  };
}
