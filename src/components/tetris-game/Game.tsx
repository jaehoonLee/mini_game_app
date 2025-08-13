'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '../GameLayout';
import NameInputModal from '../NameInputModal';
import { updateGameScore, getHighScore, getLeaderboard, GAME_IDS, ScoreRecord } from '../../utils/scoreManager';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: number[][];
  position: Position;
  color: string;
}

export interface GameState {
  board: number[][];
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isGameStarted: boolean;
}

// 테트리스 블록 모양들
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-500'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-500'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-500'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  }
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isGameStarted: false
  });

  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);

  // gameState의 최신 값을 참조하기 위한 ref
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // 키 입력 디바운싱을 위한 ref
  const lastKeyTime = useRef<number>(0);
  const KEY_DEBOUNCE_TIME = 50; // 50ms 디바운스

  // 최고 점수와 리더보드 로드
  useEffect(() => {
    try {
      console.log('테트리스 게임 리더보드 로딩 시작...');
      const currentHighScore = getHighScore(GAME_IDS.TETRIS);
      const currentLeaderboard = getLeaderboard(GAME_IDS.TETRIS);
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

  // 랜덤 테트로미노 생성
  const createRandomTetromino = (): Tetromino => {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const tetromino = TETROMINOS[randomPiece as keyof typeof TETROMINOS];
    
    return {
      shape: tetromino.shape,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2), y: 0 },
      color: tetromino.color
    };
  };

  // 보드에 조각 배치
  const placePiece = (board: number[][], piece: Tetromino): number[][] => {
    const newBoard = board.map(row => [...row]);
    
    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = 1;
          }
        }
      });
    });
    
    return newBoard;
  };

  // 충돌 검사
  const checkCollision = (board: number[][], piece: Tetromino, offsetX = 0, offsetY = 0): boolean => {
    return piece.shape.some((row, y) => {
      return row.some((cell, x) => {
        if (!cell) return false;
        
        const newX = piece.position.x + x + offsetX;
        const newY = piece.position.y + y + offsetY;
        
        return (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        );
      });
    });
  };

  // 라인 클리어 검사
  const clearLines = (board: number[][]): { newBoard: number[][], linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      const isFull = row.every(cell => cell);
      if (isFull) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    // 클리어된 라인만큼 빈 라인 추가
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  };

  // 조각 회전
  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    return { ...piece, shape: rotated };
  };

  const startGame = () => {
    console.log('테트리스 게임 시작!');
    const firstPiece = createRandomTetromino();
    const nextPiece = createRandomTetromino();
    
    setGameState({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      isGameStarted: true
    });
  };

  const resetGame = () => {
    const firstPiece = createRandomTetromino();
    const nextPiece = createRandomTetromino();
    
    setGameState({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
      currentPiece: firstPiece,
      nextPiece: nextPiece,
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      isGameStarted: true
    });
  };

  // 키보드 입력 처리
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!gameStateRef.current.isGameStarted || gameStateRef.current.gameOver) return;
    
    // 디바운싱 체크
    const now = Date.now();
    if (now - lastKeyTime.current < KEY_DEBOUNCE_TIME) {
      return;
    }
    lastKeyTime.current = now;
    
    event.preventDefault();
    
    setGameState(prev => {
      if (!prev.currentPiece) return prev;
      
      let newPiece = { ...prev.currentPiece };
      const newBoard = [...prev.board];
      let newScore = prev.score;
      const newLines = prev.lines;
      const newLevel = prev.level;
      const newNextPiece = prev.nextPiece;
      const gameOver = prev.gameOver;
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (!checkCollision(prev.board, prev.currentPiece, -1, 0)) {
            newPiece.position.x -= 1;
          }
          break;
          
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!checkCollision(prev.board, prev.currentPiece, 1, 0)) {
            newPiece.position.x += 1;
          }
          break;
          
        case 'ArrowDown':
        case 's':
        case 'S':
          if (!checkCollision(prev.board, prev.currentPiece, 0, 1)) {
            newPiece.position.y += 1;
            newScore += 1; // 소프트 드롭 점수
          }
          break;
          
        case 'ArrowUp':
        case 'w':
        case 'W':
          const rotated = rotatePiece(prev.currentPiece);
          if (!checkCollision(prev.board, rotated)) {
            newPiece = rotated;
          }
          break;
          
        case ' ':
          // 하드 드롭
          while (!checkCollision(prev.board, newPiece, 0, 1)) {
            newPiece.position.y += 1;
            newScore += 2; // 하드 드롭 점수
          }
          break;
      }
      
      return {
        ...prev,
        currentPiece: newPiece,
        board: newBoard,
        score: newScore,
        lines: newLines,
        level: newLevel,
        nextPiece: newNextPiece,
        gameOver: gameOver
      };
    });
  }, []); // 의존성 배열을 비워서 함수가 재생성되지 않도록 함

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 게임 루프
  useEffect(() => {
    console.log('게임 루프 체크:', { isGameStarted: gameState.isGameStarted, gameOver: gameState.gameOver });
    if (!gameState.isGameStarted || gameState.gameOver) return;

    console.log('게임 루프 시작!');
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (!prev.currentPiece) return prev;
        
        // 조각을 한 칸 아래로 이동
        if (!checkCollision(prev.board, prev.currentPiece, 0, 1)) {
          return {
            ...prev,
            currentPiece: { ...prev.currentPiece, position: { ...prev.currentPiece.position, y: prev.currentPiece.position.y + 1 } }
          };
        }
        
        // 충돌이 발생하면 조각을 보드에 배치
        const newBoard = placePiece(prev.board, prev.currentPiece);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        // 점수 계산
        let newScore = prev.score;
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        if (linesCleared > 0) {
          const lineScores = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4줄 클리어 점수
          newScore += lineScores[linesCleared] * newLevel;
        }
        
        // 다음 조각 생성
        const nextPiece = prev.nextPiece || createRandomTetromino();
        const currentPiece = createRandomTetromino();
        
        // 게임 오버 검사
        const gameOver = checkCollision(clearedBoard, currentPiece);
        
        if (gameOver) {
          console.log('게임 오버! 모달 호출:', newScore);
          setPendingScore(newScore);
          setShowNameModal(true);
        }
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: gameOver ? null : currentPiece,
          nextPiece: gameOver ? null : createRandomTetromino(),
          score: newScore,
          lines: newLines,
          level: newLevel,
          gameOver: gameOver
        };
      });
    }, Math.max(100, 1000 - (gameState.level - 1) * 100)); // 레벨에 따라 속도 증가

    return () => {
      console.log('게임 루프 정리');
      clearInterval(gameLoop);
    };
  }, [gameState.isGameStarted, gameState.gameOver, gameState.level]);

  const handleNameSubmit = (name: string) => {
    const updatedScore = updateGameScore(GAME_IDS.TETRIS, pendingScore, name);
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

  // 보드 렌더링
  const renderBoard = () => {
    const displayBoard = gameState.board.map(row => [...row]);
    
    // 현재 조각을 보드에 임시로 표시
    if (gameState.currentPiece) {
      gameState.currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardY = gameState.currentPiece!.position.y + y;
            const boardX = gameState.currentPiece!.position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 1;
            }
          }
        });
      });
    }
    
    return (
      <div className="grid grid-cols-10 gap-px bg-gray-800 p-2 rounded">
        {displayBoard.map((row, y) => 
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-6 h-6 ${
                cell ? 'bg-blue-500 border border-blue-400' : 'bg-gray-900'
              }`}
            />
          ))
        )}
      </div>
    );
  };

  // 다음 조각 렌더링
  const renderNextPiece = () => {
    if (!gameState.nextPiece) return null;
    
    return (
      <div className="grid grid-cols-4 gap-px bg-gray-800 p-2 rounded">
        {gameState.nextPiece.shape.map((row, y) => 
          row.map((cell, x) => (
            <div
              key={`next-${y}-${x}`}
              className={`w-4 h-4 ${
                cell ? 'bg-blue-500 border border-blue-400' : 'bg-gray-900'
              }`}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <>
      <GameLayout
        gameTitle="🧩 테트리스"
        leaderboard={leaderboard}
        showGameOverOverlay={gameState.gameOver}
        gameOverTitle="💀 게임 오버!"
        gameOverMessage="더 이상 블록을 놓을 공간이 없습니다!"
        finalScore={gameState.score}
        onRestart={resetGame}
        onMainMenu={onMainMenu}
        restartButtonColor="from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        showStartScreen={!gameState.isGameStarted}
        startScreenTitle="🧩 테트리스"
        startScreenMessage="방향키로 블록을 조작하세요! 줄을 완성하여 점수를 얻으세요!"
        onStartGame={startGame}
        highScore={highScore}
      >
        {/* 게임 요소들 */}
        {gameState.isGameStarted && (
          <div className="flex justify-center items-start space-x-8 p-8">
            {/* 메인 게임 보드 */}
            <div className="text-center">
              <h3 className="text-white text-lg font-bold mb-4">게임 보드</h3>
              {renderBoard()}
            </div>
            
            {/* 게임 정보 */}
            <div className="text-white space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">다음 블록</h3>
                {renderNextPiece()}
              </div>
              
              <div className="space-y-2">
                <div className="text-yellow-400">
                  <span className="font-bold">점수:</span> {gameState.score}
                </div>
                <div className="text-green-400">
                  <span className="font-bold">레벨:</span> {gameState.level}
                </div>
                <div className="text-blue-400">
                  <span className="font-bold">라인:</span> {gameState.lines}
                </div>
              </div>
              
              <div className="text-gray-400 text-sm space-y-1">
                <div>← → : 이동</div>
                <div>↓ : 빠른 하강</div>
                <div>↑ : 회전</div>
                <div>스페이스 : 즉시 하강</div>
              </div>
            </div>
          </div>
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
