import React from 'react';
import { Position } from './Game';

interface SnakeProps {
  snake: Position[];
  cellSize: number;
}

const Snake: React.FC<SnakeProps> = ({ snake, cellSize }) => {
  return (
    <>
      {snake.map((segment, index) => (
        <div
          key={index}
          className={`absolute rounded-sm ${
            index === 0 
              ? 'bg-green-400 border-2 border-green-300' // 머리
              : 'bg-green-600 border border-green-500'   // 몸통
          }`}
          style={{
            left: `${segment.x * cellSize}px`,
            top: `${segment.y * cellSize}px`,
            width: `${cellSize}px`,
            height: `${cellSize}px`
          }}
        >
          {/* 머리에 눈 추가 */}
          {index === 0 && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default Snake;
