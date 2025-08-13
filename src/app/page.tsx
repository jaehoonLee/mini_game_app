'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllHighScores, resetAllScores, GAME_IDS } from '../utils/scoreManager';

interface GameCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  difficulty: string;
  players: string;
  neonColor: string;
  glowColor: string;
}

const games: GameCard[] = [
  {
    id: 'prison-break',
    title: '프리즌 브레이크',
    description: '스텔스 미션: 경비원을 피해 감옥에서 탈출하세요!',
    icon: '🏃‍♂️',
    color: 'from-blue-600 to-purple-600',
    neonColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-400/50',
    path: '/games/prison-break',
    difficulty: '보통',
    players: '1인'
  },
  {
    id: 'snake-game',
    title: '스네이크 클래식',
    description: '클래식 아케이드: 뱀을 길게 만들고 충돌을 피하세요!',
    icon: '🐍',
    color: 'from-green-600 to-emerald-600',
    neonColor: 'text-green-400',
    glowColor: 'shadow-green-400/50',
    path: '/games/snake',
    difficulty: '쉬움',
    players: '1인'
  },
  {
    id: 'tetris',
    title: '테트리스',
    description: '전설의 퍼즐 게임: 블록을 회전시켜 줄을 완성하세요!',
    icon: '🧩',
    color: 'from-purple-600 to-pink-600',
    neonColor: 'text-purple-400',
    glowColor: 'shadow-purple-400/50',
    path: '/games/tetris',
    difficulty: '보통',
    players: '1인'
  },
  {
    id: 'pong',
    title: '퐁 게임',
    description: '클래식 퐁: AI와 대결하며 공을 받아치세요!',
    icon: '🏓',
    color: 'from-orange-600 to-red-600',
    neonColor: 'text-orange-400',
    glowColor: 'shadow-orange-400/50',
    path: '/games/pong',
    difficulty: '보통',
    players: '1인 vs AI'
  },
  {
    id: 'memory-game',
    title: '메모리 게임',
    description: '기억력 테스트: 같은 카드를 찾아 매칭하세요!',
    icon: '🧠',
    color: 'from-yellow-600 to-amber-600',
    neonColor: 'text-yellow-400',
    glowColor: 'shadow-yellow-400/50',
    path: '/games/memory',
    difficulty: '쉬움',
    players: '1인'
  },
  {
    id: 'breakout',
    title: '브레이크아웃',
    description: '벽돌 깨기: 공과 패들로 모든 벽돌을 깨세요!',
    icon: '🧱',
    color: 'from-indigo-600 to-purple-600',
    neonColor: 'text-indigo-400',
    glowColor: 'shadow-indigo-400/50',
    path: '/games/breakout',
    difficulty: '보통',
    players: '1인'
  },
  {
    id: 'pacman',
    title: '팩맨',
    description: '클래식 팩맨: 점을 먹고 유령을 피해 다니세요!',
    icon: '👻',
    color: 'from-yellow-500 to-orange-500',
    neonColor: 'text-yellow-300',
    glowColor: 'shadow-yellow-300/50',
    path: '/games/pacman',
    difficulty: '보통',
    players: '1인'
  },
  {
    id: 'flappy-bird',
    title: '플래피 버드',
    description: '새를 조종하여 파이프 사이를 통과하세요!',
    icon: '🐦',
    color: 'from-green-500 to-blue-500',
    neonColor: 'text-green-300',
    glowColor: 'shadow-green-300/50',
    path: '/games/flappy-bird',
    difficulty: '어려움',
    players: '1인'
  },
  {
    id: '2048',
    title: '2048',
    description: '숫자 퍼즐: 같은 숫자를 합쳐서 2048을 만들어보세요!',
    icon: '🔢',
    color: 'from-gray-600 to-slate-600',
    neonColor: 'text-gray-300',
    glowColor: 'shadow-gray-300/50',
    path: '/games/2048',
    difficulty: '보통',
    players: '1인'
  },
  {
    id: 'space-invaders',
    title: '스페이스 인베이더',
    description: '우주 전쟁: 외계인을 물리치고 지구를 구하세요!',
    icon: '🚀',
    color: 'from-blue-500 to-cyan-500',
    neonColor: 'text-blue-300',
    glowColor: 'shadow-blue-300/50',
    path: '/games/space-invaders',
    difficulty: '보통',
    players: '1인'
  }
];

export default function Home() {
  const router = useRouter();
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 최고 점수 로드
  useEffect(() => {
    const scores = getAllHighScores();
    setHighScores(scores);
  }, []);

  // 점수 새로고침
  const refreshScores = () => {
    const scores = getAllHighScores();
    setHighScores(scores);
  };

  const handleGameClick = (path: string, gameId: string) => {
    setSelectedGame(gameId);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  const handleResetScores = () => {
    if (showResetConfirm) {
      resetAllScores();
      refreshScores();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden font-mono">
      {/* 레트로 배경 패턴 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Crect x='0' y='0' width='1' height='1'/%3E%3Crect x='10' y='0' width='1' height='1'/%3E%3Crect x='0' y='10' width='1' height='1'/%3E%3Crect x='10' y='10' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* 스캔라인 효과 */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }}></div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative z-10">
        {/* 헤더 - 레트로 아케이드 스타일 */}
        <header className="text-center py-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* 메인 타이틀 */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-black mb-4 text-white tracking-wider" style={{
                textShadow: '0 0 10px #ff0, 0 0 20px #ff0, 0 0 30px #ff0, 0 0 40px #ff0',
                fontFamily: 'monospace'
              }}>
                ARCADE ZONE
              </h1>
              <div className="text-yellow-400 text-lg md:text-xl font-bold tracking-widest animate-pulse">
                INSERT COIN TO START
              </div>
            </div>
            
            {/* 레트로 스타일 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-black/80 border-2 border-green-400 p-4 rounded">
                <div className="text-green-400 text-sm font-bold">GAMES</div>
                <div className="text-white text-2xl font-bold">{games.length}</div>
              </div>
              <div className="bg-black/80 border-2 border-blue-400 p-4 rounded">
                <div className="text-blue-400 text-sm font-bold">HIGH SCORE</div>
                <div className="text-white text-2xl font-bold">
                  {Math.max(...Object.values(highScores), 0)}
                </div>
              </div>
              <div className="bg-black/80 border-2 border-red-400 p-4 rounded">
                <div className="text-red-400 text-sm font-bold">TIME</div>
                <div className="text-white text-2xl font-bold">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 게임 선택 섹션 */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {/* 게임 카드들 - 레트로 스타일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {games.map((game, index) => (
              <div
                key={game.id}
                onClick={() => handleGameClick(game.path, game.id)}
                className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  selectedGame === game.id ? 'scale-95' : ''
                }`}
              >
                <div className="bg-black border-4 border-gray-600 rounded p-4 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full hover:border-green-400">
                  {/* 레트로 배경 패턴 */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Crect x='0' y='0' width='1' height='1'/%3E%3Crect x='8' y='0' width='1' height='1'/%3E%3Crect x='0' y='8' width='1' height='1'/%3E%3Crect x='8' y='8' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col">
                    {/* 게임 아이콘 */}
                    <div className="text-center mb-3">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {game.icon}
                      </div>
                    </div>
                    
                    {/* 게임 정보 */}
                    <div className="flex-1">
                      <h2 className="text-lg font-bold mb-2 text-center text-white uppercase tracking-wider group-hover:text-green-400 transition-colors">
                        {game.title}
                      </h2>
                      <p className="text-gray-400 text-xs leading-relaxed mb-3 text-center">
                        {game.description}
                      </p>
                      
                      {/* 레트로 스타일 메타 정보 */}
                      <div className="text-center space-y-1">
                        <div className="text-yellow-400 text-xs font-bold">
                          DIFFICULTY: {game.difficulty}
                        </div>
                        <div className="text-blue-400 text-xs font-bold">
                          PLAYERS: {game.players}
                        </div>
                        <div className="text-green-400 text-xs font-bold">
                          HIGH SCORE: {highScores[game.id] || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 선택 효과 */}
                  {selectedGame === game.id && (
                    <div className="absolute inset-0 border-4 border-green-400 bg-green-400/20 animate-pulse"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 푸터 - 레트로 스타일 */}
        <footer className="text-center py-8 relative">
          <div className="bg-black/80 border-2 border-gray-600 rounded p-4 shadow-lg max-w-2xl mx-auto">
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={handleResetScores}
                className={`px-4 py-2 rounded font-bold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider text-sm ${
                  showResetConfirm 
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-400' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                }`}
              >
                {showResetConfirm ? 'CONFIRM RESET?' : 'RESET SCORES'}
              </button>
            </div>
            <p className="text-gray-400 text-xs font-mono">
              © 2024 ARCADE ZONE - PRESS START TO CONTINUE 🕹️
            </p>
          </div>
        </footer>
      </div>

      {/* 레트로 효과 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}
