import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type QuestScene, type QuestState, INITIAL_QUEST_STATE } from '../types/quest';
import { loadSavedState, persistState, clearSavedState } from '../utils/storage';
import { soundManager } from '../utils/soundEffects';
import { QUEST_CONFIG } from '../config/questConfig';

interface QuestContextType {
  state: QuestState;
  goToScene: (scene: QuestScene) => void;
  toggleSound: () => void;
  unlockKey: (key: 'key1' | 'key2' | 'key3') => void;
  skipCurrentTrial: () => void;
  resetQuest: () => void;
  
  // Trial 1 handlers
  answerTrial1: (optionId: string) => { isCorrect: boolean; feedback: string };
  retryTrial1Question: () => void;
  
  // Trial 2 handlers
  selectPart: (partId: string | null) => void;
  attemptInstallPart: (partId: string, slotId: string) => boolean;
  
  // Trial 3 handlers
  answerTrial3: (optionId: string) => { reaction: string; verdict: string };
  nextTrial3Situation: () => void;

  // Opening
  openGiftAction: () => void;
}

const QuestContext = createContext<QuestContextType | null>(null);

export const QuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<QuestState>(() => loadSavedState());

  // Синхронизация звука с SoundManager
  useEffect(() => {
    soundManager.setMuted(!state.soundEnabled);
  }, [state.soundEnabled]);

  // Сохранение в localStorage при изменении стейта
  useEffect(() => {
    persistState(state);
  }, [state]);

  const toggleSound = useCallback(() => {
    setState((prev) => {
      const next = !prev.soundEnabled;
      soundManager.setMuted(!next);
      if (next) {
        soundManager.playClick();
      }
      return { ...prev, soundEnabled: next };
    });
  }, []);

  const goToScene = useCallback((scene: QuestScene) => {
    soundManager.playClick();
    setState((prev) => ({ ...prev, currentScene: scene }));
  }, []);

  const unlockKey = useCallback((key: 'key1' | 'key2' | 'key3') => {
    soundManager.playKeyAward();
    setState((prev) => ({
      ...prev,
      keys: {
        ...prev.keys,
        [key]: true,
      },
    }));
  }, []);

  const skipCurrentTrial = useCallback(() => {
    soundManager.playKeyAward();
    setState((prev) => {
      if (prev.currentScene === 'trial1') {
        return {
          ...prev,
          keys: { ...prev.keys, key1: true },
          trial1: { ...prev.trial1, completed: true },
          currentScene: 'trial2',
        };
      }
      if (prev.currentScene === 'trial2') {
        return {
          ...prev,
          keys: { ...prev.keys, key2: true },
          trial2: {
            ...prev.trial2,
            isAssembled: true,
            installedParts: QUEST_CONFIG.trial2_mechanism.parts.map((p) => p.id),
          },
          currentScene: 'trial3',
        };
      }
      if (prev.currentScene === 'trial3') {
        return {
          ...prev,
          keys: { ...prev.keys, key3: true },
          trial3: { ...prev.trial3, completed: true },
          currentScene: 'opening',
        };
      }
      return prev;
    });
  }, []);

  const resetQuest = useCallback(() => {
    clearSavedState();
    setState({
      ...INITIAL_QUEST_STATE,
      soundEnabled: state.soundEnabled,
    });
  }, [state.soundEnabled]);

  // Trial 1: Проверка цитаты
  const answerTrial1 = useCallback(
    (optionId: string) => {
      const currentQ = QUEST_CONFIG.trial1_quotes.questions[state.trial1.currentQuestionIndex];
      const opt = currentQ?.options.find((o) => o.id === optionId);
      if (!opt) return { isCorrect: false, feedback: '' };

      if (opt.isCorrect) {
        soundManager.playSnap();
        const nextIdx = state.trial1.currentQuestionIndex + 1;
        const isFinished = nextIdx >= QUEST_CONFIG.trial1_quotes.questions.length;

        setState((prev) => ({
          ...prev,
          keys: {
            ...prev.keys,
            key1: isFinished ? true : prev.keys.key1,
          },
          trial1: {
            ...prev.trial1,
            currentQuestionIndex: isFinished ? prev.trial1.currentQuestionIndex : nextIdx,
            completed: isFinished,
          },
        }));

        if (isFinished) {
          soundManager.playKeyAward();
        }

        return { isCorrect: true, feedback: opt.feedback };
      } else {
        soundManager.playGentleError();
        setState((prev) => ({
          ...prev,
          trial1: {
            ...prev.trial1,
            mistakeCount: prev.trial1.mistakeCount + 1,
          },
        }));
        return { isCorrect: false, feedback: opt.feedback };
      }
    },
    [state.trial1.currentQuestionIndex]
  );

  const retryTrial1Question = useCallback(() => {
    soundManager.playClick();
  }, []);

  // Trial 2: Механизм
  const selectPart = useCallback((partId: string | null) => {
    soundManager.playClick();
    setState((prev) => ({
      ...prev,
      trial2: {
        ...prev.trial2,
        selectedPartId: prev.trial2.selectedPartId === partId ? null : partId,
      },
    }));
  }, []);

  const attemptInstallPart = useCallback(
    (partId: string, slotId: string) => {
      const part = QUEST_CONFIG.trial2_mechanism.parts.find((p) => p.id === partId);
      if (!part) return false;

      const isMatch = part.targetSlotId === slotId;
      if (isMatch) {
        soundManager.playSnap();
        setState((prev) => {
          const updatedParts = Array.from(new Set([...prev.trial2.installedParts, partId]));
          const allInstalled = updatedParts.length === QUEST_CONFIG.trial2_mechanism.parts.length;
          if (allInstalled) {
            soundManager.playKeyAward();
          }
          return {
            ...prev,
            keys: {
              ...prev.keys,
              key2: allInstalled ? true : prev.keys.key2,
            },
            trial2: {
              ...prev.trial2,
              installedParts: updatedParts,
              selectedPartId: null,
              isAssembled: allInstalled,
            },
          };
        });
        return true;
      } else {
        soundManager.playGentleError();
        return false;
      }
    },
    []
  );

  // Trial 3: Решения
  const answerTrial3 = useCallback(
    (optionId: string) => {
      soundManager.playSnap();
      const currentSit = QUEST_CONFIG.trial3_decisions.situations[state.trial3.currentSituationIndex];
      const opt = currentSit?.options.find((o) => o.id === optionId);
      if (!opt) return { reaction: '', verdict: '' };

      setState((prev) => ({
        ...prev,
        trial3: {
          ...prev.trial3,
          answers: {
            ...prev.trial3.answers,
            [currentSit.id]: optionId,
          },
        },
      }));

      return { reaction: opt.reaction, verdict: opt.verdict };
    },
    [state.trial3.currentSituationIndex]
  );

  const nextTrial3Situation = useCallback(() => {
    soundManager.playClick();
    setState((prev) => {
      const nextIdx = prev.trial3.currentSituationIndex + 1;
      const isFinished = nextIdx >= QUEST_CONFIG.trial3_decisions.situations.length;

      if (isFinished) {
        soundManager.playKeyAward();
      }

      return {
        ...prev,
        keys: {
          ...prev.keys,
          key3: isFinished ? true : prev.keys.key3,
        },
        trial3: {
          ...prev.trial3,
          currentSituationIndex: isFinished ? prev.trial3.currentSituationIndex : nextIdx,
          completed: isFinished,
        },
      };
    });
  }, []);

  const openGiftAction = useCallback(() => {
    soundManager.playOpenFanfare();
    setState((prev) => ({
      ...prev,
      isGiftOpened: true,
      currentScene: 'finale',
    }));
  }, []);

  return (
    <QuestContext.Provider
      value={{
        state,
        goToScene,
        toggleSound,
        unlockKey,
        skipCurrentTrial,
        resetQuest,
        answerTrial1,
        retryTrial1Question,
        selectPart,
        attemptInstallPart,
        answerTrial3,
        nextTrial3Situation,
        openGiftAction,
      }}
    >
      {children}
    </QuestContext.Provider>
  );
};

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
};
