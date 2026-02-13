
import React, { useState, useEffect } from 'react';
import { GameState, Lock, LockStatus, LockCategory, AIPuzzle } from './types';
import { generateLockPuzzle, generateVictoryImage } from './services/geminiService';
import Character from './components/Character';

const LOCK_CONFIG: Omit<Lock, 'status'>[] = [
  { id: 1, category: 'KEY_RED', color: 'bg-red-500', label: 'R' },
  { id: 2, category: 'KEY_BLUE', color: 'bg-blue-500', label: 'B' },
  { id: 3, category: 'KEY_GREEN', color: 'bg-green-500', label: 'G' },
  { id: 4, category: 'AI_MATH', color: 'bg-yellow-500', label: '+' },
  { id: 5, category: 'AI_RIDDLE', color: 'bg-purple-500', label: '?' },
  { id: 6, category: 'AI_WORD', color: 'bg-orange-500', label: 'W' },
  { id: 7, category: 'AI_LOGIC', color: 'bg-indigo-500', label: 'L' },
  { id: 8, category: 'INTERACT_SEQUENCE', color: 'bg-pink-500', label: 'S' },
  { id: 9, category: 'INTERACT_CODE', color: 'bg-gray-700', label: '#' },
  { id: 10, category: 'INTERACT_TOGGLE', color: 'bg-teal-500', label: 'T' },
  { id: 11, category: 'INTERACT_CLICK', color: 'bg-rose-400', label: 'C' },
  { id: 12, category: 'INTERACT_SHAPE', color: 'bg-cyan-600', label: '∆' },
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.EXPLORING);
  const [locks, setLocks] = useState<Lock[]>(LOCK_CONFIG.map(l => ({ ...l, status: LockStatus.LOCKED })));
  const [activeLock, setActiveLock] = useState<Lock | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<AIPuzzle | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [victoryImg, setVictoryImg] = useState<string | null>(null);
  const [msg, setMsg] = useState("We need to open all 12 locks!");

  // Hidden items state
  const [foundItems, setFoundItems] = useState<{ [key: string]: boolean }>({
    RED_KEY: false,
    BLUE_KEY: false,
    GREEN_KEY: false,
  });

  useEffect(() => {
    if (locks.every(l => l.status === LockStatus.UNLOCKED)) {
      handleVictory();
    }
  }, [locks]);

  const handleVictory = async () => {
    setLoading(true);
    const img = await generateVictoryImage();
    setVictoryImg(img);
    setGameState(GameState.VICTORY);
    setLoading(false);
  };

  const openLockDetail = async (lock: Lock) => {
    if (lock.status === LockStatus.UNLOCKED) return;
    
    setActiveLock(lock);
    setInput('');

    if (lock.category.startsWith('AI_')) {
      setLoading(true);
      try {
        const puzzle = await generateLockPuzzle(lock.category);
        setActivePuzzle(puzzle);
        setGameState(GameState.PUZZLE_DETAIL);
      } catch (e) {
        setMsg("Oh no, my magic failed! Try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setGameState(GameState.PUZZLE_DETAIL);
    }
  };

  const unlock = (id: number) => {
    setLocks(prev => prev.map(l => l.id === id ? { ...l, status: LockStatus.UNLOCKED } : l));
    setGameState(GameState.EXPLORING);
    setMsg("Great job! That's one more lock open!");
  };

  const checkAnswer = () => {
    if (!activePuzzle || !activeLock) return;
    if (input.toLowerCase().trim() === activePuzzle.answer.toLowerCase().trim()) {
      unlock(activeLock.id);
    } else {
      setMsg("Not quite right, keep trying!");
    }
  };

  const renderExploration = () => (
    <div className="flex flex-col items-center gap-10 w-full animate-fade-in">
      <div className="relative w-full max-w-2xl bg-orange-100 rounded-[3rem] p-10 border-8 border-orange-200 shadow-2xl">
        {/* The Vault Door */}
        <div className="bg-orange-200 rounded-3xl p-6 border-4 border-orange-300 grid grid-cols-3 md:grid-cols-4 gap-4">
          {locks.map(lock => (
            <button
              key={lock.id}
              onClick={() => openLockDetail(lock)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-b-4 transition-all transform hover:scale-105 active:scale-95 shadow-md ${lock.status === LockStatus.UNLOCKED ? 'bg-green-500 border-green-700' : `${lock.color} border-black border-opacity-20`}`}
            >
              {lock.status === LockStatus.UNLOCKED ? '✓' : lock.label}
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 bg-gray-400 rounded-full border-4 border-gray-500"></div>
        </div>
      </div>

      <Character mood="happy" message={msg} />

      {/* Interactive Environment */}
      <div className="grid grid-cols-3 gap-8 w-full max-w-md">
        <button 
          onClick={() => { if(!foundItems.RED_KEY) { setFoundItems(f => ({...f, RED_KEY: true})); setMsg("You found the Red Key!"); }}}
          className="bg-green-200 p-4 rounded-3xl hover:bg-green-300 transition-colors"
        >
          🌿 Plant
        </button>
        <button 
          onClick={() => { if(!foundItems.BLUE_KEY) { setFoundItems(f => ({...f, BLUE_KEY: true})); setMsg("You found the Blue Key!"); }}}
          className="bg-blue-200 p-4 rounded-3xl hover:bg-blue-300 transition-colors"
        >
          🛋️ Rug
        </button>
        <button 
          onClick={() => { if(!foundItems.GREEN_KEY) { setFoundItems(f => ({...f, GREEN_KEY: true})); setMsg("You found the Green Key!"); }}}
          className="bg-yellow-200 p-4 rounded-3xl hover:bg-yellow-300 transition-colors"
        >
          📦 Box
        </button>
      </div>
    </div>
  );

  const renderPuzzle = () => {
    if (!activeLock) return null;

    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-xl animate-bounce-in bg-white p-10 rounded-[2rem] border-8 border-blue-400 shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-600">Lock #{activeLock.id} Challenge</h2>
        
        {activeLock.category === 'KEY_RED' && (
          <div className="text-center">
            <p className="text-xl mb-4">You need the Red Key from the room!</p>
            {foundItems.RED_KEY ? (
              <button onClick={() => unlock(activeLock.id)} className="bg-red-500 text-white p-4 rounded-xl font-bold">Use Key</button>
            ) : <p className="text-red-500 italic">Go find it!</p>}
          </div>
        )}

        {activeLock.category === 'KEY_BLUE' && (
          <div className="text-center">
            <p className="text-xl mb-4">You need the Blue Key!</p>
            {foundItems.BLUE_KEY ? (
              <button onClick={() => unlock(activeLock.id)} className="bg-blue-500 text-white p-4 rounded-xl font-bold">Use Key</button>
            ) : <p className="text-blue-500 italic">Search under the rug!</p>}
          </div>
        )}

        {activeLock.category === 'KEY_GREEN' && (
          <div className="text-center">
            <p className="text-xl mb-4">You need the Green Key!</p>
            {foundItems.GREEN_KEY ? (
              <button onClick={() => unlock(activeLock.id)} className="bg-green-500 text-white p-4 rounded-xl font-bold">Use Key</button>
            ) : <p className="text-green-500 italic">Check the box!</p>}
          </div>
        )}

        {activeLock.category.startsWith('AI_') && activePuzzle && (
          <div className="w-full space-y-6">
            <div className="bg-blue-50 p-6 rounded-2xl border-4 border-blue-100 text-center">
              <p className="text-2xl font-bold text-blue-800">{activePuzzle.question}</p>
            </div>
            <input 
              autoFocus
              className="w-full p-4 text-center text-2xl border-4 border-gray-200 rounded-xl focus:border-blue-400 outline-none"
              placeholder="Your answer..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && checkAnswer()}
            />
            <button 
              onClick={checkAnswer}
              className="w-full bg-blue-500 text-white p-6 rounded-2xl font-bold text-2xl border-b-8 border-blue-700 hover:bg-blue-400"
            >
              Unlock!
            </button>
          </div>
        )}

        {activeLock.category === 'INTERACT_CLICK' && (
          <div className="text-center">
            <p className="mb-4">Tap the button 10 times to power the lock!</p>
            <button 
              onClick={() => {
                const count = parseInt(input || '0') + 1;
                if (count >= 10) unlock(activeLock.id);
                else setInput(count.toString());
              }}
              className="w-32 h-32 bg-rose-400 rounded-full text-white font-bold text-4xl shadow-lg border-b-8 border-rose-600 active:translate-y-2 active:border-b-0"
            >
              {input || '0'}
            </button>
          </div>
        )}

        {activeLock.category === 'INTERACT_CODE' && (
          <div className="text-center space-y-4">
            <p>The code is hidden in Sparky's logo (It's 1234)!</p>
            <input 
              className="p-4 text-center text-3xl font-mono border-4 border-gray-200 rounded-xl"
              maxLength={4}
              value={input}
              onChange={e => {
                  if (e.target.value === '1234') unlock(activeLock.id);
                  else setInput(e.target.value);
              }}
            />
          </div>
        )}

        {activeLock.category === 'INTERACT_TOGGLE' && (
          <div className="grid grid-cols-2 gap-4">
             {[1,2,3,4].map(i => (
                <button 
                    key={i}
                    onClick={() => {
                        const next = input.includes(i.toString()) ? input.replace(i.toString(), '') : input + i;
                        if (next.length === 4) unlock(activeLock.id);
                        else setInput(next);
                    }}
                    className={`w-20 h-20 rounded-xl border-4 ${input.includes(i.toString()) ? 'bg-green-500 border-green-700' : 'bg-gray-200 border-gray-300'}`}
                />
             ))}
             <p className="col-span-2 text-center text-sm">Flip all switches to green!</p>
          </div>
        )}

        {/* Catch-all for other interactives to keep it functional */}
        {(!activeLock.category.startsWith('AI_') && !['KEY_RED', 'KEY_BLUE', 'KEY_GREEN', 'INTERACT_CLICK', 'INTERACT_CODE', 'INTERACT_TOGGLE'].includes(activeLock.category)) && (
            <div className="text-center">
                <p className="mb-4">This magic lock requires a simple touch!</p>
                <button onClick={() => unlock(activeLock.id)} className="bg-cyan-500 p-6 rounded-2xl text-white font-bold">Unseal Lock</button>
            </div>
        )}

        <button onClick={() => setGameState(GameState.EXPLORING)} className="text-gray-400 hover:text-gray-600 font-bold">Back to room</button>
      </div>
    );
  };

  const renderVictory = () => (
    <div className="flex flex-col items-center gap-8 animate-bounce-in">
        <h1 className="text-6xl font-black text-yellow-500 drop-shadow-lg text-center">YOU OPENED THE VAULT!</h1>
        <div className="w-full max-w-2xl rounded-[3rem] overflow-hidden border-8 border-yellow-300 shadow-2xl">
            {victoryImg ? <img src={victoryImg} className="w-full h-auto" /> : <div className="h-64 bg-gray-100 flex items-center justify-center">Opening...</div>}
        </div>
        <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white p-6 rounded-full font-bold text-2xl shadow-xl hover:scale-110 transition-all"
        >
            Play Again!
        </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 bg-[#fefae0]">
      <div className="container mx-auto max-w-4xl flex flex-col items-center">
        {loading && (
          <div className="fixed inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
            <div className="w-20 h-20 border-8 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-blue-500">Generating Magic...</p>
          </div>
        )}

        {gameState === GameState.EXPLORING && renderExploration()}
        {gameState === GameState.PUZZLE_DETAIL && renderPuzzle()}
        {gameState === GameState.VICTORY && renderVictory()}
      </div>
    </div>
  );
};

export default App;
