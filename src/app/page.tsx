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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* 네온 효과 배경 */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative z-10">
        {/* 헤더 - 아케이드 사인 스타일 */}
        <header className="text-center py-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* 메인 타이틀 */}
            <div className="mb-8">
              <h1 className="text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 animate-pulse">
                아케이드 존
              </h1>
            </div>
          </div>
        </header>

        {/* 게임 선택 섹션 */}
        <main className="max-w-5xl mx-auto px-4 pb-16">
          {/* 게임 카드들 - 그리드 배치로 변경 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <div
                key={game.id}
                onClick={() => handleGameClick(game.path, game.id)}
                className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:rotate-2 ${
                  selectedGame === game.id ? 'scale-95' : ''
                }`}
              >
                <div className={`bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-4 border-gray-600 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden backdrop-blur-sm h-full`}>
                  {/* 네온 테두리 효과 */}
                  <div className={`absolute inset-0 rounded-2xl ${game.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* 배경 패턴 */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                  </div>
                  
                  <div className="relative z-10 h-full flex flex-col">
                    {/* 게임 아이콘 */}
                    <div className="text-center mb-4">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300 animate-bounce">
                        {game.icon}
                      </div>
                    </div>
                    
                    {/* 게임 정보 */}
                    <div className="flex-1">
                      <h2 className={`text-2xl font-black mb-3 text-center ${game.neonColor} animate-pulse`}>
                        {game.title}
                      </h2>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4 font-mono text-center">
                        {game.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* 푸터 */}
        <footer className="text-center py-12 relative">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gray-600 max-w-2xl mx-auto">
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={handleResetScores}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider ${
                  showResetConfirm 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
                }`}
              >
                {showResetConfirm ? '정말 초기화하시겠습니까?' : '점수 초기화'}
              </button>
            </div>
            <p className="text-gray-400 font-mono text-sm">
              © 2024 아케이드 존 - 계속하려면 코인을 넣으세요 🕹️
            </p>
          </div>
        </footer>
      </div>

      {/* 네온 효과 오버레이 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}
