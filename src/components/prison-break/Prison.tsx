import React from 'react';

const Prison: React.FC = () => {
  return (
    <>
      {/* 외벽들 - Game.tsx의 walls 배열과 정확히 일치 */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gray-700 border-b-2 border-gray-500"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-700 border-t-2 border-gray-500"></div>
      <div className="absolute top-0 left-0 w-4 h-full bg-gray-700 border-r-2 border-gray-500"></div>
      <div className="absolute top-0 right-0 w-4 h-full bg-gray-700 border-l-2 border-gray-500"></div>

      {/* 내부 벽들 - Game.tsx의 walls 배열과 정확히 일치 */}
      <div className="absolute top-5 left-5 w-32 h-1 bg-gray-600"></div>
      <div className="absolute top-10 left-10 w-1 h-32 bg-gray-600"></div>
      <div className="absolute top-15 left-15 w-48 h-1 bg-gray-600"></div>
      <div className="absolute top-20 left-20 w-1 h-24 bg-gray-600"></div>

      {/* 감옥 바 - Game.tsx의 walls 배열과 정확히 일치 */}
      <div className="absolute top-30 left-10 w-32 h-2 bg-gray-500"></div>
      <div className="absolute top-30 left-10 w-2 h-16 bg-gray-500"></div>
      <div className="absolute top-30 left-17 w-2 h-16 bg-gray-500"></div>
      <div className="absolute top-33 left-10 w-32 h-2 bg-gray-500"></div>

      {/* 장애물들 - Game.tsx의 walls 배열과 정확히 일치 */}
      <div className="absolute top-25 left-25 w-6 h-6 bg-gray-500 rounded"></div>
      <div className="absolute top-37 left-50 w-6 h-6 bg-gray-500 rounded"></div>
      <div className="absolute top-50 left-37 w-6 h-6 bg-gray-500 rounded"></div>
      <div className="absolute top-62 left-75 w-6 h-6 bg-gray-500 rounded"></div>

      {/* 감옥 문 */}
      <div className="absolute top-2 right-20 w-16 h-8 bg-yellow-600 border-2 border-yellow-400 rounded">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
        </div>
      </div>

      {/* 감시탑 */}
      <div className="absolute top-10 right-10 w-8 h-8 bg-red-600 border-2 border-red-400 rounded">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-1 h-1 bg-red-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 탈출 지점 표시 - Game.tsx의 exitPosition과 정확히 일치 */}
      <div className="absolute w-8 h-8 bg-green-500 border-2 border-green-300 rounded animate-pulse"
           style={{
             left: '534px', // 550 - 16 (중앙 정렬)
             top: '334px'   // 350 - 16 (중앙 정렬)
           }}>
        <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
          EXIT
        </div>
      </div>
    </>
  );
};

export default Prison;
