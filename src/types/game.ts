export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

export interface TouchControl {
  active: boolean;
  startY: number;
  currentY: number;
}

export interface GameState {
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  isPaused: boolean;
  gameStarted: boolean;
  winner: 'left' | 'right' | null;
  playerSide: 'left' | 'right' | null;
  countdown: number;
}

export interface User {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  walletAddress?: string;
}
