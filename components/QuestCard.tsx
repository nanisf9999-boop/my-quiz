
import React from 'react';
import { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
  onAnswer: (answer: string) => void;
  disabled: boolean;
  selectedAnswer: string | null;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onAnswer, disabled, selectedAnswer }) => {
  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-yellow-300 transform transition-all hover:scale-[1.01]">
      <div className="p-8">
        <div className="bg-blue-100 rounded-2xl p-6 mb-8 border-b-4 border-blue-200">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 text-center leading-tight">
            {quest.question}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quest.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === quest.correctAnswer;
            
            let btnClass = "p-4 rounded-2xl text-lg font-semibold transition-all duration-300 border-b-4 ";
            if (disabled) {
               if (isCorrect) {
                 btnClass += "bg-green-500 text-white border-green-700 scale-105 shadow-lg";
               } else if (isSelected) {
                 btnClass += "bg-red-500 text-white border-red-700 opacity-80";
               } else {
                 btnClass += "bg-gray-100 text-gray-400 border-gray-200";
               }
            } else {
               btnClass += "bg-blue-500 hover:bg-blue-400 text-white border-blue-700 hover:-translate-y-1 active:translate-y-0";
            }

            return (
              <button
                key={index}
                onClick={() => onAnswer(option)}
                disabled={disabled}
                className={btnClass}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
