'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/button';

const MINIAPP_OPTIONS = [
  {
    name: 'VISIONS',
    url: 'https://www.fractalvisions.io/mint/fractal-caster',
  },
  {
    name: 'NexArt',
    url: 'https://farcaster.xyz/miniapps/bPiyBjuVwuzf/nexart',
  },
  {
    name: 'Checkin',
    url: 'https://farcaster.xyz/miniapps/hr5GffFwaIbG/checkin',
  },
  {
    name: 'AstroBlock',
    url: 'https://farcaster.xyz/miniapps/HL2nrEXYPG0S/astroblock',
  },
  {
    name: 'Ohara',
    url: 'https://farcaster.xyz/miniapps/xWwn85_Vvqaa/ohara',
  },
];

export function OpenMiniAppAction() {
  const [selectedOption, setSelectedOption] = useState(MINIAPP_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenMiniApp = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await sdk.actions.openMiniApp({
        url: selectedOption.url,
      });
      // If successful, this app will close, so we won't reach this point
    } catch (err) {
      setError(`Failed to open Mini App: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [selectedOption.url]);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
          sdk.actions.openMiniApp
        </pre>
      </div>

      <div className="mb-2">
        <select
          value={JSON.stringify(selectedOption)}
          onChange={(e) => setSelectedOption(JSON.parse(e.target.value))}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 text-emerald-500 dark:text-emerald-400"
        >
          {MINIAPP_OPTIONS.map((option) => (
            <option key={option.url} value={JSON.stringify(option)}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">URL: {selectedOption.url}</div>

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg my-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <Button onClick={handleOpenMiniApp} disabled={loading} isLoading={loading}>
        Open Mini App
      </Button>
    </div>
  );
}
