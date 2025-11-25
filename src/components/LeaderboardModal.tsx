'use client';

import { startTransition, useEffect, useState } from 'react';

import { GradientSmallButton } from '~/components/ui/brand-guideline-buttons';
import type { LeaderboardEntry } from '~/lib/leaderboard';
import { cn } from '~/lib/utils';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
  currentUserFid?: number;
}

export function LeaderboardModal({ open, onClose, currentUserFid }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    let cancelled = false;

    startTransition(() => {
      setLoading(true);
      setError('');
    });

    fetch('/api/leaderboard?limit=10', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load leaderboard');
        const json = (await res.json()) as { entries: LeaderboardEntry[] };
        setEntries(json.entries ?? []);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError('Unable to load leaderboard.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-[oklch(0.66_0.13_219.97_/1)]/60 bg-black/90 p-6 text-white shadow-[0_0_35px_oklch(0.62_0.12_230.75_/0.55)]"
        style={{ maxHeight: 'calc(100dvh - 2rem)' }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[0.55rem] uppercase tracking-[0.5em] font-arcade text-white/40">
              Leaderboard
            </p>
            <h2 className="font-arcade text-sm mt-1">Top Players</h2>
          </div>
          <GradientSmallButton icon="close" label="Close" onClick={onClose} />
        </div>

        {loading ? (
          <div className="flex flex-1 flex-col items-center gap-3 py-10 text-sm font-arcade text-white/70">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Loading scores…
          </div>
        ) : error ? (
          <div className="flex-1 text-center text-sm text-red-400">{error}</div>
        ) : entries.length === 0 ? (
          <div className="flex-1 text-center text-sm text-white/60 font-arcade">
            No scores submitted yet.
          </div>
        ) : (
          <div
            className="flex-1 space-y-2 overflow-y-auto pr-1"
            style={{ maxHeight: 'min(60dvh, 420px)' }}
          >
            {entries.map((entry, index) => {
              const isCurrentUser = currentUserFid !== undefined && entry.fid === currentUserFid;
              const place = index + 1;

              return (
                <div
                  key={`${entry.fid}-${index}`}
                  className={cn(
                    'flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm',
                    isCurrentUser &&
                      'border-[oklch(0.66_0.12_219.97_/1)]/60 bg-[oklch(0.66_0.12_219.97_/1)]/10 shadow-[0_0_15px_oklch(0.62_0.12_230.75_/0.35)]',
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-arcade text-base text-white/80">#{place}</div>
                    <div>
                      <p className="font-semibold text-white">
                        {entry.displayName || entry.username || `Player ${entry.fid}`}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-[oklch(0.66_0.12_219.97_/1)]">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/50">FID {entry.fid}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-arcade text-xl text-white">{entry.score}</p>
                    <p className="text-[0.65rem] text-white/50">vs {entry.opponentScore}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
