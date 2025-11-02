'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';

export function AddMiniAppAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleMiniAppAdded = () => {
      setStatus('Mini App added successfully!');
      setError(null);
    };

    const handleMiniAppRemoved = () => {
      setStatus('Mini App was removed');
      setError(null);
    };

    sdk.on('miniAppAdded', handleMiniAppAdded);
    sdk.on('miniAppRemoved', handleMiniAppRemoved);

    return () => {
      sdk.removeListener('miniAppAdded', handleMiniAppAdded);
      sdk.removeListener('miniAppRemoved', handleMiniAppRemoved);
    };
  }, []);

  const addMiniApp = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await sdk.actions.addMiniApp();
    } catch (err) {
      setError(`Failed to add Mini App: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-3 text-center">
      {error && (
        <div className="mx-auto w-[min(240px,40vw)] rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[0.65rem] text-red-200">
          {error}
        </div>
      )}

      {status && (
        <div className="mx-auto w-[min(240px,40vw)] rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-[0.65rem] text-emerald-200">
          {status}
        </div>
      )}

      <Button
        onClick={addMiniApp}
        disabled={loading}
        isLoading={loading}
        className="mx-auto w-[min(240px,40vw)] rounded-2xl border border-white/12 bg-linear-to-r from-(--gradient-brand-start) to-(--gradient-brand-end) px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_0_30px_rgba(138,99,210,0.35)] transition-transform duration-200 hover:scale-105 hover:shadow-[0_0_36px_rgba(138,99,210,0.55)] active:scale-95 sm:text-[0.75rem]"
      >
        Add Mini App
      </Button>
    </div>
  );
}
