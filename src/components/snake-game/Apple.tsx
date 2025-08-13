import React from 'react';
import { Position } from './Game';

interface AppleProps {
  position: Position;
  cellSize: number;
}

const Apple: React.FC<AppleProps> = ({ position, cellSize }) => {
  return (
    <div
      className="absolute bg-red-500 border-2 border-red-300 rounded-full animate-pulse"
      style={{
        left: `${position.x * cellSize}px`,
        top: `${position.y * cellSize}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`
      }}
    >
      {/* 사과 줄기 */}
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-green-600 rounded-full"></div>
      
      {/* 사과 하이라이트 */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-red-300 rounded-full opacity-60"></div>
    </div>
  );
};

export default Apple;
