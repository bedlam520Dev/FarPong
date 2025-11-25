import clsx from 'clsx';
import Image from 'next/image';
import { useId, type JSX } from 'react';

import { FARBASE_SPECTRUM } from '~/lib/ctaStyles';

type Clickable = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
};

const BASE_WIDTH = 180;
const BASE_HEIGHT = 44;
const BASE_RADIUS = 6.857;
const SMALL_WIDTH = 120;
const SMALL_HEIGHT = 29.33;
const SMALL_RADIUS = 5.333;

const LARGE_BASE =
  'inline-flex items-center justify-center gap-[7px] border border-transparent px-[14px] py-[10px] text-[13.7px] ' +
  'transition-transform duration-150 hover:-translate-y-[1px] ' +
  'active:translate-y-0 active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ' +
  'disabled:pointer-events-none disabled:opacity-60';

const SMALL_BASE =
  'inline-flex items-center justify-center gap-[5px] border border-transparent px-[11px] py-[8px] text-[10px] ' +
  'transition-transform duration-150 hover:-translate-y-[1px] ' +
  'active:translate-y-0 active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ' +
  'disabled:pointer-events-none disabled:opacity-60';

const gradientTextStyle: React.CSSProperties = {
  backgroundImage: FARBASE_SPECTRUM,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
};

const shadowBig = { boxShadow: '0px 0px 11px 2px oklch(0.62 0.12 230.75 / 0.55)' };
const shadowSmall = { boxShadow: '0px 0px 9px 2px oklch(0.62 0.12 230.75 / 0.55)' };

const gradientStops = [
  { offset: '0%', color: 'oklch(0.53 0.29 293.94 / 1)' },
  { offset: '40%', color: 'oklch(0.61 0.24 294.53 / 1)' },
  { offset: '60%', color: 'oklch(0.63 0.20 269.87 / 1)' },
  { offset: '100%', color: 'oklch(0.49 0.23 262.5 / 1)' },
];

type IconType = 'play' | 'plus' | 'controls' | 'pause' | 'restart' | 'menu' | 'close';
type InlineIconType = Extract<IconType, 'menu' | 'close'>;

type IconAsset = { src: string; width: number; height: number; alt: string };

const iconAssets: Partial<Record<IconType, IconAsset>> = {
  play: { src: '/icon.svg', width: 12, height: 15, alt: 'Play icon' },
  plus: { src: '/icon1.svg', width: 14, height: 14, alt: 'Add icon' },
  pause: { src: '/Icon2.svg', width: 12, height: 12, alt: 'Pause icon' },
  restart: { src: '/Icon3.svg', width: 12, height: 10, alt: 'Restart icon' },
  controls: { src: '/Icon4.svg', width: 12, height: 12, alt: 'Controls icon' },
};

const inlineIconPaths: Record<InlineIconType, JSX.Element> = {
  menu: (
    <>
      <rect x="2" y="3" width="12" height="2" rx="1" />
      <rect x="2" y="7" width="12" height="2" rx="1" />
      <rect x="2" y="11" width="12" height="2" rx="1" />
    </>
  ),
  close: (
    <>
      <path d="M3 3L13 13" strokeWidth={2} strokeLinecap="round" />
      <path d="M13 3L3 13" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
};

function GradientSvgIcon({ type }: { type: IconType }) {
  const gradientId = useId().replace(/[:]/g, '');

  const asset = iconAssets[type];
  if (asset) {
    return (
      <Image
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        className="select-none"
      />
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientStops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      <g fill={`url(#${gradientId})`} stroke={`url(#${gradientId})`}>
        {inlineIconPaths[type as InlineIconType]}
      </g>
    </svg>
  );
}

const GradientLabel = ({ children, className }: { children: string; className?: string }) => (
  <span
    className={clsx(
      'font-semibold tracking-[0.04em] text-transparent leading-none normal-case',
      className,
    )}
    style={{
      ...gradientTextStyle,
      textShadow: '0px 0px 15px 6px oklch(0 0 0 / 0.9)',
    }}
  >
    {children}
  </span>
);

export function GradientActionButton({
  label,
  icon = 'play',
  className,
  ...props
}: Clickable & { label: string; icon?: IconType }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(LARGE_BASE, 'bg-[oklch(0.28_0.01_255.57_/1)]', className)}
      style={{
        ...shadowBig,
        width: `${BASE_WIDTH}px`,
        minWidth: `${BASE_WIDTH}px`,
        height: `${BASE_HEIGHT}px`,
        borderRadius: `${BASE_RADIUS}px`,
      }}
    >
      <GradientSvgIcon type={icon} />
      <GradientLabel className="text-[13.7px] leading-[1.15]">{label}</GradientLabel>
    </button>
  );
}

export function GradientSmallButton({
  label,
  icon = 'controls',
  className,
  ...props
}: Clickable & { label: string; icon?: IconType }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(SMALL_BASE, 'bg-[oklch(0.28_0.01_255.57_/1)]', className)}
      style={{
        ...shadowSmall,
        width: `${SMALL_WIDTH}px`,
        minWidth: `${SMALL_WIDTH}px`,
        height: `${SMALL_HEIGHT}px`,
        borderRadius: `${SMALL_RADIUS}px`,
      }}
    >
      <GradientSvgIcon type={icon} />
      <GradientLabel className="text-[10px] tracking-[0.08em] leading-[1.1]">{label}</GradientLabel>
    </button>
  );
}

export function BaseSignInButton({ className, ...props }: Clickable) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'flex items-center gap-[7px] border border-black/10 bg-white px-[18px] py-[7px] text-[13.7px] ' +
          'leading-none font-semibold text-black shadow-[0_5px_18px_oklch(0_0_0_/0.12)] ' +
          'transition-transform duration-150 hover:-translate-y-0.5 ' +
          'active:translate-y-0 active:scale-[0.98] ' +
          'disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap',
        className,
      )}
      style={{
        width: `${BASE_WIDTH}px`,
        minWidth: `${BASE_WIDTH}px`,
        height: `${BASE_HEIGHT}px`,
        borderRadius: `${BASE_RADIUS}px`,
      }}
    >
      <Image
        src="/base-square.svg"
        alt="Base icon"
        width={15}
        height={15}
        priority
        className="shrink-0"
      />
      <span className="normal-case tracking-[0.01em] leading-[1.15]">Sign in with Base</span>
    </button>
  );
}

export function FarcasterSignInButton({ className, ...props }: Clickable) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'flex items-center gap-[7px] border border-black/10 bg-white px-3 py-[7px] text-[12px] ' +
          'leading-none font-bold tracking-[0.015em] text-black shadow-[0_5px_18px_oklch(0_0_0_/0.12)] ' +
          'transition-transform duration-150 hover:-translate-y-0.5 ' +
          'active:translate-y-0 active:scale-[0.98] ' +
          'disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap mx-auto',
        className,
      )}
      style={{
        width: `${BASE_WIDTH}px`,
        minWidth: `${BASE_WIDTH}px`,
        height: `${BASE_HEIGHT}px`,
        borderRadius: `${BASE_RADIUS}px`,
      }}
    >
      <Image
        src="/far-square.svg"
        alt="Farcaster icon"
        width={15}
        height={15}
        priority
        className="shrink-0"
      />
      <span className="normal-case tracking-[0.015em] leading-[1.15] mr-2">
        Sign in with Farcaster
      </span>
    </button>
  );
}
