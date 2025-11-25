'use client';

import Image from 'next/image';
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { JSX, useCallback, useEffect, useRef, useState } from 'react';

import { GradientActionButton, GradientSmallButton } from '~/components/ui/brand-guideline-buttons';
import type { GameState, TouchControl, User } from '~/types/game';
import { GameAudio } from '~/utils/audio';
import { ControlsDisplay } from './ControlsDisplay';
import { LeaderboardModal } from './LeaderboardModal';

interface PongGameProps {
  user: User | null;
  onReturnToMenu: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 120;
const BALL_RADIUS = 8;
const PLAYER_MAX_SCORE = 100;
const AI_WINNING_SCORE = 10;
const INITIAL_BALL_SPEED = 5.5;
const AI_BASE_REACTION_SPEED = 1;
const PADDLE_SPEED = 7;
const PANEL_GLOW = '0px 0px 18px 6px oklch(0.62 0.12 230.75 / 0.75)';
const PANEL_BORDER = 'oklch(0.66 0.12 219.97 / 0.9)';

const formatScore = (value: number): string => value.toString().padStart(2, '0');

export function PongGame({ user, onReturnToMenu }: PongGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<GameAudio | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    leftPaddle: {
      x: 30,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
      score: 0,
    },
    rightPaddle: {
      x: CANVAS_WIDTH - 30 - PADDLE_WIDTH,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
      score: 0,
    },
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 0,
      dy: 0,
      radius: BALL_RADIUS,
      speed: INITIAL_BALL_SPEED,
    },
    isPaused: true,
    gameStarted: false,
    winner: null,
    playerSide: null,
    countdown: 0,
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const touchControls = useRef<{ left: TouchControl; right: TouchControl }>({
    left: { active: false, startY: 0, currentY: 0 },
    right: { active: false, startY: 0, currentY: 0 },
  });
  const paddleVelocity = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  const gameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    audioRef.current = new GameAudio();
  }, []);

  const resetGame = useCallback((): void => {
    setScoreSubmitted(false);
    setScoreSubmitting(false);
    setScoreError('');
    setGameState({
      leftPaddle: {
        x: 30,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
        score: 0,
      },
      rightPaddle: {
        x: CANVAS_WIDTH - 30 - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
        score: 0,
      },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        dx: 0,
        dy: 0,
        radius: BALL_RADIUS,
        speed: INITIAL_BALL_SPEED,
      },
      isPaused: true,
      gameStarted: false,
      winner: null,
      playerSide: null,
      countdown: 0,
    });
  }, []);

  const selectSide = useCallback((side: 'left' | 'right'): void => {
    setGameState((prev: GameState) => ({
      ...prev,
      playerSide: side,
      gameStarted: true,
      isPaused: false,
      countdown: 3,
    }));
  }, []);

  useEffect(() => {
    if (gameState.countdown > 0 && !gameState.isPaused) {
      const timer = setTimeout(() => {
        setGameState((prev: GameState) => {
          if (prev.countdown === 1) {
            const direction = prev.playerSide === 'left' ? 1 : -1;
            return {
              ...prev,
              countdown: 0,
              ball: {
                ...prev.ball,
                dx: direction * INITIAL_BALL_SPEED,
                dy: (Math.random() - 0.3) * 0.8,
              },
            };
          }
          return {
            ...prev,
            countdown: prev.countdown - 1,
          };
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.countdown, gameState.isPaused, gameState.playerSide]);

  const updateGame = useCallback((): void => {
    setGameState((prevState: GameState) => {
      if (prevState.isPaused || prevState.winner || prevState.countdown > 0) return prevState;

      const newState = { ...prevState };

      const isPlayerLeft = newState.playerSide === 'left';
      const playerPaddle = isPlayerLeft ? newState.leftPaddle : newState.rightPaddle;
      const aiPaddle = isPlayerLeft ? newState.rightPaddle : newState.leftPaddle;

      const prevLeftY = newState.leftPaddle.y;
      const prevRightY = newState.rightPaddle.y;

      const isMovingUp =
        keysPressed.current.has('w') ||
        keysPressed.current.has('W') ||
        keysPressed.current.has('ArrowUp');
      const isMovingDown =
        keysPressed.current.has('s') ||
        keysPressed.current.has('S') ||
        keysPressed.current.has('ArrowDown');

      if (isPlayerLeft) {
        if (isMovingUp) {
          newState.leftPaddle.y = Math.max(0, newState.leftPaddle.y - newState.leftPaddle.speed);
        }
        if (isMovingDown) {
          newState.leftPaddle.y = Math.min(
            CANVAS_HEIGHT - PADDLE_HEIGHT,
            newState.leftPaddle.y + newState.leftPaddle.speed,
          );
        }
      } else {
        if (isMovingUp) {
          newState.rightPaddle.y = Math.max(0, newState.rightPaddle.y - newState.rightPaddle.speed);
        }
        if (isMovingDown) {
          newState.rightPaddle.y = Math.min(
            CANVAS_HEIGHT - PADDLE_HEIGHT,
            newState.rightPaddle.y + newState.rightPaddle.speed,
          );
        }
      }

      if (touchControls.current.left.active && isPlayerLeft) {
        const deltaY = touchControls.current.left.currentY - touchControls.current.left.startY;
        newState.leftPaddle.y = Math.max(
          0,
          Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.leftPaddle.y + deltaY * 0.8),
        );
        touchControls.current.left.startY = touchControls.current.left.currentY;
      }
      if (touchControls.current.right.active && !isPlayerLeft) {
        const deltaY = touchControls.current.right.currentY - touchControls.current.right.startY;
        newState.rightPaddle.y = Math.max(
          0,
          Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.rightPaddle.y + deltaY * 0.8),
        );
        touchControls.current.right.startY = touchControls.current.right.currentY;
      }

      const playerScore = playerPaddle.score;

      let aiDifficultyMultiplier = AI_BASE_REACTION_SPEED;

      if (playerScore >= 90) {
        aiDifficultyMultiplier = 1.0;
      } else if (playerScore >= 75) {
        aiDifficultyMultiplier = 0.95;
      } else if (playerScore >= 60) {
        aiDifficultyMultiplier = 0.85;
      } else if (playerScore >= 45) {
        aiDifficultyMultiplier = 0.75;
      } else if (playerScore >= 30) {
        aiDifficultyMultiplier = 0.65;
      } else if (playerScore >= 15) {
        aiDifficultyMultiplier = 0.55;
      } else {
        aiDifficultyMultiplier = 0.45;
      }

      const ballCenterY = newState.ball.y;
      const aiPaddleCenterY = aiPaddle.y + aiPaddle.height / 2;
      const aiSpeed = aiPaddle.speed * aiDifficultyMultiplier;

      if (Math.abs(ballCenterY - aiPaddleCenterY) > 10) {
        if (ballCenterY > aiPaddleCenterY) {
          if (isPlayerLeft) {
            newState.rightPaddle.y = Math.min(
              CANVAS_HEIGHT - PADDLE_HEIGHT,
              newState.rightPaddle.y + aiSpeed,
            );
          } else {
            newState.leftPaddle.y = Math.min(
              CANVAS_HEIGHT - PADDLE_HEIGHT,
              newState.leftPaddle.y + aiSpeed,
            );
          }
        } else {
          if (isPlayerLeft) {
            newState.rightPaddle.y = Math.max(0, newState.rightPaddle.y - aiSpeed);
          } else {
            newState.leftPaddle.y = Math.max(0, newState.leftPaddle.y - aiSpeed);
          }
        }
      }

      paddleVelocity.current.left = newState.leftPaddle.y - prevLeftY;
      paddleVelocity.current.right = newState.rightPaddle.y - prevRightY;

      newState.ball.x += newState.ball.dx;
      newState.ball.y += newState.ball.dy;

      if (
        newState.ball.y - newState.ball.radius <= 0 ||
        newState.ball.y + newState.ball.radius >= CANVAS_HEIGHT
      ) {
        newState.ball.dy *= -1;
        audioRef.current?.playWallHit();
      }

      const ballLeft = newState.ball.x - newState.ball.radius;
      const ballRight = newState.ball.x + newState.ball.radius;
      const ballTop = newState.ball.y - newState.ball.radius;
      const ballBottom = newState.ball.y + newState.ball.radius;

      if (
        newState.ball.dx < 0 &&
        ballLeft <= newState.leftPaddle.x + newState.leftPaddle.width &&
        ballRight >= newState.leftPaddle.x &&
        ballBottom >= newState.leftPaddle.y &&
        ballTop <= newState.leftPaddle.y + newState.leftPaddle.height
      ) {
        newState.ball.dx = Math.abs(newState.ball.dx) * 1.05;
        newState.ball.x = newState.leftPaddle.x + newState.leftPaddle.width + newState.ball.radius;

        const hitPos =
          (newState.ball.y - (newState.leftPaddle.y + newState.leftPaddle.height / 2)) /
          (newState.leftPaddle.height / 2);
        newState.ball.dy = hitPos * 2;

        const paddleMomentum = paddleVelocity.current.left * 0.3;
        newState.ball.dy += paddleMomentum;

        audioRef.current?.playPaddleHit();
      }

      if (
        newState.ball.dx > 0 &&
        ballRight >= newState.rightPaddle.x &&
        ballLeft <= newState.rightPaddle.x + newState.rightPaddle.width &&
        ballBottom >= newState.rightPaddle.y &&
        ballTop <= newState.rightPaddle.y + newState.rightPaddle.height
      ) {
        newState.ball.dx = -Math.abs(newState.ball.dx) * 1.05;
        newState.ball.x = newState.rightPaddle.x - newState.ball.radius;

        const hitPos =
          (newState.ball.y - (newState.rightPaddle.y + newState.rightPaddle.height / 2)) /
          (newState.rightPaddle.height / 2);
        newState.ball.dy = hitPos * 2;

        const paddleMomentum = paddleVelocity.current.right * 0.3;
        newState.ball.dy += paddleMomentum;

        audioRef.current?.playPaddleHit();
      }

      if (newState.ball.x - newState.ball.radius <= 0 && isPlayerLeft) {
        newState.rightPaddle.score++;
        audioRef.current?.playScore();
        if (newState.rightPaddle.score >= AI_WINNING_SCORE) {
          newState.winner = 'right';
          audioRef.current?.playWin();
        } else {
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = 0;
          newState.ball.dy = 0;
          newState.countdown = 2;
        }
      }
      if (newState.ball.x + newState.ball.radius >= CANVAS_WIDTH && !isPlayerLeft) {
        newState.leftPaddle.score++;
        audioRef.current?.playScore();
        if (newState.leftPaddle.score >= AI_WINNING_SCORE) {
          newState.winner = 'left';
          audioRef.current?.playWin();
        } else {
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = 0;
          newState.ball.dy = 0;
          newState.countdown = 2;
        }
      }

      if (newState.ball.x + newState.ball.radius >= CANVAS_WIDTH && isPlayerLeft) {
        newState.leftPaddle.score++;
        audioRef.current?.playScore();
        if (newState.leftPaddle.score >= PLAYER_MAX_SCORE) {
          newState.winner = 'left';
          audioRef.current?.playWin();
        } else {
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = 0;
          newState.ball.dy = 0;
          newState.countdown = 2;
        }
      }
      if (newState.ball.x - newState.ball.radius <= 0 && !isPlayerLeft) {
        newState.rightPaddle.score++;
        audioRef.current?.playScore();
        if (newState.rightPaddle.score >= PLAYER_MAX_SCORE) {
          newState.winner = 'right';
          audioRef.current?.playWin();
        } else {
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = 0;
          newState.ball.dy = 0;
          newState.countdown = 2;
        }
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
    });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const render = (): void => {
      const state = gameStateRef.current;
      if (!state) return;
      const {
        leftPaddle,
        rightPaddle,
        ball,
        countdown,
        gameStarted,
        winner,
        playerSide,
        isPaused,
      } = state;

      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, 'oklch(0.14 0 0 / 1)');
      bgGradient.addColorStop(0.5, 'oklch(0 0 0 / 1)');
      bgGradient.addColorStop(1, 'oklch(0.14 0 0 / 1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = 'oklch(0.59 0.17 297.31 / 0.30)';
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      const farcasterColor = {
        start: 'oklch(0.59 0.17 297.31 / 1)',
        end: 'oklch(0.44 0.15 295.39 / 1)',
      };
      const baseColor = {
        start: 'oklch(0.45 0.31 264.05 / 1)',
        end: 'oklch(0.38 0.26 264.05 / 1)',
      };

      const drawRoundedPaddle = (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        colors: { start: string; end: string },
      ): void => {
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, colors.start);
        gradient.addColorStop(0.5, 'oklch(1 0 0 / 1)');
        gradient.addColorStop(1, colors.end);

        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.start;

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        const highlightGradient = ctx.createLinearGradient(x, y, x + width / 2, y);
        highlightGradient.addColorStop(0, 'oklch(1 0 0 / 0.40)');
        highlightGradient.addColorStop(1, 'oklch(1 0 0 / 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fill();
      };

      drawRoundedPaddle(
        leftPaddle.x,
        leftPaddle.y,
        leftPaddle.width,
        leftPaddle.height,
        8,
        farcasterColor,
      );

      drawRoundedPaddle(
        rightPaddle.x,
        rightPaddle.y,
        rightPaddle.width,
        rightPaddle.height,
        8,
        baseColor,
      );

      ctx.shadowBlur = 0;

      const ballGradient = ctx.createRadialGradient(
        ball.x,
        ball.y,
        0,
        ball.x,
        ball.y,
        ball.radius * 2.5,
      );
      ballGradient.addColorStop(0, 'oklch(1 0 0 / 1)');
      ballGradient.addColorStop(0.4, 'oklch(0.91 0 0 / 1)');
      ballGradient.addColorStop(0.7, 'oklch(0.59 0.17 297.31 / 0.50)');
      ballGradient.addColorStop(1, 'oklch(0.53 0.26 262.87 / 0)');
      ctx.fillStyle = ballGradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      if (countdown > 0) {
        ctx.font = 'bold 80px PressStart2P';
        ctx.fillStyle = 'oklch(0.7761 0.1664 219.63 / 0.90)';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'oklch(0.59 0.17 297.31 / 1)';
        ctx.fillText(countdown.toString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
      }

      if (!gameStarted) {
        ctx.fillStyle = 'oklch(0 0 0 / 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.font = 'bold small-caps 36px PressStart2P';
        ctx.fillStyle = 'oklch(0.7761 0.1664 219.63 / 1)';
        ctx.textAlign = 'center';
        ctx.fillText('Choose Your Side', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);

        const leftButtonX = CANVAS_WIDTH / 4;
        const leftButtonY = CANVAS_HEIGHT / 2;
        ctx.fillStyle = 'oklch(0.59 0.17 297.31 / 0.20)';
        ctx.fillRect(leftButtonX - 100, leftButtonY - 40, 200, 80);
        ctx.strokeStyle = 'oklch(0.59 0.17 297.31 / 1)';
        ctx.lineWidth = 3;
        ctx.strokeRect(leftButtonX - 100, leftButtonY - 40, 200, 80);
        ctx.font = 'small-caps 24px PressStart2P';
        ctx.fillStyle = 'oklch(0.59 0.17 297.31 / 1)';
        ctx.fillText('Farcaster', leftButtonX, leftButtonY + 10);

        const rightButtonX = (CANVAS_WIDTH * 3) / 4;
        const rightButtonY = CANVAS_HEIGHT / 2;
        ctx.fillStyle = 'oklch(0.45 0.31 264.05 / 0.20)';
        ctx.fillRect(rightButtonX - 100, rightButtonY - 40, 200, 80);
        ctx.strokeStyle = 'oklch(0.45 0.31 264.05 / 1)';
        ctx.lineWidth = 3;
        ctx.strokeRect(rightButtonX - 100, rightButtonY - 40, 200, 80);
        ctx.font = 'small-caps 28px PressStart2P';
        ctx.fillStyle = 'oklch(0.45 0.31 264.05 / 1)';
        ctx.fillText('Base', rightButtonX, rightButtonY + 10);
        ctx.font = 'small-caps 20px PressStart2P';
        ctx.fillStyle = 'oklch(0.7761 0.1664 219.63 / 1)';
        ctx.fillText('Tap a side to play!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
      }

      if (winner) {
        ctx.fillStyle = 'oklch(0 0 0 / 0.90)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.font = 'bold 72px Press Start 2P';
        const winnerIsPlayer =
          (winner === 'left' && playerSide === 'left') ||
          (winner === 'right' && playerSide === 'right');
        ctx.fillStyle = winnerIsPlayer
          ? 'oklch(0.87 0.29 142.50 / 1)'
          : 'oklch(0.66 0.22 25.73 / 1)';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = winnerIsPlayer
          ? 'oklch(0.87 0.29 142.50 / 1)'
          : 'oklch(0.66 0.22 25.73 / 1)';
        ctx.fillText(
          winnerIsPlayer ? 'You Win! 🎉' : 'AI Wins!',
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 - 60,
        );
        ctx.shadowBlur = 0;
      } else if (isPaused && gameStarted) {
        ctx.font = 'bold 48px Press Start 2P';
        ctx.fillStyle = 'oklch(0.7761 0.1664 219.63 / 0.90)';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'oklch(1 0 0 / 1)';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
      }

      ctx.textAlign = 'center';
    };

    const gameLoop = (): void => {
      updateGame();
      render();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    render();
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      keysPressed.current.add(e.key);

      if (e.key === ' ') {
        e.preventDefault();
        setGameState((prev: GameState) => {
          if (prev.winner) return prev;
          if (!prev.gameStarted) return prev;
          return {
            ...prev,
            isPaused: !prev.isPaused,
          };
        });
      }

      if (e.key === 'r' || e.key === 'R') {
        const currentState = gameStateRef.current;
        if (currentState?.winner) {
          resetGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  const handleCanvasClick = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>): void => {
      if (!gameState.gameStarted) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const x = (e.clientX - rect.left) * scaleX;

        if (x < CANVAS_WIDTH / 2) {
          selectSide('left');
        } else {
          selectSide('right');
        }
      }
    },
    [gameState.gameStarted, selectSide],
  );

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent<HTMLCanvasElement>): void => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      // Handle side selection on touch
      if (!gameState.gameStarted) {
        const touch = e.touches[0];
        const x = (touch.clientX - rect.left) * scaleX;
        if (x < CANVAS_WIDTH / 2) {
          selectSide('left');
        } else {
          selectSide('right');
        }
        return;
      }

      Array.from(e.touches).forEach((touch) => {
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        if (gameState.playerSide === 'left' && x < CANVAS_WIDTH / 2) {
          touchControls.current.left = { active: true, startY: y, currentY: y };
        } else if (gameState.playerSide === 'right' && x >= CANVAS_WIDTH / 2) {
          touchControls.current.right = { active: true, startY: y, currentY: y };
        }
      });
    },
    [gameState.gameStarted, gameState.playerSide, selectSide],
  );

  const handleTouchMove = useCallback((e: ReactTouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleY = CANVAS_HEIGHT / rect.height;

    Array.from(e.touches).forEach((touch) => {
      const y = (touch.clientY - rect.top) * scaleY;

      if (touchControls.current.left.active) {
        touchControls.current.left.currentY = y;
      }
      if (touchControls.current.right.active) {
        touchControls.current.right.currentY = y;
      }
    });
  }, []);

  const handleTouchEnd = useCallback((e: ReactTouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    touchControls.current.left.active = false;
    touchControls.current.right.active = false;
  }, []);

  const handleSubmitScore = useCallback(async () => {
    if (
      !user ||
      user.fid <= 0 ||
      !gameState.playerSide ||
      gameState.winner === null ||
      scoreSubmitted ||
      scoreSubmitting
    ) {
      return;
    }
    setScoreSubmitting(true);
    setScoreError('');
    try {
      const isPlayerLeft = gameState.playerSide === 'left';
      const playerScore = isPlayerLeft ? gameState.leftPaddle.score : gameState.rightPaddle.score;
      const opponentScore = isPlayerLeft ? gameState.rightPaddle.score : gameState.leftPaddle.score;

      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: user.fid,
          username: user.username,
          displayName: user.displayName,
          pfpUrl: user.pfpUrl,
          score: playerScore,
          opponentScore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit score');
      }

      setScoreSubmitted(true);
    } catch (err) {
      console.error(err);
      setScoreError('Unable to submit score. Please try again.');
    } finally {
      setScoreSubmitting(false);
    }
  }, [
    gameState.leftPaddle.score,
    gameState.playerSide,
    gameState.rightPaddle.score,
    gameState.winner,
    scoreSubmitted,
    scoreSubmitting,
    user,
  ]);

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center overflow-auto bg-linear-to-br from-black via-gray-900 to-black px-4 pb-2 pt-4">
      <div className="relative text-center">
        <h1 className="relative font-arcade text-center bg-linear-to-r from-gradient-brand-start via-gradient-brand-mid to-gradient-brand-end bg-clip-text text-[clamp(1rem,3vw,2rem)] font-bold text-transparent">
          FARPONG
        </h1>
        {user && (
          <p className="relative font-arcade text-center text-xs my-1">
            Welcome,{' '}
            <span className="bg-linear-to-r from-gradient-brand-start to-gradient-brand-end bg-clip-text font-arcade text-transparent">
              {user.displayName || user.username || `Player #${user.fid}`}
            </span>
            !
          </p>
        )}
        {!gameState.gameStarted && (
          <p className="relative font-arcade text-center text-[clamp(0.5rem,1.2vw,0.8rem)] mt-2 mb-2">
            Choose your side to begin!
          </p>
        )}
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        <div className="relative w-full max-w-4xl space-y-2">
          <div
            className="relative mx-auto flex h-auto w-full flex-row justify-center gap-5 rounded-[18px] border bg-black/40 py-1"
            style={{ borderColor: PANEL_BORDER, boxShadow: PANEL_GLOW }}
          >
            <div className="relative m-auto flex items-center gap-3">
              <Image src="/far-square.svg" alt="Farcaster score" width={30} height={30} />
              <div>
                <p
                  className={`font-arcade text-[clamp(1.5rem,3vw,2.2rem)] font-bold ${
                    gameState.playerSide === 'left' ? 'text-white' : 'text-white/70'
                  }`}
                  style={
                    gameState.playerSide === 'left'
                      ? { textShadow: '0px 0px 14px oklch(0.62 0.12 230.75 / 0.80)' }
                      : undefined
                  }
                >
                  {formatScore(gameState.leftPaddle.score)}
                </p>
              </div>
            </div>

            <div className="relative m-auto flex items-center gap-3">
              <div className="text-right">
                <p
                  className={`font-arcade text-[clamp(1.5rem,3vw,2.2rem)] font-bold ${
                    gameState.playerSide === 'right' ? 'text-white' : 'text-white/70'
                  }`}
                  style={
                    gameState.playerSide === 'right'
                      ? { textShadow: '0px 0px 14px oklch(0.62 0.12 230.75 / 0.80)' }
                      : undefined
                  }
                >
                  {formatScore(gameState.rightPaddle.score)}
                </p>
              </div>
              <Image src="/base-square.svg" alt="Base score" width={30} height={30} />
            </div>
          </div>

          <div className="relative text-center font-arcade text-[clamp(0.4rem,1vw,0.6rem)] uppercase tracking-[0.3em] text-white/50">
            · Survive to 100 · AI wins at 10 ·
          </div>

          <div
            className="rounded-[18px] border bg-black/70"
            style={{ borderColor: PANEL_BORDER, boxShadow: PANEL_GLOW }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="h-full w-full touch-none cursor-pointer rounded-[18px] border bg-black"
              style={{
                borderColor: PANEL_BORDER,
                boxShadow: PANEL_GLOW,
                aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
                maxHeight: 'min(560px, calc(100dvh - 260px))',
              }}
            />
          </div>
        </div>
      </div>

      {gameState.winner ? (
        <div className="relative flex w-full max-w-xs flex-col mt-3 mb-2 items-center gap-3 text-center font-arcade">
          {user && user.fid > 0 && (
            <GradientActionButton
              label={scoreSubmitted ? 'Score Saved' : scoreSubmitting ? 'Saving…' : 'Submit Score'}
              icon="plus"
              onClick={() => {
                void handleSubmitScore();
              }}
              disabled={scoreSubmitting || scoreSubmitted}
            />
          )}
          <GradientActionButton
            label="View Leaderboard"
            icon="menu"
            onClick={() => setShowLeaderboard(true)}
          />
          <GradientSmallButton label="Play Again" icon="restart" onClick={resetGame} />
          <GradientSmallButton label="Menu" icon="menu" onClick={onReturnToMenu} />
          {scoreError && <p className="text-xs text-red-400">{scoreError}</p>}
          {scoreSubmitted && !scoreError && (
            <p className="text-xs text-white/60 font-arcade">Score submitted successfully.</p>
          )}
        </div>
      ) : (
        <div className="mt-3 mb-2 flex w-full max-w-xs flex-col items-center gap-3">
          {gameState.gameStarted && (
            <GradientSmallButton
              label={gameState.isPaused ? 'Resume' : 'Pause'}
              icon={gameState.isPaused ? 'play' : 'pause'}
              onClick={() =>
                setGameState((prev: GameState) => ({ ...prev, isPaused: !prev.isPaused }))
              }
            />
          )}
          <GradientSmallButton label="Reset" icon="restart" onClick={resetGame} />
          <GradientSmallButton label="Menu" icon="menu" onClick={onReturnToMenu} />
          <ControlsDisplay isMobile={isMobile} />
        </div>
      )}

      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUserFid={user?.fid}
      />
    </div>
  );
}
