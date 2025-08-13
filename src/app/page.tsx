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
}

const games: GameCard[] = [
  {
    id: 'prison-break',
    title: '프리즌 브레이크',
    description: '경비원을 피해 감옥에서 탈출하세요! 은밀한 이동과 전략적 사고가 필요한 스텔스 게임입니다.',
    icon: '🏃‍♂️',
    color: 'from-gray-500 to-emerald-500',
    path: '/games/prison-break',
    difficulty: '보통',
    players: '1인'
  },
  {
    id: 'snake-game',
    title: '스네이크 게임',
    description: '클래식한 스네이크 게임! 사과를 먹어서 뱀을 길게 만들고 벽에 부딪히지 않도록 하세요.',
    icon: '🐍',
    color: 'from-green-500 to-emerald-500',
    path: '/games/snake',
    difficulty: '쉬움',
    players: '1인'
  },
  // {
  //   id: 'tetris',
  //   title: '테트리스',
  //   description: '전설의 퍼즐 게임! 블록을 회전시켜 줄을 완성하고 높은 점수를 획득하세요.',
  //   icon: '🧩',
  //   color: 'from-blue-500 to-cyan-500',
  //   path: '/games/tetris',
  //   difficulty: '보통',
  //   players: '1인'
  // },
  // {
  //   id: 'pong',
  //   title: '퐁 게임',
  //   description: 'AI와 대결하는 클래식 퐁! 패들을 움직여서 공을 받아치고 점수를 얻으세요.',
  //   icon: '🏓',
  //   color: 'from-purple-500 to-pink-500',
  //   path: '/games/pong',
  //   difficulty: '보통',
  //   players: '1인 vs AI'
  // },
  // {
  //   id: 'memory-game',
  //   title: '메모리 게임',
  //   description: '카드를 뒤집어서 같은 그림을 찾는 메모리 게임! 기억력과 집중력을 테스트해보세요.',
  //   icon: '🧠',
  //   color: 'from-yellow-500 to-amber-500',
  //   path: '/games/memory',
  //   difficulty: '쉬움',
  //   players: '1인'
  // },
  // {
  //   id: 'breakout',
  //   title: '브레이크아웃',
  //   description: '공과 패들로 벽돌을 깨는 게임! 모든 벽돌을 깨고 다음 레벨로 진행하세요.',
  //   icon: '🧱',
  //   color: 'from-indigo-500 to-purple-500',
  //   path: '/games/breakout',
  //   difficulty: '보통',
  //   players: '1인'
  // }
];

export default function Home() {
  const router = useRouter();
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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

  const handleGameClick = (path: string) => {
    router.push(path);
  };

  const handleResetScores = () => {
    if (showResetConfirm) {
      resetAllScores();
      refreshScores();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // 3초 후 자동으로 확인 상태 해제
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 헤더 */}
      <header className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          🎮 미니게임 아케이드 🎮
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          다양한 미니게임을 즐겨보세요! 클래식부터 현대적인 게임까지 모든 것을 만나보실 수 있습니다.
        </p>
      </header>

      {/* 게임 그리드 */}
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game.path)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className={`bg-gradient-to-br ${game.color} rounded-2xl p-6 h-full shadow-lg hover:shadow-2xl transition-shadow duration-300`}>
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {game.title}
                  </h2>
                  <p className="text-white/90 text-sm mb-4 leading-relaxed">
                    {game.description}
                  </p>
                  
                  {/* 게임 정보 */}
                  <div className="flex justify-center space-x-4 text-white/80 text-sm mb-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      난이도: {game.difficulty}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {game.players}
                    </span>
                  </div>

                  {/* 최고 점수 표시 */}
                  <div className="mb-4">
                    <div className="text-white/70 text-xs mb-1">최고 점수</div>
                    <div className="text-xl font-bold text-yellow-300">
                      {highScores[game.id] || 0}
                    </div>
                  </div>
                  
                  {/* 플레이 버튼 */}
                  <div>
                    <button className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-300 group-hover:bg-white/30">
                      플레이하기 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div> 
      </main>

      {/* 푸터 */}
      <footer className="text-center py-8 text-gray-400">
        <p>© 2024 미니게임 아케이드 - 즐거운 게임 시간을 보내세요! 🎮</p>
      </footer>
    </div>
  );
}
