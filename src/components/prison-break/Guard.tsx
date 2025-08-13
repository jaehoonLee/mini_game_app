import React from 'react';
import { Position } from './Game';

interface GuardProps {
  position: Position;
  isChasing: boolean;
}

const Guard: React.FC<GuardProps> = ({ position, isChasing }) => {
  return (
    <div
      className={`absolute w-6 h-6 bg-orange-500 rounded-full border-2 border-orange-300 shadow-lg transition-colors duration-200 ${
        isChasing ? 'animate-pulse' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        transition: 'none'
      }}
    >
      {/* 경비원 얼굴 */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
      </div>
      
      {/* 경비원 그림자 */}
      <div 
        className="absolute w-4 h-2 bg-black opacity-30 rounded-full"
        style={{
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      ></div>

      {/* 추적 중일 때 시각적 효과 */}
      {isChasing && (
        <div className="absolute -top-2 -left-2 w-10 h-10 border-2 border-red-400 rounded-full animate-ping opacity-75"></div>
      )}
    </div>
  );
};

export default Guard;
