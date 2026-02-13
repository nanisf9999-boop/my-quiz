
import React from 'react';

interface CharacterProps {
  mood: 'happy' | 'thinking' | 'excited' | 'sad';
  message?: string;
}

const Character: React.FC<CharacterProps> = ({ mood, message }) => {
  const getAvatar = () => {
    switch(mood) {
      case 'happy': return 'https://api.dicebear.com/7.x/bottts/svg?seed=sparky&backgroundColor=b6e3f4';
      case 'thinking': return 'https://api.dicebear.com/7.x/bottts/svg?seed=sparky&mouth=smile01&eyes=surprised&backgroundColor=b6e3f4';
      case 'excited': return 'https://api.dicebear.com/7.x/bottts/svg?seed=sparky&mouth=smile02&eyes=happy&backgroundColor=b6e3f4';
      case 'sad': return 'https://api.dicebear.com/7.x/bottts/svg?seed=sparky&mouth=unhappy&eyes=closed&backgroundColor=b6e3f4';
      default: return 'https://api.dicebear.com/7.x/bottts/svg?seed=sparky&backgroundColor=b6e3f4';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden animate-bounce-slow bg-white">
          <img src={getAvatar()} alt="Sparky" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-xs shadow-md border-2 border-white">
          Sparky
        </div>
      </div>
      {message && (
        <div className="relative bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-100 max-w-xs text-center">
          <p className="text-blue-700 font-medium italic">{message}</p>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l-2 border-t-2 border-blue-100"></div>
        </div>
      )}
    </div>
  );
};

export default Character;
