'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Player from './Player';
import Prison from './Prison';
import Guard from './Guard';
import GameLayout from '../GameLayout';
import NameInputModal from '../NameInputModal';
import { updateGameScore, getHighScore, getLeaderboard, GAME_IDS, ScoreRecord } from '../../utils/scoreManager';

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
  isGameStarted: boolean;
}

const Game: React.FC = () => {
  const gameWidth = 900;
  const gameHeight = 600;
  
  // Exit 지점 위치 정의
  const exitPosition = { x: 825, y: 525 }; // 우측 하단 근처 (게임 크기 증가에 맞춰 조정)
  const exitSize = 48; // Exit 지점 크기 (게임 크기 증가에 맞춰 조정)

  // 벽들의 위치 정보 정의 (Prison 컴포넌트와 정확히 일치)
  const walls: Wall[] = [
    // 외벽들 (게임 크기 증가에 맞춰 조정)
    { x: 0, y: 0, width: 900, height: 6 }, // 상단 벽
    { x: 0, y: 594, width: 900, height: 6 }, // 하단 벽
    { x: 0, y: 0, width: 6, height: 600 }, // 좌측 벽
    { x: 894, y: 0, width: 6, height: 600 }, // 우측 벽
    
    // 내부 벽들 (게임 크기 증가에 맞춰 조정)
    { x: 30, y: 30, width: 192, height: 6 }, // 가로 벽 1
    { x: 60, y: 60, width: 6, height: 192 }, // 세로 벽 1
    { x: 90, y: 90, width: 288, height: 6 }, // 가로 벽 2
    { x: 120, y: 120, width: 6, height: 144 }, // 세로 벽 2
    
    // 감옥 바 (게임 크기 증가에 맞춰 조정)
    { x: 60, y: 180, width: 192, height: 12 }, // 상단 바
    { x: 60, y: 180, width: 12, height: 96 }, // 좌측 바
    { x: 102, y: 180, width: 12, height: 96 }, // 우측 바
    { x: 60, y: 198, width: 192, height: 12 }, // 하단 바
    
    // 장애물들 (게임 크기 증가에 맞춰 조정)
    { x: 150, y: 150, width: 36, height: 36 }, // 장애물 1
    { x: 300, y: 222, width: 36, height: 36 }, // 장애물 2
    { x: 222, y: 300, width: 36, height: 36 }, // 장애물 3
    { x: 450, y: 372, width: 36, height: 36 }, // 장애물 4
  ];

  const [gameState, setGameState] = useState<GameState>({
    playerPosition: { x: 50, y: 50 },
    isGameRunning: true,
    score: 0,
    level: 1,
    gameOver: false,
    gameWon: false,
    isGameStarted: false
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
          const testY = Math.min(600, newY + moveSpeed); // 게임 크기 600에 맞춰 조정
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
          const testX = Math.min(900, newX + moveSpeed); // 게임 크기 900에 맞춰 조정
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
      gameWon: false,
      isGameStarted: true
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

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameStarted: true,
      isGameRunning: true
    }));
  };

  const onMainMenu = () => {
    // 메인 메뉴로 이동하는 로직은 GameLayout에서 처리됨
  };

  return (
    <>
      <GameLayout
        gameTitle="🏃‍♂️ 프리즌 브레이크"
        leaderboard={leaderboard}
        gameWidth={gameWidth}
        gameHeight={gameHeight}
        showGameOverOverlay={gameState.gameOver || gameState.gameWon}
        gameOverTitle={gameState.gameWon ? '🎉 탈출 성공!' : '💀 게임 오버!'}
        gameOverMessage={gameState.gameWon 
          ? '축하합니다! 감옥에서 탈출했습니다!' 
          : '경비원에게 잡혔습니다!'
        }
        finalScore={gameState.score}
        onRestart={resetGame}
        onMainMenu={onMainMenu}
        restartButtonColor="from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        showStartScreen={!gameState.isGameStarted}
        startScreenTitle="🏃‍♂️ 프리즌 브레이크"
        startScreenMessage="WASD 또는 방향키로 이동하세요! 초록색 EXIT에 도착하세요!"
        onStartGame={startGame}
        highScore={highScore}
      >
        <Prison />
        <Player position={gameState.playerPosition} />
        <Guard position={guard.position} isChasing={guard.isChasing} />
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
