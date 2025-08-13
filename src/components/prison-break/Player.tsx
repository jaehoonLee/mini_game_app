import React from 'react';
import { Position } from './Game';

interface PlayerProps {
  position: Position;
}

const Player: React.FC<PlayerProps> = ({ position }) => {
  return (
    <div
      className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-blue-300 shadow-lg"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        transition: 'none'
      }}
    >
      {/* 플레이어 얼굴 */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
      
      {/* 플레이어 그림자 */}
      <div 
        className="absolute w-4 h-2 bg-black opacity-30 rounded-full"
        style={{
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      ></div>
    </div>
  );
};

export default Player;
