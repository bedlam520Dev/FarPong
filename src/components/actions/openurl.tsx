'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback } from 'react';
import { Button } from '~/components/ui/button';

export function OpenUrlAction() {
  const openUrl = useCallback((): void => {
    sdk.actions.openUrl('https://ohara.ai');
  }, []);

  return (
    <div className="mb-4">
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
        <pre className="font-mono text-xs text-emerald-500 dark:text-emerald-400">
          sdk.actions.openUrl
        </pre>
      </div>
      <div className="mb-4 text-center">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Want to Build an App
          <br />
          like this too?
        </p>
      </div>
      <Button onClick={openUrl}>Open Ohara.ai</Button>
    </div>
  );
}
