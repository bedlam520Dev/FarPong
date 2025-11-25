'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
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

  return <MiniApp />;
}
