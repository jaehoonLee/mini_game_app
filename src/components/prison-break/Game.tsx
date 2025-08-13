'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Player from './Player';
import Prison from './Prison';
import Guard from './Guard';
import Leaderboard from '../Leaderboard';
import NameInputModal from '../NameInputModal';
import { updateGameScore, getHighScore, getLeaderboard, GAME_IDS, ScoreRecord, addTestData } from '../../utils/scoreManager';

export interface Position {
  x: number;
  y: number;
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GuardState {
  position: Position;
  isChasing: boolean;
  patrolPoints: Position[];
  currentPatrolIndex: number;
}

export interface GameState {
  playerPosition: Position;
  isGameRunning: boolean;
  score: number;
  level: number;
  gameOver: boolean;
  gameWon: boolean;
}

const Game: React.FC = () => {
  const router = useRouter();
  
  // Exit 지점 위치 정의
  const exitPosition = { x: 550, y: 350 }; // 우측 하단 근처
  const exitSize = 32; // Exit 지점 크기

  // 벽들의 위치 정보 정의 (Prison 컴포넌트와 정확히 일치)
  const walls: Wall[] = [
    // 외벽들
    { x: 0, y: 0, width: 600, height: 4 }, // 상단 벽
    { x: 0, y: 396, width: 600, height: 4 }, // 하단 벽
    { x: 0, y: 0, width: 4, height: 400 }, // 좌측 벽
    { x: 596, y: 0, width: 4, height: 400 }, // 우측 벽
    
    // 내부 벽들 (Tailwind CSS: top-5=20px, left-5=20px, w-32=128px, h-1=4px)
    { x: 20, y: 20, width: 128, height: 4 }, // 가로 벽 1 (top-5 left-5 w-32 h-1)
    { x: 40, y: 40, width: 4, height: 128 }, // 세로 벽 1 (top-10 left-10 w-1 h-32)
    { x: 60, y: 60, width: 192, height: 4 }, // 가로 벽 2 (top-15 left-15 w-48 h-1)
    { x: 80, y: 80, width: 4, height: 96 }, // 세로 벽 2 (top-20 left-20 w-1 h-24)
    
    // 감옥 바 (Tailwind CSS: top-30=120px, left-10=40px, w-32=128px, h-2=8px)
    { x: 40, y: 120, width: 128, height: 8 }, // 상단 바 (top-30 left-10 w-32 h-2)
    { x: 40, y: 120, width: 8, height: 64 }, // 좌측 바 (top-30 left-10 w-2 h-16)
    { x: 68, y: 120, width: 8, height: 64 }, // 우측 바 (top-30 left-17 w-2 h-16)
    { x: 40, y: 132, width: 128, height: 8 }, // 하단 바 (top-33 left-10 w-32 h-2)
    
    // 장애물들 (Tailwind CSS: top-25=100px, left-25=100px, w-6=24px, h-6=24px)
    { x: 100, y: 100, width: 24, height: 24 }, // 장애물 1 (top-25 left-25 w-6 h-6)
    { x: 200, y: 148, width: 24, height: 24 }, // 장애물 2 (top-37 left-50 w-6 h-6)
    { x: 148, y: 200, width: 24, height: 24 }, // 장애물 3 (top-50 left-37 w-6 h-6)
    { x: 300, y: 248, width: 24, height: 24 }, // 장애물 4 (top-62 left-75 w-6 h-6)
  ];

  const [gameState, setGameState] = useState<GameState>({
    playerPosition: { x: 50, y: 50 },
    isGameRunning: true,
    score: 0,
    level: 1,
    gameOver: false,
    gameWon: false
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [highScore, setHighScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);

  // 경비원 상태 초기화
  const [guard, setGuard] = useState<GuardState>({
    position: { x: 300, y: 200 },
    isChasing: false,
    patrolPoints: [
      { x: 300, y: 200 },
      { x: 500, y: 200 },
      { x: 500, y: 300 },
      { x: 300, y: 300 }
    ],
    currentPatrolIndex: 0
  });

  // 최고 점수와 리더보드 로드
  useEffect(() => {
    try {
      console.log('프리즌 브레이크 리더보드 로딩 시작...');
      const currentHighScore = getHighScore(GAME_IDS.PRISON_BREAK);
      const currentLeaderboard = getLeaderboard(GAME_IDS.PRISON_BREAK);
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

  // 벽 충돌 감지 함수
  const checkWallCollision = (newX: number, newY: number): boolean => {
    const playerSize = 6; // 플레이어 크기
    const playerRadius = playerSize / 2;
    
    // 플레이어의 새로운 경계 계산
    const playerLeft = newX - playerRadius;
    const playerRight = newX + playerRadius;
    const playerTop = newY - playerRadius;
    const playerBottom = newY + playerRadius;

    // 모든 벽과 충돌 검사
    for (const wall of walls) {
      const wallLeft = wall.x;
      const wallRight = wall.x + wall.width;
      const wallTop = wall.y;
      const wallBottom = wall.y + wall.height;

      // 충돌 검사 (AABB 충돌 감지)
      if (playerRight > wallLeft && 
          playerLeft < wallRight && 
          playerBottom > wallTop && 
          playerTop < wallBottom) {
        return true; // 충돌 발생
      }
    }
    
    return false; // 충돌 없음
  };

  // 경비원과 플레이어 충돌 감지 함수
  const checkGuardCollision = (playerPos: Position, guardPos: Position): boolean => {
    const distance = Math.sqrt(
      Math.pow(playerPos.x - guardPos.x, 2) + Math.pow(playerPos.y - guardPos.y, 2)
    );
    return distance < 12; // 플레이어와 경비원 반지름 합
  };

  // Exit 지점 충돌 감지 함수
  const checkExitCollision = (playerPos: Position): boolean => {
    const playerSize = 6;
    const playerRadius = playerSize / 2;
    
    // 플레이어의 경계 계산
    const playerLeft = playerPos.x - playerRadius;
    const playerRight = playerPos.x + playerRadius;
    const playerTop = playerPos.y - playerRadius;
    const playerBottom = playerPos.y + playerRadius;

    // Exit 지점의 경계 계산
    const exitLeft = exitPosition.x - exitSize / 2;
    const exitRight = exitPosition.x + exitSize / 2;
    const exitTop = exitPosition.y - exitSize / 2;
    const exitBottom = exitPosition.y + exitSize / 2;

    // 충돌 검사 (AABB 충돌 감지)
    return playerRight > exitLeft && 
           playerLeft < exitRight && 
           playerBottom > exitTop && 
           playerTop < exitBottom;
  };

  // 경비원 AI 로직
  const updateGuardAI = () => {
    setGuard(prevGuard => {
      const detectionRange = 80; // 경비원 시야 범위
      const playerDistance = Math.sqrt(
        Math.pow(gameState.playerPosition.x - prevGuard.position.x, 2) + 
        Math.pow(gameState.playerPosition.y - prevGuard.position.y, 2)
      );

      let newIsChasing = prevGuard.isChasing;
      let newPosition = { ...prevGuard.position };
      let newPatrolIndex = prevGuard.currentPatrolIndex;

      // 플레이어 감지
      if (playerDistance < detectionRange) {
        newIsChasing = true;
      } else if (playerDistance > detectionRange * 1.5) {
        newIsChasing = false;
      }

      if (newIsChasing) {
        // 플레이어 추적
        const dx = gameState.playerPosition.x - prevGuard.position.x;
        const dy = gameState.playerPosition.y - prevGuard.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const moveSpeed = 1.5; // 경비원 이동 속도
          const moveX = (dx / distance) * moveSpeed;
          const moveY = (dy / distance) * moveSpeed;
          
          const newX = prevGuard.position.x + moveX;
          const newY = prevGuard.position.y + moveY;
          
          // 경비원도 벽을 통과할 수 없도록
          if (!checkWallCollision(newX, newY)) {
            newPosition = { x: newX, y: newY };
          }
        }
      } else {
        // 순찰 모드
        const targetPatrolPoint = prevGuard.patrolPoints[prevGuard.currentPatrolIndex];
        const dx = targetPatrolPoint.x - prevGuard.position.x;
        const dy = targetPatrolPoint.y - prevGuard.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
          // 다음 순찰 지점으로 이동
          newPatrolIndex = (prevGuard.currentPatrolIndex + 1) % prevGuard.patrolPoints.length;
        } else {
          const moveSpeed = 1;
          const moveX = (dx / distance) * moveSpeed;
          const moveY = (dy / distance) * moveSpeed;
          
          const newX = prevGuard.position.x + moveX;
          const newY = prevGuard.position.y + moveY;
          
          if (!checkWallCollision(newX, newY)) {
            newPosition = { x: newX, y: newY };
          }
        }
      }

      return {
        ...prevGuard,
        position: newPosition,
        isChasing: newIsChasing,
        currentPatrolIndex: newPatrolIndex
      };
    });
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(event.key.toLowerCase()));
  }, []);

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

        let newX = prev.playerPosition.x;
        let newY = prev.playerPosition.y;
        const moveSpeed = 2;

        // 각 방향별로 개별적으로 충돌 검사
        if (keys.has('w') || keys.has('arrowup')) {
          const testY = Math.max(0, newY - moveSpeed);
          if (!checkWallCollision(newX, testY)) {
            newY = testY;
          }
        }
        if (keys.has('s') || keys.has('arrowdown')) {
          const testY = Math.min(400, newY + moveSpeed);
          if (!checkWallCollision(newX, testY)) {
            newY = testY;
          }
        }
        if (keys.has('a') || keys.has('arrowleft')) {
          const testX = Math.max(0, newX - moveSpeed);
          if (!checkWallCollision(testX, newY)) {
            newX = testX;
          }
        }
        if (keys.has('d') || keys.has('arrowright')) {
          const testX = Math.min(600, newX + moveSpeed);
          if (!checkWallCollision(testX, newY)) {
            newX = testX;
          }
        }

        const newPlayerPosition = { x: newX, y: newY };

        // Exit 지점 충돌 검사 (승리 조건)
        if (checkExitCollision(newPlayerPosition)) {
          const finalScore = prev.score + 1000; // 탈출 보너스
          console.log('게임 승리! 모달 호출:', finalScore);
          setPendingScore(finalScore);
          setShowNameModal(true);
          
          return {
            ...prev,
            gameWon: true,
            isGameRunning: false,
            score: finalScore
          };
        }

        // 경비원과 충돌 검사 (패배 조건)
        if (checkGuardCollision(newPlayerPosition, guard.position)) {
          console.log('게임 오버! 모달 호출:', prev.score);
          setPendingScore(prev.score);
          setShowNameModal(true);
          
          return {
            ...prev,
            gameOver: true,
            isGameRunning: false
          };
        }

        return {
          ...prev,
          playerPosition: newPlayerPosition
        };
      });

      // 경비원 AI 업데이트
      updateGuardAI();
    }, 16); // 약 60 FPS

    return () => clearInterval(gameLoop);
  }, [keys, gameState.isGameRunning, gameState.gameOver, gameState.gameWon, guard.position]);

  const handleNameSubmit = (name: string) => {
    const updatedScore = updateGameScore(GAME_IDS.PRISON_BREAK, pendingScore, name);
    setHighScore(updatedScore.highScore);
    setLeaderboard(updatedScore.leaderboard);
    setShowNameModal(false);
  };

  const handleNameModalClose = () => {
    setShowNameModal(false);
  };

  const resetGame = () => {
    setGameState({
      playerPosition: { x: 50, y: 50 },
      isGameRunning: true,
      score: 0,
      level: 1,
      gameOver: false,
      gameWon: false
    });
    setGuard({
      position: { x: 300, y: 200 },
      isChasing: false,
      patrolPoints: [
        { x: 300, y: 200 },
        { x: 500, y: 200 },
        { x: 500, y: 300 },
        { x: 300, y: 300 }
      ],
      currentPatrolIndex: 0
    });
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
            <h1 className="text-3xl font-bold text-white mb-3 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🏃‍♂️ 프리즌 브레이크 🏃‍♂️
            </h1>
            <div className="text-white text-center mb-4">
              <div className="text-lg font-semibold mb-2">
                점수: <span className="text-green-400">{gameState.score}</span> | 
                레벨: <span className="text-blue-400">{gameState.level}</span> | 
                최고 점수: <span className="text-yellow-400">{highScore}</span>
              </div>
              <div className="text-gray-300 text-sm">
                WASD 또는 방향키로 이동하세요 | 초록색 EXIT에 도착하세요!
              </div>
            </div>
            {gameState.gameOver && (
              <div className="text-red-400 text-center font-bold text-lg bg-red-500/10 border border-red-500/30 rounded-lg py-2">
                🚨 경비원에게 잡혔습니다! 🚨
              </div>
            )}
            {gameState.gameWon && (
              <div className="text-green-400 text-center font-bold text-lg bg-green-500/10 border border-green-500/30 rounded-lg py-2">
                🎉 탈출 성공! 자유를 찾았습니다! 🎉
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
                className="w-[600px] h-[400px] relative"
                style={{ background: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <Prison />
                <Player position={gameState.playerPosition} />
                <Guard position={guard.position} isChasing={guard.isChasing} />
              </div>
            </div>
          </div>

          {/* 리더보드 영역 */}
          <div className="lg:col-span-1">
            <Leaderboard leaderboard={leaderboard} gameTitle="프리즌 브레이크" />
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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
              addTestData(GAME_IDS.PRISON_BREAK);
              // 리더보드 새로고침
              const currentHighScore = getHighScore(GAME_IDS.PRISON_BREAK);
              const currentLeaderboard = getLeaderboard(GAME_IDS.PRISON_BREAK);
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
