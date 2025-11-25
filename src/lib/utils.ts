import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const METADATA = {
  name: 'FarPong',
  iconImageUrl: '/1024x1024.png',
  splashImageUrl: '/200x200.png',
  splashBackgroundColor: '#0C0C0D',
  homeUrl: process.env.NEXT_PUBLIC_URL ?? '',
  webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL ?? '',
  subtitle: 'Retro Nostalgia',
  description: 'Experience Retro Pong Themed Gaming Farcaster Style',
  screenshotUrls: ['/screen1.png', '/screen2.png', '/screen3.png'],
  bannerImageUrl: '/1200x630.png',
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
