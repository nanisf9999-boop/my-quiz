
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  REWARD = 'REWARD',
  GAME_OVER = 'GAME_OVER'
}

export enum Subject {
  MATH = 'MATH',
  WORDS = 'WORDS',
  NATURE = 'NATURE',
  RIDDLES = 'RIDDLES'
}

export interface Quest {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  theme: string;
}

export interface PlayerStats {
  score: number;
  level: number;
  badges: string[];
}
