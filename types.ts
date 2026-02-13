
export enum LockStatus {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED'
}

export type LockCategory = 
  | 'KEY_RED' | 'KEY_BLUE' | 'KEY_GREEN' 
  | 'AI_MATH' | 'AI_RIDDLE' | 'AI_WORD' | 'AI_LOGIC'
  | 'INTERACT_SEQUENCE' | 'INTERACT_CODE' | 'INTERACT_TOGGLE' | 'INTERACT_CLICK' | 'INTERACT_SHAPE';

export interface Lock {
  id: number;
  category: LockCategory;
  status: LockStatus;
  color: string;
  label: string;
}

export interface AIPuzzle {
  question: string;
  answer: string;
  options?: string[];
  hint?: string;
}

// Missing interface for the QuestCard component
export interface Quest {
  question: string;
  options: string[];
  correctAnswer: string;
}

export enum GameState {
  EXPLORING = 'EXPLORING',
  PUZZLE_DETAIL = 'PUZZLE_DETAIL',
  VICTORY = 'VICTORY'
}
