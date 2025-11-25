'use client';

import { JSX, useState } from 'react';

import { GradientSmallButton } from '~/components/ui/brand-guideline-buttons';
import { Kbd, KbdGroup } from '~/components/ui/kbd';

interface ControlsDisplayProps {
  isMobile: boolean;
}

export function ControlsDisplay({ isMobile }: ControlsDisplayProps): JSX.Element {
  const [showControls, setShowControls] = useState<boolean>(false);

  return (
    <>
      <GradientSmallButton
        label="Controls"
        icon="controls"
        onClick={() => setShowControls(!showControls)}
      />

      {showControls && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-sm"
          onClick={() => setShowControls(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border-2 border-[oklch(0.66 0.12 219.97 / 1)]/50 bg-[oklch(0.11 0.03 291.33 / 1)]/95 p-6"
            style={{
              boxShadow: '0px 0px 18px 6px oklch(0.62 0.12 230.75 / 0.75)',
              maxHeight: 'calc(100dvh - 2rem)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">🎮 Controls</h3>
              <GradientSmallButton
                icon="close"
                label="Close"
                onClick={() => setShowControls(false)}
              />
            </div>

            <div className="space-y-5 overflow-y-auto text-sm text-white/80">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                  Keyboard
                </p>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="text-white/60">Move:</span>
                    <KbdGroup>
                      <Kbd>W</Kbd>
                      <Kbd>S</Kbd>
                    </KbdGroup>
                    <span className="text-white/50">or</span>
                    <KbdGroup>
                      <Kbd>↑</Kbd>
                      <Kbd>↓</Kbd>
                    </KbdGroup>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-white/60">Pause:</span>
                    <Kbd>Space</Kbd>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-white/60">Reset:</span>
                    <Kbd>R</Kbd>
                  </p>
                  <p className="text-white/60">AI handles the paddle you aren’t controlling.</p>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/40">
                  Touch
                </p>
                <div className="space-y-2">
                  <p>
                    • <span className="text-white">Tap or drag</span> on your side to move.
                  </p>
                  <p>• Buttons beneath the arena control pause, reset, and menu.</p>
                  {isMobile && <p>• Haptics and audio are tuned for handheld play.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
