'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Snake from './Snake';
import Apple from './Apple';
import Leaderboard from '../Leaderboard';
import NameInputModal from '../NameInputModal';
import { updateGameScore, getHighScore, getLeaderboard, GAME_IDS, ScoreRecord, addTestData } from '../../utils/scoreManager';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  apple: Position;
  direction: string;
  isGameRunning: boolean;
  score: number;
  gameOver: boolean;
  gameWon: boolean;
}

const Game: React.FC = () => {
  const router = useRouter();
  
  const gridSize = 20;
  const cellSize = 20;
  const gameWidth = gridSize * cellSize;
  const gameHeight = gridSize * cellSize;

  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }],
    apple: { x: 5, y: 5 },
    direction: 'right',
    isGameRunning: true,
    score: 0,
    gameOver: false,
    gameWon: false
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);
  const [nextDirection, setNextDirection] = useState<string>('right');

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
      // 오류 발생 시 기본값 설정
      setHighScore(0);
      setLeaderboard([]);
    }
  }, []);

  // 랜덤 위치 생성 함수
  const generateRandomPosition = (): Position => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  };

  // 새로운 사과 생성 함수
  const generateNewApple = (snake: Position[]): Position => {
    let newApple: Position;
    do {
      newApple = generateRandomPosition();
    } while (snake.some(segment => segment.x === newApple.x && segment.y === newApple.y));
    return newApple;
  };

  // 충돌 감지 함수
  const checkCollision = (head: Position, snake: Position[]): boolean => {
    // 벽과의 충돌
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true;
    }
    
    // 자기 자신과의 충돌 (머리를 제외한 몸통과)
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  };

  // 게임 승리 조건 체크
  const checkWinCondition = (snake: Position[]): boolean => {
    return snake.length >= gridSize * gridSize; // 모든 칸을 다 채웠을 때
  };

  // 방향 전환 유효성 검사
  const isValidDirectionChange = (currentDir: string, newDir: string): boolean => {
    const oppositeDirections = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };
    return oppositeDirections[newDir as keyof typeof oppositeDirections] !== currentDir;
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    event.preventDefault(); // 기본 동작 방지
    
    const key = event.key.toLowerCase();
    setKeys(prev => new Set(prev).add(key));

    // 방향키 입력 처리
    if (gameState.isGameRunning && !gameState.gameOver && !gameState.gameWon) {
      let newDirection = gameState.direction;

      switch (key) {
        case 'w':
        case 'arrowup':
          if (isValidDirectionChange(gameState.direction, 'up')) {
            newDirection = 'up';
          }
          break;
        case 's':
        case 'arrowdown':
          if (isValidDirectionChange(gameState.direction, 'down')) {
            newDirection = 'down';
          }
          break;
        case 'a':
        case 'arrowleft':
          if (isValidDirectionChange(gameState.direction, 'left')) {
            newDirection = 'left';
          }
          break;
        case 'd':
        case 'arrowright':
          if (isValidDirectionChange(gameState.direction, 'right')) {
            newDirection = 'right';
          }
          break;
      }

      if (newDirection !== gameState.direction) {
        setNextDirection(newDirection);
      }
    }
  }, [gameState.isGameRunning, gameState.gameOver, gameState.gameWon, gameState.direction]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(event.key.toLowerCase());
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!gameState.isGameRunning || gameState.gameOver || gameState.gameWon) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.gameOver || prev.gameWon) return prev;

        // 다음 방향으로 업데이트
        const currentDirection = nextDirection;

        // 새로운 머리 위치 계산
        const head = { ...prev.snake[0] };
        switch (currentDirection) {
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

        // 충돌 검사
        if (checkCollision(head, prev.snake)) {
          setPendingScore(prev.score);
          setShowNameModal(true);
          
          return {
            ...prev,
            gameOver: true,
            isGameRunning: false
          };
        }

        // 새로운 뱀 몸통 생성
        const newSnake = [head, ...prev.snake];

        // 사과 먹기 검사
        let newApple = prev.apple;
        let newScore = prev.score;

        if (head.x === prev.apple.x && head.y === prev.apple.y) {
          // 사과를 먹었을 때
          newScore += 10;
          newApple = generateNewApple(newSnake);
          
          // 승리 조건 체크
          if (checkWinCondition(newSnake)) {
            const finalScore = newScore + 1000; // 승리 보너스
            setPendingScore(finalScore);
            setShowNameModal(true);
            
            return {
              ...prev,
              snake: newSnake,
              apple: newApple,
              direction: currentDirection,
              score: finalScore,
              gameWon: true,
              isGameRunning: false
            };
          }
        } else {
          // 사과를 먹지 않았을 때는 꼬리 제거
          newSnake.pop();
        }

        return {
          ...prev,
          snake: newSnake,
          apple: newApple,
          direction: currentDirection,
          score: newScore
        };
      });
    }, 150); // 게임 속도 (낮을수록 빠름)

    return () => clearInterval(gameLoop);
  }, [nextDirection, gameState.isGameRunning, gameState.gameOver, gameState.gameWon]);

  const handleNameSubmit = (name: string) => {
    const updatedScore = updateGameScore(GAME_IDS.SNAKE, pendingScore, name);
    setHighScore(updatedScore.highScore);
    setLeaderboard(updatedScore.leaderboard);
    setShowNameModal(false);
  };

  const handleNameModalClose = () => {
    setShowNameModal(false);
  };

  const resetGame = () => {
    setGameState({
      snake: [{ x: 10, y: 10 }],
      apple: generateRandomPosition(),
      direction: 'right',
      isGameRunning: true,
      score: 0,
      gameOver: false,
      gameWon: false
    });
    setNextDirection('right');
  };

  const goToMainMenu = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 상단 네비게이션 */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={goToMainMenu}
          className="bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <span>←</span>
          <span>메인 메뉴</span>
        </button>
      </div>

      {/* 게임 헤더 */}
      <div className="pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-3 text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              🐍 스네이크 게임 🐍
            </h1>
            <div className="text-white text-center mb-4">
              <div className="text-lg font-semibold mb-2">
                점수: <span className="text-green-400">{gameState.score}</span> | 
                길이: <span className="text-blue-400">{gameState.snake.length}</span> | 
                최고 점수: <span className="text-yellow-400">{highScore}</span>
              </div>
              <div className="text-gray-300 text-sm mb-2">
                WASD 또는 방향키로 뱀을 조작하세요 | 사과를 먹어서 길게 만드세요!
              </div>
              <div className="text-gray-400 text-xs">
                현재 방향: <span className="text-blue-300">{gameState.direction.toUpperCase()}</span>
              </div>
            </div>
            {gameState.gameOver && (
              <div className="text-red-400 text-center font-bold text-lg bg-red-500/10 border border-red-500/30 rounded-lg py-2">
                💀 게임 오버! 뱀이 충돌했습니다! 💀
              </div>
            )}
            {gameState.gameWon && (
              <div className="text-green-400 text-center font-bold text-lg bg-green-500/10 border border-green-500/30 rounded-lg py-2">
                🎉 완벽한 승리! 모든 칸을 채웠습니다! 🎉
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 게임과 리더보드 레이아웃 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 게임 영역 */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="relative bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-2xl overflow-hidden shadow-2xl">
              <div 
                className="relative bg-gray-900"
                style={{ 
                  width: `${gameWidth}px`, 
                  height: `${gameHeight}px`,
                  background: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <Snake snake={gameState.snake} cellSize={cellSize} />
                <Apple position={gameState.apple} cellSize={cellSize} />
              </div>
            </div>
          </div>

          {/* 리더보드 영역 */}
          <div className="lg:col-span-1">
            <Leaderboard leaderboard={leaderboard} gameTitle="스네이크 게임" />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {gameState.gameOver || gameState.gameWon ? '다시 시작' : '게임 재시작'}
          </button>
          <button
            onClick={goToMainMenu}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            다른 게임 하기
          </button>
          {/* 임시 테스트 버튼 */}
          <button
            onClick={() => {
              addTestData(GAME_IDS.SNAKE);
              // 리더보드 새로고침
              const currentHighScore = getHighScore(GAME_IDS.SNAKE);
              const currentLeaderboard = getLeaderboard(GAME_IDS.SNAKE);
              setHighScore(currentHighScore);
              setLeaderboard(currentLeaderboard);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            테스트 데이터 추가
          </button>
        </div>
      </div>

      {/* 이름 입력 모달 */}
      <NameInputModal
        isOpen={showNameModal}
        score={pendingScore}
        onSubmit={handleNameSubmit}
        onClose={handleNameModalClose}
      />
    </div>
  );
};

export default Game;
