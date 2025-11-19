export enum CardSide {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface Couplet {
  id: string;
  left: string; // Upper sentence (上句)
  right: string; // Lower sentence (下句)
}

export interface GameCard {
  id: string;
  text: string;
  side: CardSide;
  pairId: string; // The ID of the Couplet it belongs to
  isMatched: boolean;
}

export interface LevelData {
  level: number;
  name: string;
  timeLimit: number; // in seconds
  couplets: Couplet[];
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER'
}