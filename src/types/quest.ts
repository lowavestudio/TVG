export type QuestScene =
  | 'entrance'
  | 'trial1'
  | 'trial2'
  | 'trial3'
  | 'opening'
  | 'finale';

export interface QuestState {
  version: number;
  currentScene: QuestScene;
  keys: {
    key1: boolean; // Авторитет
    key2: boolean; // Точность
    key3: boolean; // Команда
  };
  isGiftOpened: boolean;
  soundEnabled: boolean;
  trial1: {
    currentQuestionIndex: number;
    completed: boolean;
    mistakeCount: number;
  };
  trial2: {
    installedParts: string[]; // IDs of installed parts
    selectedPartId: string | null;
    isAssembled: boolean;
  };
  trial3: {
    currentSituationIndex: number;
    completed: boolean;
    answers: Record<string, string>; // situationId -> optionId
  };
}

export const INITIAL_QUEST_STATE: QuestState = {
  version: 1,
  currentScene: 'entrance',
  keys: {
    key1: false,
    key2: false,
    key3: false,
  },
  isGiftOpened: false,
  soundEnabled: false,
  trial1: {
    currentQuestionIndex: 0,
    completed: false,
    mistakeCount: 0,
  },
  trial2: {
    installedParts: [],
    selectedPartId: null,
    isAssembled: false,
  },
  trial3: {
    currentSituationIndex: 0,
    completed: false,
    answers: {},
  },
};
