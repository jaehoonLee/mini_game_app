import React from 'react';
import { ScoreRecord } from '../utils/scoreManager';

interface LeaderboardProps {
  leaderboard: ScoreRecord[];
  gameTitle: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, gameTitle }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-500 to-blue-700';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        🏆 {gameTitle} 순위표
      </h2>
      
      {!leaderboard || leaderboard.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-gray-300 text-lg font-semibold mb-2">아직 기록이 없습니다</div>
          <div className="text-gray-400 text-sm">첫 번째 기록을 만들어보세요!</div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {leaderboard.map((record, index) => (
            <div
              key={record.timestamp}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400/50 shadow-lg shadow-yellow-500/20' 
                  : index === 1 
                  ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-300/50 shadow-lg shadow-gray-400/20'
                  : index === 2
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-400/50 shadow-lg shadow-orange-500/20'
                  : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 hover:border-blue-400/50'
              }`}
            >
              {/* 배경 효과 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getRankColor(index + 1)} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' :
                    'text-blue-400'
                  }`}>
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{record.name}</div>
                    <div className="text-gray-400 text-sm flex items-center space-x-2">
                      <span>📅</span>
                      <span>{formatDate(record.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' :
                    'text-green-400'
                  }`}>
                    {record.score.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-xs">점</div>
                </div>
              </div>
              
              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      )}
      
      {/* 하단 장식 */}
      <div className="mt-6 pt-4 border-t border-gray-600/30">
        <div className="text-center text-gray-400 text-sm">
          상위 10명의 기록이 표시됩니다
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
