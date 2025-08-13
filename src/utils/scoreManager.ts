// 게임별 최고 점수 관리 유틸리티

export interface ScoreRecord {
  name: string;
  score: number;
  date: string;
  timestamp: number;
}

export interface GameScore {
  currentScore: number;
  highScore: number;
  lastPlayed: string;
  playCount: number;
  leaderboard: ScoreRecord[];
}

export const GAME_IDS = {
  PRISON_BREAK: 'prison-break',
  SNAKE: 'snake',
  TETRIS: 'tetris'
} as const;

export type GameId = 'prison-break' | 'snake' | 'tetris';

// 로컬 스토리지 키 생성
const getStorageKey = (gameId: GameId): string => {
  return `game-score-${gameId}`;
};

// 초기 점수 데이터
const getInitialScore = (): GameScore => ({
  currentScore: 0,
  highScore: 0,
  lastPlayed: new Date().toISOString(),
  playCount: 0,
  leaderboard: []
});

// 점수 데이터 로드
export const loadGameScore = (gameId: GameId): GameScore => {
  try {
    console.log(`loadGameScore 호출: ${gameId}`);
    const storageKey = getStorageKey(gameId);
    console.log(`스토리지 키: ${storageKey}`);
    
    const stored = localStorage.getItem(storageKey);
    console.log(`로컬스토리지에서 가져온 데이터:`, stored);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(`파싱된 데이터:`, parsed);
      
      // 기존 데이터에 leaderboard 필드가 없으면 추가
      if (!parsed.leaderboard || !Array.isArray(parsed.leaderboard)) {
        console.log('leaderboard 필드가 없거나 배열이 아님, 빈 배열로 초기화');
        parsed.leaderboard = [];
      }
      
      // 모든 필수 필드가 있는지 확인하고 없으면 기본값으로 설정
      const result = {
        currentScore: parsed.currentScore || 0,
        highScore: parsed.highScore || 0,
        lastPlayed: parsed.lastPlayed || new Date().toISOString(),
        playCount: parsed.playCount || 0,
        leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : []
      };
      
      console.log(`최종 반환 데이터:`, result);
      return result;
    } else {
      console.log('저장된 데이터가 없음, 초기값 반환');
    }
  } catch (error) {
    console.error('점수 데이터 로드 실패:', error);
  }
  return getInitialScore();
};

// 점수 데이터 저장
export const saveGameScore = (gameId: GameId, score: GameScore): void => {
  try {
    localStorage.setItem(getStorageKey(gameId), JSON.stringify(score));
  } catch (error) {
    console.error('점수 데이터 저장 실패:', error);
  }
};

// 새로운 점수 업데이트 (이름 포함)
export const updateGameScore = (gameId: GameId, newScore: number, playerName: string = '익명'): GameScore => {
  const currentData = loadGameScore(gameId);
  
  // 새로운 기록 생성
  const newRecord: ScoreRecord = {
    name: playerName,
    score: newScore,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };
  
  // 안전한 배열 처리
  const currentLeaderboard = Array.isArray(currentData.leaderboard) ? currentData.leaderboard : [];
  
  // 리더보드에 추가하고 정렬
  const updatedLeaderboard = [...currentLeaderboard, newRecord]
    .sort((a, b) => b.score - a.score) // 점수 내림차순 정렬
    .slice(0, 10); // 상위 10개만 유지
  
  const updatedData: GameScore = {
    currentScore: newScore,
    highScore: Math.max(currentData.highScore, newScore),
    lastPlayed: new Date().toISOString(),
    playCount: currentData.playCount + 1,
    leaderboard: updatedLeaderboard
  };
  
  saveGameScore(gameId, updatedData);
  return updatedData;
};

// 최고 점수만 가져오기
export const getHighScore = (gameId: GameId): number => {
  return loadGameScore(gameId).highScore;
};

// 리더보드 가져오기
export const getLeaderboard = (gameId: GameId): ScoreRecord[] => {
  const data = loadGameScore(gameId);
  return Array.isArray(data.leaderboard) ? data.leaderboard : [];
};

// 모든 게임의 최고 점수 가져오기
export const getAllHighScores = (): Record<GameId, number> => {
  return {
    'prison-break': getHighScore(GAME_IDS.PRISON_BREAK),
    'snake': getHighScore(GAME_IDS.SNAKE),
    'tetris': getHighScore(GAME_IDS.TETRIS)
  };
};

// 점수 데이터 초기화
export const resetGameScore = (gameId: GameId): void => {
  saveGameScore(gameId, getInitialScore());
};

// 모든 점수 데이터 초기화
export const resetAllScores = (): void => {
  Object.values(GAME_IDS).forEach(gameId => {
    resetGameScore(gameId);
  });
};

// 플레이어 이름 가져오기 (로컬 스토리지에서)
export const getPlayerName = (): string => {
  try {
    return localStorage.getItem('player-name') || '익명';
  } catch (error) {
    return '익명';
  }
};

// 플레이어 이름 저장
export const savePlayerName = (name: string): void => {
  try {
    localStorage.setItem('player-name', name);
  } catch (error) {
    console.error('플레이어 이름 저장 실패:', error);
  }
};

// 테스트용 더미 데이터 추가 (개발용)
export const addTestData = (gameId: GameId): void => {
  try {
    console.log(`${gameId}에 테스트 데이터 추가 중...`);
    
    const testRecords: ScoreRecord[] = [
      { name: '테스트플레이어1', score: 1500, date: new Date().toISOString(), timestamp: Date.now() - 10000 },
      { name: '테스트플레이어2', score: 1200, date: new Date().toISOString(), timestamp: Date.now() - 20000 },
      { name: '테스트플레이어3', score: 900, date: new Date().toISOString(), timestamp: Date.now() - 30000 },
      { name: '테스트플레이어4', score: 800, date: new Date().toISOString(), timestamp: Date.now() - 40000 },
      { name: '테스트플레이어5', score: 700, date: new Date().toISOString(), timestamp: Date.now() - 50000 }
    ];
    
    const testData: GameScore = {
      currentScore: 1500,
      highScore: 1500,
      lastPlayed: new Date().toISOString(),
      playCount: 5,
      leaderboard: testRecords
    };
    
    saveGameScore(gameId, testData);
    console.log(`${gameId} 테스트 데이터 추가 완료:`, testData);
  } catch (error) {
    console.error('테스트 데이터 추가 실패:', error);
  }
};

// 모든 게임에 테스트 데이터 추가
export const addTestDataToAllGames = (): void => {
  Object.values(GAME_IDS).forEach(gameId => {
    addTestData(gameId);
  });
};
