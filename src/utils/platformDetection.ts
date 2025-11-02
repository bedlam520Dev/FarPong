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
  if (referrer.includes('warpcast.com') || referrer.includes('farcaster')) {
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
  if (userAgent.includes('farcaster') || userAgent.includes('warpcast')) {
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
    // SDK not available or not in mini app
  }

  // Check for Base-specific window properties
  if (typeof window !== 'undefined') {
    // Check if ethereum provider is Base
    const ethereum = (window as any).ethereum;
    if (ethereum?.isBaseWallet || ethereum?.isCoinbaseWallet) {
      return {
        platform: 'base',
        isFarcaster: false,
        isBase: true,
      };
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
      color: '#0000ff',
      gradient: 'from-[#0000ff] to-[#0000cc]',
      hoverGradient: 'hover:from-[#1a1aff] hover:to-[#0000ff]',
      addToAppUrl: 'https://base.org',
      addToAppText: 'Add MiniApp to BaseApp',
    };
  }
  return {
    name: 'Farcaster',
    color: '#8A63D2',
    gradient: 'from-[#8A63D2] to-[#7952C0]',
    hoverGradient: 'hover:from-[#9B74E3] hover:to-[#8A63D2]',
    addToAppUrl: `https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(origin)}`,
    addToAppText: 'Add MiniApp to Farcaster',
  };
}
