export type AppStage = 
  | 'AUTH_START'        // Terminal welcome
  | 'AUTH_QUESTIONS'    // 4 comic questions
  | 'AUTH_SUCCESS'      // Identity confirmed & level General
  | 'GAME_PLAY'         // Money catcher arcade
  | 'GAME_VICTORY'      // Arcade victory fireworks
  | 'FINALE_GIFT_PROMPT'// Announcement of secret asset
  | 'FINALE_VIDEO'      // Team greeting video
  | 'FINALE_UNBOX'      // Vault / box opening animation
  | 'FINALE_MUSIC'      // Track playback + Karaoke + Final greeting
  | 'FINAL_GREETING';   // Grand final message & replay button

export interface QuestionOption {
  id: string;
  text: string;
  reaction: string;
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
}

export interface LyricLine {
  id: number;
  time: number; // in seconds
  endTime?: number;
  text: string;
}

export interface DropItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'bag' | 'cash' | 'coin' | 'fine_wb' | 'fine_ozon' | 'return' | 'fee';
  width: number;
  height: number;
  label: string;
  isPositive: boolean;
  points: number;
  isBag?: boolean;
}
