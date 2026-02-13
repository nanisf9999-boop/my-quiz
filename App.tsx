
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Subject, Quest, PlayerStats } from './types';
import { generateQuest, generateRewardImage } from './services/geminiService';
import QuestCard from './components/QuestCard';
import Character from './components/Character';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    score: 0,
    level: 1,
    badges: []
  });
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [rewardImage, setRewardImage] = useState<string | null>(null);

  const startNewQuest = useCallback(async (subject: Subject) => {
    setLoading(true);
    setFeedback(null);
    setSelectedAnswer(null);
    setRewardImage(null);
    setSelectedSubject(subject);
    try {
      const quest = await generateQuest(subject, playerStats.level);
      setCurrentQuest(quest);
      setGameState(GameState.PLAYING);
    } catch (error) {
      alert("Sparky lost the connection to the forest! Let's try again.");
    } finally {
      setLoading(false);
    }
  }, [playerStats.level]);

  const handleAnswer = async (answer: string) => {
    if (!currentQuest) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuest.correctAnswer;

    if (isCorrect) {
      setFeedback("That's right! You're brilliant!");
      setPlayerStats(prev => ({ 
        ...prev, 
        score: prev.score + 10,
        level: prev.score + 10 >= prev.level * 30 ? prev.level + 1 : prev.level
      }));
      
      // Every 3 correct answers, generate a reward
      if ((playerStats.score + 10) % 30 === 0) {
        setLoading(true);
        const img = await generateRewardImage(currentQuest.theme);
        setRewardImage(img);
        setGameState(GameState.REWARD);
        setLoading(false);
      } else {
        setTimeout(() => {
          if (selectedSubject) startNewQuest(selectedSubject);
        }, 2000);
      }
    } else {
      setFeedback(`Oops! Sparky says: ${currentQuest.explanation}`);
      setTimeout(() => {
        if (selectedSubject) startNewQuest(selectedSubject);
      }, 4000);
    }
  };

  const renderStart = () => (
    <div className="flex flex-col items-center gap-10 mt-10 p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-blue-600 drop-shadow-lg mb-2">
          Magic Quest
        </h1>
        <p className="text-xl text-blue-500 font-medium italic">Save the Forest with Sparky!</p>
      </div>
      
      <Character mood="happy" message="Hi! Ready to learn and play?" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {[
          { id: Subject.MATH, label: 'Number Ninja', color: 'bg-red-500', icon: '🔢' },
          { id: Subject.WORDS, label: 'Word Explorer', color: 'bg-green-500', icon: '📖' },
          { id: Subject.NATURE, label: 'Nature Guard', color: 'bg-teal-500', icon: '🌿' },
          { id: Subject.RIDDLES, label: 'Riddle Master', color: 'bg-purple-500', icon: '🤔' },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => startNewQuest(sub.id)}
            className={`${sub.color} p-6 rounded-3xl text-white font-bold text-xl shadow-xl hover:scale-110 transition-transform flex flex-col items-center gap-2 border-b-8 border-black border-opacity-20`}
          >
            <span className="text-4xl">{sub.icon}</span>
            {sub.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderPlaying = () => (
    <div className="flex flex-col items-center gap-8 p-4 w-full">
      <div className="flex justify-between w-full max-w-2xl bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-100">
        <div className="text-blue-600 font-bold">Level: {playerStats.level}</div>
        <div className="text-green-600 font-bold">Score: {playerStats.score}</div>
      </div>

      <Character 
        mood={selectedAnswer ? (selectedAnswer === currentQuest?.correctAnswer ? 'excited' : 'sad') : 'thinking'} 
        message={feedback || "Hmm, let me think about this one..."} 
      />

      {currentQuest && (
        <QuestCard 
          quest={currentQuest} 
          onAnswer={handleAnswer} 
          disabled={!!selectedAnswer} 
          selectedAnswer={selectedAnswer}
        />
      )}
    </div>
  );

  const renderReward = () => (
    <div className="flex flex-col items-center gap-6 p-4">
      <h2 className="text-4xl font-bold text-yellow-600 animate-pulse text-center">
        LEVEL UP REWARD! 🌟
      </h2>
      <div className="w-80 h-80 md:w-96 md:h-96 rounded-3xl border-8 border-yellow-300 shadow-2xl overflow-hidden bg-white">
        {rewardImage ? (
          <img src={rewardImage} alt="Reward" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Loading gift...</div>
        )}
      </div>
      <Character mood="excited" message="WOW! You earned a magical forest sticker!" />
      <button 
        onClick={() => selectedSubject && startNewQuest(selectedSubject)}
        className="bg-yellow-500 text-white px-10 py-4 rounded-full text-2xl font-bold shadow-xl border-b-4 border-yellow-700 hover:scale-105 active:scale-95 transition-all"
      >
        Keep Exploring!
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 max-w-5xl flex flex-col items-center py-8">
        
        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
             <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
             <p className="text-blue-600 font-bold text-xl">Sparky is fetching magic...</p>
          </div>
        )}

        {gameState === GameState.START && renderStart()}
        {gameState === GameState.PLAYING && renderPlaying()}
        {gameState === GameState.REWARD && renderReward()}

        {gameState !== GameState.START && (
          <button 
            onClick={() => setGameState(GameState.START)}
            className="fixed bottom-6 right-6 bg-white text-gray-400 p-4 rounded-full shadow-lg border-2 border-gray-100 hover:text-red-500 hover:border-red-500 transition-colors"
          >
            🏠 Home
          </button>
        )}
      </div>
    </div>
  );
};

export default App;
