'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback, useEffect, useState } from 'react';

import { GradientSmallButton } from '~/components/ui/brand-guideline-buttons';

interface AddMiniAppActionProps {
  label?: string;
}

export function AddMiniAppAction({ label = 'Add MiniApp' }: AddMiniAppActionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const handleMiniAppAdded = () => {
      setStatus('Mini app added successfully!');
      setError(null);
    };

    const handleMiniAppRemoved = () => {
      setStatus('Mini app removed.');
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
      setStatus('Mini app added successfully!');
    } catch (err) {
      setError(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-2 text-center">
      {error && (
        <div className="mx-auto w-[180px] rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[0.68rem] text-red-100">
          {error}
        </div>
      )}

      {status && (
        <div className="mx-auto w-[180px] rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[0.68rem] text-emerald-100">
          {status}
        </div>
      )}

      <GradientSmallButton
        label={loading ? 'Adding…' : label}
        icon="plus"
        onClick={() => {
          void addMiniApp();
        }}
        disabled={loading}
      />
    </div>
  );
}
