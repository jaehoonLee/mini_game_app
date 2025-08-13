'use client';

import React from 'react';
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

  const goToMainMenu = () => {
    router.push('/');
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

      {/* 상단 네비게이션 - 레트로 스타일 */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={goToMainMenu}
          className="bg-black border-2 border-green-400 hover:border-green-300 backdrop-blur-sm text-green-400 hover:text-green-300 font-bold py-2 px-4 rounded transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-green-400/25"
        >
          <span className="text-lg">←</span>
          <span className="uppercase tracking-wider">MAIN MENU</span>
        </button>
      </div>

      {/* 게임과 리더보드 레이아웃 */}
      <div className="w-full h-screen pt-16">
        <div className="w-full h-full flex justify-center items-center">
          {/* 게임 영역 - 전체 화면 */}
          <div className="w-full h-full max-w-7xl mx-auto px-6">
            <div className="relative bg-black border-4 border-gray-600 rounded overflow-hidden shadow-2xl w-full h-full hover:border-green-400 transition-colors duration-300">
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
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex gap-12 items-start max-w-7xl mx-auto px-8">
                      {/* 왼쪽: 게임 제목과 시작 버튼 */}
                      <div className="flex-1 text-center">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-wider" style={{
                          textShadow: '0 0 10px #0f0, 0 0 20px #0f0, 0 0 30px #0f0',
                          fontFamily: 'monospace'
                        }}>
                          {startScreenTitle}
                        </h2>
                        <p className="text-gray-300 text-lg mb-8 font-mono tracking-wide">
                          {startScreenMessage}
                        </p>
                        <div className="space-y-4">
                          <button
                            onClick={onStartGame}
                            className="bg-black border-4 border-green-400 hover:border-green-300 text-green-400 hover:text-green-300 font-black py-4 px-8 rounded transition-all duration-300 transform hover:scale-105 text-2xl uppercase tracking-wider shadow-lg hover:shadow-green-400/25 w-full"
                          >
                            🎮 START GAME
                          </button>
                          <div className="text-yellow-400 text-sm font-bold uppercase tracking-wider">
                            HIGH SCORE: {highScore}
                          </div>
                        </div>
                      </div>
                      
                      {/* 오른쪽: 순위표 */}
                      <div className="flex-1">
                        <Leaderboard leaderboard={leaderboard} gameTitle={gameTitle} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 게임 오버/승리 오버레이 */}
                {showGameOverOverlay && (
                  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex gap-12 items-start max-w-7xl mx-auto px-8">
                      {/* 왼쪽: 게임 오버 정보 */}
                      <div className="flex-1 text-center">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-wider" style={{
                          textShadow: gameOverTitle.includes('승리') || gameOverTitle.includes('SUCCESS') 
                            ? '0 0 10px #0f0, 0 0 20px #0f0, 0 0 30px #0f0'
                            : '0 0 10px #f00, 0 0 20px #f00, 0 0 30px #f00',
                          fontFamily: 'monospace'
                        }}>
                          {gameOverTitle}
                        </h2>
                        <p className="text-gray-300 text-lg mb-4 font-mono tracking-wide">
                          {gameOverMessage}
                        </p>
                        <div className="text-yellow-400 text-2xl font-bold mb-6 uppercase tracking-wider">
                          FINAL SCORE: {finalScore}
                        </div>
                        <div className="space-y-4">
                          <button
                            onClick={onRestart}
                            className={`bg-black border-4 text-white font-black py-4 px-8 rounded transition-all duration-300 transform hover:scale-105 text-2xl uppercase tracking-wider shadow-lg w-full ${
                              restartButtonColor.includes('green') 
                                ? 'border-green-400 hover:border-green-300 hover:text-green-300 hover:shadow-green-400/25'
                                : 'border-blue-400 hover:border-blue-300 hover:text-blue-300 hover:shadow-blue-400/25'
                            }`}
                          >
                            🎮 RESTART
                          </button>
                          <button
                            onClick={onMainMenu}
                            className="bg-black border-2 border-gray-400 hover:border-gray-300 text-gray-400 hover:text-gray-300 font-bold py-3 px-6 rounded transition-all duration-300 shadow-lg hover:shadow-gray-400/25 transform hover:scale-105 uppercase tracking-wider"
                          >
                            🏠 MAIN MENU
                          </button>
                        </div>
                      </div>
                      
                      {/* 오른쪽: 순위표 */}
                      <div className="flex-1">
                        <Leaderboard leaderboard={leaderboard} gameTitle={gameTitle} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 - 레트로 스타일 */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex justify-center">
        </div>
      </div>
    </div>
  );
};

export default GameLayout;
