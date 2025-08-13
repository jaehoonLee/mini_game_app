'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Leaderboard from './Leaderboard';
import { ScoreRecord } from '../utils/scoreManager';

interface GameLayoutProps {
  children: React.ReactNode;
  gameTitle: string;
  leaderboard: ScoreRecord[];
  gameWidth?: number;
  gameHeight?: number;
  showGameOverOverlay: boolean;
  gameOverTitle: string;
  gameOverMessage: string;
  finalScore: number;
  onRestart: () => void;
  onMainMenu: () => void;
  restartButtonColor?: string;
  showStartScreen?: boolean;
  startScreenTitle?: string;
  startScreenMessage?: string;
  onStartGame?: () => void;
  highScore?: number;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  gameTitle,
  leaderboard,
  gameWidth,
  gameHeight,
  showGameOverOverlay,
  gameOverTitle,
  gameOverMessage,
  finalScore,
  onRestart,
  onMainMenu,
  restartButtonColor = "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
  showStartScreen = false,
  startScreenTitle = "",
  startScreenMessage = "",
  onStartGame,
  highScore = 0
}) => {
  const router = useRouter();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
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

      {/* 게임과 리더보드 레이아웃 */}
      <div className="w-full h-screen pt-16">
        <div className="w-full h-full flex justify-center items-center">
          {/* 게임 영역 - 전체 화면 */}
          <div className="w-full h-full max-w-7xl mx-auto px-6">
            <div className="relative bg-gray-800/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-2xl overflow-hidden shadow-2xl w-full h-full">
              <div 
                className="relative w-full h-full"
                style={{ 
                  background: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                  backgroundSize: '30px 30px',
                  backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px'
                }}
              >
                {children}

                {/* 시작 화면 오버레이 */}
                {showStartScreen && onStartGame && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="text-center max-w-md mx-auto">
                      <h2 className="text-4xl font-black text-white mb-6 animate-pulse">
                        {startScreenTitle}
                      </h2>
                      <p className="text-gray-300 text-lg mb-8 font-mono">
                        {startScreenMessage}
                      </p>
                      <div className="space-y-4">
                        <button
                          onClick={onStartGame}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 text-2xl border-4 border-white/20 shadow-lg hover:shadow-xl"
                        >
                          🎮 게임 시작
                        </button>
                        <button
                          onClick={toggleLeaderboard}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-lg border-2 border-white/20 shadow-lg hover:shadow-xl"
                        >
                          {showLeaderboard ? '📊 순위표 숨기기' : '🏆 순위표 보기'}
                        </button>
                        <div className="text-gray-400 text-sm">
                          최고 점수: {highScore}
                        </div>
                      </div>
                    </div>
                    
                    {/* 순위표 오버레이 */}
                    {showLeaderboard && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                              🏆 {gameTitle} 순위표
                            </h3>
                            <button
                              onClick={toggleLeaderboard}
                              className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                            >
                              ×
                            </button>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            <Leaderboard leaderboard={leaderboard} gameTitle={gameTitle} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 게임 오버/승리 오버레이 */}
                {showGameOverOverlay && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-4xl font-black text-white mb-6 animate-pulse">
                        {gameOverTitle}
                      </h2>
                      <p className="text-gray-300 text-lg mb-4 font-mono">
                        {gameOverMessage}
                      </p>
                      <div className="text-yellow-400 text-2xl font-bold mb-6">
                        최종 점수: {finalScore}
                      </div>
                      <div className="space-y-4">
                        <button
                          onClick={onRestart}
                          className={`bg-gradient-to-r ${restartButtonColor} text-white font-black py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 text-2xl border-4 border-white/20 shadow-lg hover:shadow-xl`}
                        >
                          🎮 다시 시작
                        </button>
                        <button
                          onClick={onMainMenu}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 text-lg border-2 border-white/20 shadow-lg hover:shadow-xl"
                        >
                          🏠 메인 메뉴
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default GameLayout;
