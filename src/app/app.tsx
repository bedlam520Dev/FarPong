'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
// Import the Farcaster miniapp SDK. This SDK provides the `sdk.actions.ready()`
// call which informs the host when your mini‑app's UI has stabilized and is ready
// to be displayed. Passing `disableNativeGestures: true` here disables
// swipe‑to‑dismiss and other native gestures so they don't conflict with your
// application's own gestures.
import { sdk } from '@farcaster/miniapp-sdk';

const MiniApp = dynamic(() => import('~/components/MiniApp'), {
  ssr: false,
});

export default function App() {
  // Track a scale factor for the entire mini‑app. We measure the unscaled
  // dimensions of the wrapper div on mount and on resize, then compute a
  // scale factor so the app fits within the current viewport without
  // introducing scrollbars. If the app fits naturally, the scale remains 1.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Compute the scale based on the current viewport size and the
  // untransformed size of the wrapper. We listen to resize events to
  // recompute whenever the device orientation or window size changes.
  useEffect(() => {
    const computeScale = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      // offsetHeight/offsetWidth return the intrinsic size of the element
      // unaffected by CSS transforms. This allows us to determine how
      // large the mini‑app wants to be before scaling.
      const height = wrapper.offsetHeight;
      const width = wrapper.offsetWidth;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      // Compute scale factors for height and width, ensuring we never
      // scale up beyond 1. Use the smaller factor to preserve aspect ratio.
      const heightScale = height > 0 ? viewportHeight / height : 1;
      const widthScale = width > 0 ? viewportWidth / width : 1;
      const s = Math.min(heightScale, widthScale, 1);
      setScale(s);
    };
    // Use requestAnimationFrame to ensure measurements occur after
    // the first paint, avoiding a flash of unscaled content.
    const raf = requestAnimationFrame(computeScale);
    window.addEventListener('resize', computeScale);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', computeScale);
    };
  }, []);

  // Call sdk.actions.ready once when the component mounts. The host will
  // continue to display the splash screen until this promise resolves.
  useEffect(() => {
    const notifyReady = async () => {
      try {
        // Tell the Farcaster host that the mini app is ready and disable
        // native gestures to prevent conflicts with in‑app gestures. If the
        // SDK isn't loaded or the call fails, log the error but continue.
        await sdk.actions.ready({ disableNativeGestures: true });
      } catch (err) {
        console.error('Error calling sdk.actions.ready()', err);
      }
    };
    void notifyReady();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      <MiniApp />
    </div>
  );
}
