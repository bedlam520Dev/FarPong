'use client';

import { JSX, useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, TouchControl, User } from '~/types/game';
import { GameAudio } from '~/utils/audio';
import { ControlsDisplay } from './ControlsDisplay';

interface PongGameProps {
  user: User | null;
  onReturnToMenu: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 18;
const PADDLE_HEIGHT = 120;
const BALL_RADIUS = 8;
const PLAYER_MAX_SCORE = 100; // Max score player can achieve (survival mode)
const AI_WINNING_SCORE = 10; // AI wins if they score 10 points
const INITIAL_BALL_SPEED = 2.52; // Reduced by 30% total for perfect gameplay balance
const AI_BASE_REACTION_SPEED = 0.65; // Base AI paddle speed multiplier (adjusted by difficulty)
const PADDLE_SPEED = 2.5; // Smooth, gradual paddle movement

export function PongGame({ user, onReturnToMenu }: PongGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<GameAudio | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
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

  const resetBall = useCallback((towardsPlayer: boolean = false): void => {
    setGameState((prev: GameState) => {
      const direction = towardsPlayer
        ? prev.playerSide === 'left'
          ? 1
          : -1
        : Math.random() > 0.5
          ? 1
          : -1;

      return {
        ...prev,
        ball: {
          ...prev.ball,
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: 0,
          dy: 0,
        },
        countdown: 3,
      };
    });
  }, []);

  const resetGame = useCallback((): void => {
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

  // Countdown timer effect
  useEffect(() => {
    if (gameState.countdown > 0 && !gameState.isPaused) {
      const timer = setTimeout(() => {
        setGameState((prev: GameState) => {
          if (prev.countdown === 1) {
            // Start the ball moving
            const direction = prev.playerSide === 'left' ? 1 : -1;
            return {
              ...prev,
              countdown: 0,
              ball: {
                ...prev.ball,
                dx: direction * INITIAL_BALL_SPEED,
                dy: (Math.random() - 0.5) * 0.8,
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

      // Determine which paddle is player-controlled
      const isPlayerLeft = newState.playerSide === 'left';
      const playerPaddle = isPlayerLeft ? newState.leftPaddle : newState.rightPaddle;
      const aiPaddle = isPlayerLeft ? newState.rightPaddle : newState.leftPaddle;

      // Track paddle velocities for slide shot physics
      const prevLeftY = newState.leftPaddle.y;
      const prevRightY = newState.rightPaddle.y;

      // Update player paddle positions based on keyboard input (W/S or Arrow keys work regardless of side)
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

      // Update player paddle positions based on touch input
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

      // Dynamic AI Difficulty - adjust based on player's score (survival mode)
      const playerScore = playerPaddle.score;

      // Calculate AI difficulty multiplier based on player's score progression (0-100)
      let aiDifficultyMultiplier = AI_BASE_REACTION_SPEED; // Default: 0.65x

      if (playerScore >= 90) {
        // 90-100 points: Maximum difficulty
        aiDifficultyMultiplier = 1.0;
      } else if (playerScore >= 75) {
        // 75-90 points: Very hard
        aiDifficultyMultiplier = 0.95;
      } else if (playerScore >= 60) {
        // 60-75 points: Hard
        aiDifficultyMultiplier = 0.85;
      } else if (playerScore >= 45) {
        // 45-60 points: Medium-hard
        aiDifficultyMultiplier = 0.75;
      } else if (playerScore >= 30) {
        // 30-45 points: Normal
        aiDifficultyMultiplier = 0.65;
      } else if (playerScore >= 15) {
        // 15-30 points: Medium-easy
        aiDifficultyMultiplier = 0.55;
      } else {
        // 0-15 points: Easy (learning phase)
        aiDifficultyMultiplier = 0.45;
      }

      // AI Logic - predict ball position and move towards it with dynamic difficulty
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

      // Calculate paddle velocities for slide shot physics
      paddleVelocity.current.left = newState.leftPaddle.y - prevLeftY;
      paddleVelocity.current.right = newState.rightPaddle.y - prevRightY;

      // Update ball position
      newState.ball.x += newState.ball.dx;
      newState.ball.y += newState.ball.dy;

      // Ball collision with top and bottom walls
      if (
        newState.ball.y - newState.ball.radius <= 0 ||
        newState.ball.y + newState.ball.radius >= CANVAS_HEIGHT
      ) {
        newState.ball.dy *= -1;
        audioRef.current?.playWallHit();
      }

      // Ball collision with paddles
      const ballLeft = newState.ball.x - newState.ball.radius;
      const ballRight = newState.ball.x + newState.ball.radius;
      const ballTop = newState.ball.y - newState.ball.radius;
      const ballBottom = newState.ball.y + newState.ball.radius;

      // Left paddle collision with angular physics
      if (
        newState.ball.dx < 0 &&
        ballLeft <= newState.leftPaddle.x + newState.leftPaddle.width &&
        ballRight >= newState.leftPaddle.x &&
        ballBottom >= newState.leftPaddle.y &&
        ballTop <= newState.leftPaddle.y + newState.leftPaddle.height
      ) {
        newState.ball.dx = Math.abs(newState.ball.dx) * 1.05; // Slight speed increase
        newState.ball.x = newState.leftPaddle.x + newState.leftPaddle.width + newState.ball.radius;

        // Calculate hit position for angle
        const hitPos =
          (newState.ball.y - (newState.leftPaddle.y + newState.leftPaddle.height / 2)) /
          (newState.leftPaddle.height / 2);
        newState.ball.dy = hitPos * 2;

        // Add slide shot physics - transfer paddle momentum to ball
        const paddleMomentum = paddleVelocity.current.left * 0.3;
        newState.ball.dy += paddleMomentum;

        audioRef.current?.playPaddleHit();
      }

      // Right paddle collision with angular physics
      if (
        newState.ball.dx > 0 &&
        ballRight >= newState.rightPaddle.x &&
        ballLeft <= newState.rightPaddle.x + newState.rightPaddle.width &&
        ballBottom >= newState.rightPaddle.y &&
        ballTop <= newState.rightPaddle.y + newState.rightPaddle.height
      ) {
        newState.ball.dx = -Math.abs(newState.ball.dx) * 1.05; // Slight speed increase
        newState.ball.x = newState.rightPaddle.x - newState.ball.radius;

        // Calculate hit position for angle
        const hitPos =
          (newState.ball.y - (newState.rightPaddle.y + newState.rightPaddle.height / 2)) /
          (newState.rightPaddle.height / 2);
        newState.ball.dy = hitPos * 2;

        // Add slide shot physics - transfer paddle momentum to ball
        const paddleMomentum = paddleVelocity.current.right * 0.3;
        newState.ball.dy += paddleMomentum;

        audioRef.current?.playPaddleHit();
      }

      // Scoring - Survival mode
      // AI scores a point (player missed)
      if (newState.ball.x - newState.ball.radius <= 0 && isPlayerLeft) {
        newState.rightPaddle.score++; // AI scores
        audioRef.current?.playScore();
        if (newState.rightPaddle.score >= AI_WINNING_SCORE) {
          newState.winner = 'right'; // AI wins at 10 points
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
        newState.leftPaddle.score++; // AI scores
        audioRef.current?.playScore();
        if (newState.leftPaddle.score >= AI_WINNING_SCORE) {
          newState.winner = 'left'; // AI wins at 10 points
          audioRef.current?.playWin();
        } else {
          newState.ball.x = CANVAS_WIDTH / 2;
          newState.ball.y = CANVAS_HEIGHT / 2;
          newState.ball.dx = 0;
          newState.ball.dy = 0;
          newState.countdown = 2;
        }
      }

      // Player scores a point (survival mode)
      if (newState.ball.x + newState.ball.radius >= CANVAS_WIDTH && isPlayerLeft) {
        newState.leftPaddle.score++; // Player scores
        audioRef.current?.playScore();
        if (newState.leftPaddle.score >= PLAYER_MAX_SCORE) {
          newState.winner = 'left'; // Player reaches max score!
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
        newState.rightPaddle.score++; // Player scores
        audioRef.current?.playScore();
        if (newState.rightPaddle.score >= PLAYER_MAX_SCORE) {
          newState.winner = 'right'; // Player reaches max score!
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

    // Get canvas context with basic optimization
    const ctx = canvas.getContext('2d', {
      alpha: false, // No transparency needed, improves performance
    });
    if (!ctx) return;

    // Enable image smoothing for better visuals
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

      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, 'oklch(0.14 0 0 / 1)');
      bgGradient.addColorStop(0.5, 'oklch(0 0 0 / 1)');
      bgGradient.addColorStop(1, 'oklch(0.14 0 0 / 1)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw center line with glow effect
      ctx.strokeStyle = 'oklch(0.59 0.17 297.31 / 0.30)';
      ctx.lineWidth = 3;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Determine paddle colors - Farcaster (left) is always purple, Base (right) is always blue
      const isPlayerLeft = playerSide === 'left';
      const farcasterColor = {
        start: 'oklch(0.59 0.17 297.31 / 1)',
        end: 'oklch(0.44 0.15 295.39 / 1)',
      }; // Left side always purple
      const baseColor = {
        start: 'oklch(0.45 0.31 264.05 / 1)',
        end: 'oklch(0.38 0.26 264.05 / 1)',
      }; // Right side always blue

      // Helper function to draw rounded rectangle with glow
      const drawRoundedPaddle = (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
        colors: { start: string; end: string },
      ): void => {
        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, colors.start);
        gradient.addColorStop(0.5, 'oklch(1 0 0 / 1)');
        gradient.addColorStop(1, colors.end);

        // Draw outer glow (reduced blur for better performance)
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.start;

        // Draw rounded rectangle
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

        // Add inner highlight
        ctx.shadowBlur = 0;
        const highlightGradient = ctx.createLinearGradient(x, y, x + width / 2, y);
        highlightGradient.addColorStop(0, 'oklch(1 0 0 / 0.40)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fill();
      };

      // Draw left paddle with rounded corners and glow - always Farcaster purple
      drawRoundedPaddle(
        leftPaddle.x,
        leftPaddle.y,
        leftPaddle.width,
        leftPaddle.height,
        8,
        farcasterColor,
      );

      // Draw right paddle with rounded corners and glow - always Base blue
      drawRoundedPaddle(
        rightPaddle.x,
        rightPaddle.y,
        rightPaddle.width,
        rightPaddle.height,
        8,
        baseColor,
      );

      ctx.shadowBlur = 0;

      // Draw ball with enhanced glow
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

      // Draw scores with enhanced styling
      ctx.font = 'bold 56px Noto Sans';
      ctx.shadowBlur = 10;
      ctx.fillStyle = farcasterColor.start;
      ctx.shadowColor = farcasterColor.start;
      ctx.fillText(leftPaddle.score.toString(), CANVAS_WIDTH / 4 - 15, 70);
      ctx.fillStyle = baseColor.start;
      ctx.shadowColor = baseColor.start;
      ctx.fillText(rightPaddle.score.toString(), (CANVAS_WIDTH * 3) / 4 - 15, 70);
      ctx.shadowBlur = 0;

      // Draw countdown
      if (countdown > 0) {
        ctx.font = 'bold 80px Noto Sans';
        ctx.fillStyle = 'oklch(1 0 0 / 0.90)';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'oklch(0.59 0.17 297.31 / 1)';
        ctx.fillText(countdown.toString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
      }

      // Draw side selection screen
      if (!gameStarted) {
        ctx.fillStyle = 'oklch(0 0 0 / 0.85)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.font = 'bold 42px Noto Sans';
        ctx.fillStyle = 'oklch(1 0 0 / 1)';
        ctx.textAlign = 'center';
        ctx.fillText('Choose Your Side', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 80);

        // Left side button
        const leftButtonX = CANVAS_WIDTH / 4;
        const leftButtonY = CANVAS_HEIGHT / 2;
        ctx.fillStyle = 'oklch(0.59 0.17 297.31 / 0.30)';
        ctx.fillRect(leftButtonX - 100, leftButtonY - 40, 200, 80);
        ctx.strokeStyle = 'oklch(0.59 0.17 297.31 / 1)';
        ctx.lineWidth = 3;
        ctx.strokeRect(leftButtonX - 100, leftButtonY - 40, 200, 80);
        ctx.font = 'bold 32px Noto Sans';
        ctx.fillStyle = 'oklch(0.59 0.17 297.31 / 1)';
        ctx.fillText('Farcaster', leftButtonX, leftButtonY + 10);

        // Right side button
        const rightButtonX = (CANVAS_WIDTH * 3) / 4;
        const rightButtonY = CANVAS_HEIGHT / 2;
        ctx.fillStyle = 'oklch(0.45 0.31 264.05 / 0.30)';
        ctx.fillRect(rightButtonX - 100, rightButtonY - 40, 200, 80);
        ctx.strokeStyle = 'oklch(0.45 0.31 264.05 / 1)';
        ctx.lineWidth = 3;
        ctx.strokeRect(rightButtonX - 100, rightButtonY - 40, 200, 80);
        ctx.font = 'bold 32px Noto Sans';
        ctx.fillStyle = 'oklch(0.45 0.31 264.05 / 1)';
        ctx.fillText('Base', rightButtonX, rightButtonY + 10);

        ctx.font = '18px Noto Sans';
        ctx.fillStyle = 'oklch(0.68 0 0 / 1)';
        ctx.fillText('Click or tap a side to play!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
      }

      // Draw winner screen (simplified - buttons rendered in JSX)
      if (winner) {
        ctx.fillStyle = 'oklch(0 0 0 / 0.90)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.font = 'bold 64px Noto Sans';
        const winnerIsPlayer =
          (winner === 'left' && playerSide === 'left') ||
          (winner === 'right' && playerSide === 'right');
        ctx.fillStyle = winnerIsPlayer
          ? 'oklch(0.87 0.29 142.50 / 1)'
          : 'oklch(0.66 0.22 25.73 / 1)';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
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
        ctx.font = 'bold 48px Noto Sans';
        ctx.fillStyle = 'oklch(1 0 0 / 0.90)';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'oklch(1 0 0 / 1)';
        ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;
      }

      ctx.textAlign = 'left';
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
    (e: React.MouseEvent<HTMLCanvasElement>): void => {
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
    (e: React.TouchEvent<HTMLCanvasElement>): void => {
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

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>): void => {
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

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    touchControls.current.left.active = false;
    touchControls.current.right.active = false;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-black via-gray-900 to-black px-4 pb-8 pt-16 sm:pt-20">
      <div className="mb-6 text-center">
        <h1 className="mb-3 bg-linear-to-r from-(--gradient-brand-start) via-(--gradient-brand-mid) to-(--gradient-brand-end) bg-clip-text text-3xl font-bold text-transparent sm:text-5xl font-arcade">
          FARPONG
        </h1>
        {user && (
          <p className="text-white text-sm sm:text-base font-medium">
            Welcome,{' '}
            <span className="bg-linear-to-r from-(--gradient-brand-start) to-(--gradient-brand-end) bg-clip-text font-bold text-transparent">
              {user.displayName || user.username || `Player #${user.fid}`}
            </span>
            !
          </p>
        )}
        {!gameState.gameStarted && (
          <p className="text-gray-400 text-sm mt-2">Choose your side to begin!</p>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-auto max-h-[70vh] w-full max-w-full touch-none cursor-pointer rounded-xl border-4 border-gray-800 shadow-2xl transition-colors duration-300 hover:border-purple-500 aspect-4/3"
      />

      {gameState.winner ? (
        <div className="mt-6 flex flex-col gap-3 items-center w-full max-w-xs">
          <button
            onClick={resetGame}
            className="w-full px-5 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Play Again
          </button>
          <button
            onClick={onReturnToMenu}
            className="w-full px-5 py-3 bg-linear-to-r from-gray-700 to-gray-800 text-white text-sm font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🏠 Return to Menu
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 items-center w-full max-w-xs">
          {gameState.gameStarted && (
            <button
              onClick={() =>
                setGameState((prev: GameState) => ({ ...prev, isPaused: !prev.isPaused }))
              }
              className="w-full px-5 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
            >
              {gameState.isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
          <button
            onClick={resetGame}
            className="w-full px-5 py-3 bg-linear-to-r from-gray-700 to-gray-800 text-white text-sm font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Reset
          </button>
          <ControlsDisplay isMobile={isMobile} />
        </div>
      )}
    </div>
  );
}
