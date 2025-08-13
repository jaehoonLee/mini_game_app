import React, { useState, useEffect, useRef } from 'react';
import { getPlayerName, savePlayerName } from '../utils/scoreManager';

interface NameInputModalProps {
  isOpen: boolean;
  score: number;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

const NameInputModal: React.FC<NameInputModalProps> = ({ isOpen, score, onSubmit, onClose }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('useEffect 실행됨, isOpen:', isOpen);
    if (isOpen) {
      // 기존 이름 로드
      const savedName = getPlayerName();
      console.log('저장된 이름 로드:', savedName);
      setName(savedName);
      
      // 모달이 열릴 때 입력 필드에 포커스
      setTimeout(() => {
        console.log('setTimeout 실행, inputRef.current:', inputRef.current);
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select(); // 기존 텍스트 선택
          console.log('입력 필드 포커스 및 선택 완료');
        }
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);
      savePlayerName(name.trim());
      onSubmit(name.trim());
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('handleInputChange 호출됨:', value);
    console.log('이전 name 값:', name);
    console.log('새로운 value 길이:', value.length);
    setName(value); // 필터링 제거하고 직접 설정
    console.log('setName 호출 완료');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('handleKeyDown 호출됨:', e.key);
    
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      console.log('Enter 키로 저장 시도');
      savePlayerName(name.trim());
      onSubmit(name.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      console.log('Escape 키로 취소');
      onClose();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      console.log('Backspace 키로 삭제 시도');
      // 현재 커서 위치에서 한 글자 삭제
      const newName = name.slice(0, -1);
      console.log('삭제 후 이름:', newName);
      setName(newName);
    }
    // Backspace, Delete 등은 onChange에서 자연스럽게 처리되도록 함
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          🎉 점수 기록! 🎉
        </h2>
        
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-green-400 mb-3">{score.toLocaleString()}</div>
          <div className="text-gray-300 text-lg">점을 획득했습니다!</div>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-white font-semibold mb-3 text-lg">
              플레이어 이름
            </label>
            <input
              ref={inputRef}
              id="playerName"
              type="text"
              value={name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요 (한글/영문/숫자)"
              className="w-full px-4 py-3 bg-gray-700/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-lg"
              maxLength={20}
              autoComplete="off"
              spellCheck="false"
            />
            <div className="text-gray-400 text-sm mt-2">
              {name.length}/20 글자
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              취소
            </button>
          </div>
        </form>

        <div className="text-gray-400 text-sm text-center mt-6 p-3 bg-gray-800/50 rounded-lg">
          💡 <strong>팁:</strong> 이름은 다음 게임에서도 자동으로 사용됩니다.<br/>
          <span className="text-xs">Enter: 저장, Esc: 취소</span>
        </div>
      </div>
    </div>
  );
};

export default NameInputModal;
