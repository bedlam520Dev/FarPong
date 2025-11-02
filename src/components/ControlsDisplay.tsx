'use client';

import { JSX, useState } from 'react';

interface ControlsDisplayProps {
  isMobile: boolean;
}

export function ControlsDisplay({ isMobile }: ControlsDisplayProps): JSX.Element {
  const [showControls, setShowControls] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => setShowControls(!showControls)}
        className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
      >
        ❓ Controls
      </button>

      {showControls && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowControls(false)}
        >
          <div
            className="bg-linear-to-br from-gray-900 via-black to-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border-2 border-purple-600/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🎮 Controls</h3>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            {isMobile ? (
              <div className="space-y-2 text-gray-100">
                <p className="leading-relaxed">
                  • <span className="font-semibold text-white">Touch your side</span> - Move your
                  paddle up/down
                </p>
                <p className="leading-relaxed">
                  • <span className="font-semibold text-white">AI controls</span> - Other paddle
                  automatically
                </p>
                <p className="leading-relaxed">
                  • <span className="font-semibold text-white">Tap buttons</span> - Pause, reset, or
                  return to menu
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-gray-100">
                <p className="leading-relaxed">
                  •{' '}
                  <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">W/S</span>{' '}
                  or{' '}
                  <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">↑/↓</span>{' '}
                  - Move your paddle
                </p>
                <p className="leading-relaxed">
                  • <span className="font-semibold text-purple-400">AI opponent</span> - Controls
                  other paddle
                </p>
                <p className="leading-relaxed">
                  •{' '}
                  <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">
                    Space
                  </span>{' '}
                  - Pause/Resume game
                </p>
                <p className="leading-relaxed">
                  • <span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">R</span>{' '}
                  - Reset game
                </p>
              </div>
            )}

            <button
              onClick={() => setShowControls(false)}
              className="mt-6 w-full px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
