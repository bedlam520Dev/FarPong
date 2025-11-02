'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/button';

export function ViewTokenAction() {
  const [token, setToken] = useState<string>(
    'eip155:8453/erc20:0x9215c8cd64520ad1024353828899290e0e8a995c',
  );

  const handleViewToken = useCallback((): void => {
    sdk.actions.viewToken({ token });
  }, [token]);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
          sdk.actions.viewToken
        </pre>
      </div>
      <div className="mb-2">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 text-emerald-500 dark:text-emerald-400"
          placeholder="Enter CAIP-19 asset ID (e.g., eip155:8453/erc20:0x...)"
        />
      </div>
      <Button onClick={handleViewToken}>View Token</Button>
    </div>
  );
}
