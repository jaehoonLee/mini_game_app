'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Snake from './Snake';
import Apple from './Apple';
import GameLayout from '../GameLayout';
import NameInputModal from '../NameInputModal';
import { updateGameScore, getHighScore, getLeaderboard, GAME_IDS, ScoreRecord } from '../../utils/scoreManager';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  apple: Position;
  direction: string;
  score: number;
  gameOver: boolean;
  gameWon: boolean;
  isGameStarted: boolean;
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    apple: { x: 15, y: 15 },
    direction: 'right',
    score: 0,
    gameOver: false,
    gameWon: false,
    isGameStarted: false
  });

  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);

  // 게임 크기를 동적으로 계산
  const getGameDimensions = () => {
    if (typeof window === 'undefined') return { width: 800, height: 600 };
    
    const maxWidth = Math.min(window.innerWidth - 48, 1200); // 48px는 패딩
    const maxHeight = window.innerHeight - 80; // 80px는 상단 네비게이션과 패딩
    
    // 정사각형 비율 유지
    const size = Math.min(maxWidth, maxHeight);
    return { width: size, height: size };
  };

  const { width: gameWidth, height: gameHeight } = getGameDimensions();
  const cellSize = Math.floor(gameWidth / 40); // 40x40 그리드

  // 최고 점수와 리더보드 로드
  useEffect(() => {
    try {
      console.log('스네이크 게임 리더보드 로딩 시작...');
      const currentHighScore = getHighScore(GAME_IDS.SNAKE);
      const currentLeaderboard = getLeaderboard(GAME_IDS.SNAKE);
      console.log('로드된 최고 점수:', currentHighScore);
      console.log('로드된 리더보드:', currentLeaderboard);
      setHighScore(currentHighScore);
      setLeaderboard(currentLeaderboard);
    } catch (error) {
      console.error('리더보드 로딩 오류:', error);
      setHighScore(0);
      setLeaderboard([]);
    }
  }, []);

  const generateApple = (snake: Position[]): Position => {
    const maxX = Math.floor(gameWidth / cellSize);
    const maxY = Math.floor(gameHeight / cellSize);
    let newApple: Position;
    
    do {
      newApple = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
      };
    } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
    
    return newApple;
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameStarted: true
    }));
  };

  const resetGame = () => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      apple: { x: 15, y: 15 },
      direction: 'right',
      score: 0,
      gameOver: false,
      gameWon: false,
      isGameStarted: true
    });
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameState.isGameStarted) return;
    
    event.preventDefault();
    setGameState(prev => {
      let newDirection = prev.direction;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (prev.direction !== 'down') newDirection = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (prev.direction !== 'up') newDirection = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (prev.direction !== 'right') newDirection = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (prev.direction !== 'left') newDirection = 'right';
          break;
      }
      
      return { ...prev, direction: newDirection };
    });
  }, [gameState.isGameStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameState.isGameStarted || gameState.gameOver || gameState.gameWon) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.gameOver || prev.gameWon) return prev;

        const newSnake = [...prev.snake];
        const head = { ...newSnake[0] };

        // 뱀 머리 이동
        switch (prev.direction) {
          case 'up':
            head.y -= 1;
            break;
          case 'down':
            head.y += 1;
            break;
          case 'left':
            head.x -= 1;
            break;
          case 'right':
            head.x += 1;
            break;
        }

        // 벽 충돌 검사
        const maxX = Math.floor(gameWidth / cellSize);
        const maxY = Math.floor(gameHeight / cellSize);
        
        if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
          console.log('게임 오버! 모달 호출:', prev.score);
          setPendingScore(prev.score);
          setShowNameModal(true);
          return { ...prev, gameOver: true };
        }

        // 자기 자신과 충돌 검사
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          console.log('게임 오버! 모달 호출:', prev.score);
          setPendingScore(prev.score);
          setShowNameModal(true);
          return { ...prev, gameOver: true };
        }

        newSnake.unshift(head);

        // 사과 먹기 검사
        let newApple = prev.apple;
        let newScore = prev.score;
        let newGameWon: boolean = prev.gameWon;

        if (head.x === prev.apple.x && head.y === prev.apple.y) {
          newApple = generateApple(newSnake);
          newScore = prev.score + 10;
          
          // 승리 조건: 모든 칸을 채웠을 때
          const totalCells = maxX * maxY;
          if (newSnake.length >= totalCells) {
            console.log('게임 승리! 모달 호출:', newScore);
            setPendingScore(newScore);
            setShowNameModal(true);
            newGameWon = true;
          }
        } else {
          newSnake.pop();
        }

        return {
          ...prev,
          snake: newSnake,
          apple: newApple,
          score: newScore,
          gameWon: newGameWon
        };
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [gameState.isGameStarted, gameState.gameOver, gameState.gameWon, gameState.direction]);

  const handleNameSubmit = (name: string) => {
    const updatedScore = updateGameScore(GAME_IDS.SNAKE, pendingScore, name);
    setHighScore(updatedScore.highScore);
    setLeaderboard(updatedScore.leaderboard);
    setShowNameModal(false);
  };

  const handleNameModalClose = () => {
    setShowNameModal(false);
  };

  const onMainMenu = () => {
    // 메인 메뉴로 이동하는 로직은 GameLayout에서 처리됨
  };

  return (
    <>
      <GameLayout
        gameTitle="🐍 스네이크 게임"
        leaderboard={leaderboard}
        showGameOverOverlay={gameState.gameOver || gameState.gameWon}
        gameOverTitle={gameState.gameWon ? '🎉 승리!' : '💀 게임 오버!'}
        gameOverMessage={gameState.gameWon 
          ? '완벽한 승리! 모든 칸을 채웠습니다!' 
          : '뱀이 충돌했습니다!'
        }
        finalScore={gameState.score}
        onRestart={resetGame}
        onMainMenu={onMainMenu}
        restartButtonColor="from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        showStartScreen={!gameState.isGameStarted}
        startScreenTitle="🐍 스네이크 게임"
        startScreenMessage="방향키로 뱀을 조작하세요! 사과를 먹어서 뱀을 길게 만드세요!"
        onStartGame={startGame}
        highScore={highScore}
      >
        {/* 게임 요소들 */}
        {gameState.isGameStarted && (
          <>
            <Snake snake={gameState.snake} cellSize={cellSize} />
            <Apple position={gameState.apple} cellSize={cellSize} />
          </>
        )}
      </GameLayout>

      {/* 이름 입력 모달 */}
      <NameInputModal
        isOpen={showNameModal}
        score={pendingScore}
        onSubmit={handleNameSubmit}
        onClose={handleNameModalClose}
      />
    </>
  );
};

export default Game;
