'use client';

import { useState } from 'react';
import { AuthButtons } from '~/components/AuthButtons';
import { PongGame } from '~/components/PongGame';
import type { User } from '~/types/game';

export default function MiniApp() {
  const [user, setUser] = useState<User | null>(null);
  const [showGame, setShowGame] = useState<boolean>(false);

  const handleUserAuthenticated = (authenticatedUser: User): void => {
    setUser(authenticatedUser);
    setShowGame(true);
  };

  const handleReturnToMenu = (): void => {
    setShowGame(false);
  };

  if (!showGame || !user) {
    return <AuthButtons onUserAuthenticated={handleUserAuthenticated} />;
  }

  return <PongGame user={user} onReturnToMenu={handleReturnToMenu} />;
}
